import chalk from "chalk";
import {JSDOM} from "jsdom";
import {Colors} from "discord.js";
import moment from "moment";
import _ from "lodash";

import TopicHelper from "./topic-helper.js";
import DiscordHelper from "./discord-helper.js";
import Constants from "./constants.js";
import ReplyHelper from "./reply-helper.js";

const logger = console
const sendNewTopicReplyUpdate = async (rpHomepageDom, titleElement, delta) => {
    const noticeBoardTitle = titleElement.textContent.trim();
    const noticeBoardTitleURL = titleElement.href;

    await JSDOM.fromURL(noticeBoardTitleURL).then(async (noticeBoardDom) => {
        const repliesLastPageLink = ReplyHelper.getRepliesLastPageLink(noticeBoardDom)

        await JSDOM.fromURL(repliesLastPageLink).then((noticeBoardLastPageDom) => {
            const newReplies = ReplyHelper.getNewReplies(noticeBoardLastPageDom, delta)

            for (const reply of newReplies) {
                const {
                    authorName,
                    authorProfileURL,
                    authorAvatarURL,
                    date,
                    text
                } = ReplyHelper.getReplyContent(reply)

                /// TODO: Create discord bot that creates a webhook to use in order to have button links
                DiscordHelper.getWebhookClient(process.env.WEBHOOK_NOTICE_BOARD_ID, process.env.WEBHOOK_NOTICE_BOARD_TOKEN).send({
                    username: Constants.WEBHOOK_NAME,
                    avatarURL: Constants.WEBHOOK_PFP_URL,
                    embeds: [DiscordHelper.createEmbed(noticeBoardTitle, repliesLastPageLink, text.substring(0, Constants.EMBED_DESCRIPTION_LENGTH_LIMIT / 8) + "...", {
                        name: authorName,
                        iconURL: authorAvatarURL,
                        url: authorProfileURL
                    }, moment(date, Constants.WAKFU_DATE_FORMAT).toDate(), {text: _.unescape(noticeBoardTitle)}, Colors.Yellow)],
                });
            }
        });
    })
}
export default {
    sendNewGlobalTopicUpdate: async function (homepageDom, rpHomepageDom, delta) {
        logger.debug(chalk.red(`Found ${delta} roleplay main topic post difference!`))

        const mainTopicTitle = homepageDom.window.document.body
            .querySelectorAll("[data-panel-id='493'] tbody > tr")[2]
            .querySelector(".ak-title-thread a").innerHTML.trim();

        const newTopics = TopicHelper.getNewTopics(rpHomepageDom, delta)
        for (const topic of newTopics) {
            const {
                title,
                topicLink,
                authorName,
                authorAvatarURL,
                authorProfileURL,
                date
            } = TopicHelper.getTopicInfos(topic)
            await JSDOM.fromURL(topicLink).then(postPageDom => {
                const document = postPageDom.window.document;
                const postTextContent = document.body.querySelector(".ak-item-mid > .ak-text").textContent.trim()

                /// TODO: Create discord bot that creates a webhook to use in order to have button links
                DiscordHelper.getWebhookClient(process.env.WEBHOOK_GLOBAL_ID, process.env.WEBHOOK_GLOBAL_TOKEN).send({
                    username: Constants.WEBHOOK_NAME,
                    avatarURL: Constants.WEBHOOK_PFP_URL,
                    embeds: [DiscordHelper.createEmbed(title, topicLink, postTextContent.substring(0, Constants.EMBED_DESCRIPTION_LENGTH_LIMIT / 8) + "...", {
                        name: authorName,
                        iconURL: authorAvatarURL,
                        url: authorProfileURL
                    }, moment(date, Constants.WAKFU_DATE_FORMAT).toDate(), {text: _.unescape(mainTopicTitle)}, Colors.Yellow)],
                });
            })
        }

        return delta.length;
    },
    sendNewNoticeBoardTopicUpdate: async function (rpHomepageDom, delta) {
        logger.debug(chalk.red(`Found ${delta} notice board replies difference!`))

        const noticeBoardTitleElement = rpHomepageDom.window.document.body
            .querySelectorAll("tr.ak-pinned-topic")[0]
            .querySelector("a.ak-title-topic")

        await sendNewTopicReplyUpdate(rpHomepageDom, noticeBoardTitleElement, delta);

        return delta.length;
    },
    sendNewRumorsTopicUpdate: async function (rpHomepageDom, delta) {
        logger.debug(chalk.red(`Found ${delta} rumors replies difference!`))

        const rumorsTitleElement = rpHomepageDom.window.document.body
            .querySelectorAll("tr.ak-pinned-topic")[1]
            .querySelector("a.ak-title-topic")

        await sendNewTopicReplyUpdate(rpHomepageDom, rumorsTitleElement, delta);

        return delta.length;
    }
}