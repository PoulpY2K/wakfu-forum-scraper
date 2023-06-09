import 'dotenv/config'

import chalk from "chalk";
import {JSDOM} from "jsdom";
import moment from "moment";
import _ from "lodash";
import {Colors} from "discord.js";

import TopicHelper from "./topic-helper.js";
import Constants from "./constants.js";
import DiscordHelper from "./discord-helper.js";

moment.locale("fr")

const logger = console
logger.info(chalk.magenta("Successfully loaded scraping script"))

await JSDOM.fromURL("https://www.wakfu.com/fr/forum").then(async homepageDom => {
    const mainTopicCount = TopicHelper.getMainTopicCount(homepageDom)
    logger.debug(chalk.cyan(`Found ${mainTopicCount} roleplay main topics!`))

    /// TODO: Implement database for real previous value persistence and getter
    const precedentValue = 290

    await JSDOM.fromURL("https://www.wakfu.com/fr/forum/496-histoire-jeu-role").then(async rpHomepageDom => {
        /*const noticeBoardTopicCount = TopicHelper.getSignRepliesCount(rpHomepageDom)
        logger.debug(chalk.cyan(`Found ${noticeBoardTopicCount} notice board replies!`))

        const rumorsTopicCount = TopicHelper.getRumorsRepliesCount(rpHomepageDom)
        logger.debug(chalk.cyan(`Found ${rumorsTopicCount} rumors replies!`))*/

        if (mainTopicCount > precedentValue) {
            const delta = mainTopicCount - precedentValue;
            logger.debug(chalk.red(`Found ${delta} roleplay main topic post difference!`))

            const mainTopicTitle = homepageDom.window.document.body
                .querySelectorAll("[data-panel-id='493'] tbody > tr")[2]
                .querySelector(".ak-title-thread a").innerHTML.trim();

            const newPosts = TopicHelper.getNewTopics(rpHomepageDom, delta)
            for (const topic of newPosts) {
                const topicInfos = TopicHelper.getTopicInfos(topic)
                await JSDOM.fromURL(topicInfos.topicLink).then(postPageDom => {
                    const document = postPageDom.window.document;
                    const postTextContent = document.body.querySelector(".ak-item-mid > .ak-text").textContent

                    /// TODO: Create discord bot that creates a webhook to use in order to have button links
                    DiscordHelper.getWebhookClient(process.env.WEBHOOK_OTHER_ID, process.env.WEBHOOK_OTHER_TOKEN).send({
                        username: Constants.WEBHOOK_NAME,
                        avatarURL: Constants.WEBHOOK_PFP_URL,
                        embeds: [
                            DiscordHelper.createEmbed(
                                topicInfos.title,
                                topicInfos.topicLink,
                                postTextContent.substring(0, Constants.EMBED_DESCRIPTION_LENGTH_LIMIT / 8) + "...",
                                {
                                    name: topicInfos.authorName,
                                    iconURL: topicInfos.authorAvatarURL,
                                    url: topicInfos.authorProfileURL
                                },
                                moment(topicInfos.date, Constants.WAKFU_DATE_FORMAT).toDate(),
                                {text: _.unescape(mainTopicTitle)},
                                Colors.LuminousVividPink)
                        ],
                    });
                })
            }
        }
    });
});