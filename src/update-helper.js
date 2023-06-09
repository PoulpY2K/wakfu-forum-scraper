import chalk from "chalk";
import {JSDOM} from "jsdom";
import {Colors} from "discord.js";
import moment from "moment";
import _ from "lodash";

import TopicHelper from "./topic-helper.js";
import DiscordHelper from "./discord-helper.js";
import Constants from "./constants.js";

const logger = console
export default {
    sendNewGlobalTopicUpdate: async function (homepageDom, rpHomepageDom, delta) {
        const mainTopicTitle = homepageDom.window.document.body
            .querySelectorAll("[data-panel-id='493'] tbody > tr")[2]
            .querySelector(".ak-title-thread a").innerHTML.trim();

        const newTopics = TopicHelper.getNewTopics(rpHomepageDom, delta)
        for (const topic of newTopics) {
            const topicInfos = TopicHelper.getTopicInfos(topic)
            await JSDOM.fromURL(topicInfos.topicLink).then(postPageDom => {
                const document = postPageDom.window.document;
                const postTextContent = document.body.querySelector(".ak-item-mid > .ak-text").textContent

                /// TODO: Create discord bot that creates a webhook to use in order to have button links
                DiscordHelper.getWebhookClient(process.env.WEBHOOK_OTHER_ID, process.env.WEBHOOK_OTHER_TOKEN).send({
                    username: Constants.WEBHOOK_NAME,
                    avatarURL: Constants.WEBHOOK_PFP_URL,
                    embeds: [DiscordHelper.createEmbed(topicInfos.title, topicInfos.topicLink, postTextContent.substring(0, Constants.EMBED_DESCRIPTION_LENGTH_LIMIT / 8) + "...", {
                        name: topicInfos.authorName,
                        iconURL: topicInfos.authorAvatarURL,
                        url: topicInfos.authorProfileURL
                    }, moment(topicInfos.date, Constants.WAKFU_DATE_FORMAT).toDate(), {text: _.unescape(mainTopicTitle)}, Colors.Yellow)],
                });
            })
        }
    }
}