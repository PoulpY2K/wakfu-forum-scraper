import chalk from "chalk";
import {JSDOM} from "jsdom";
import {Colors} from "discord.js";
import moment from "moment";
import _ from "lodash";

import TopicHelper from "./topic-helper.js";
import DiscordHelper from "./discord-helper.js";
import Constants from "../constants.js";
import ReplyHelper from "./reply-helper.js";
import CredentialsHelper from "./credentials-helper.js";
import Topics from "../topics.js";

const logger = console

moment.locale("fr")

const formatToWakfuDate = (date) => {
    if (date.includes("Aujourd'hui")) {
        date = date.replace(/Aujourd'hui/, moment().format('DD MMMM YYYY'))
    } else if (date.includes("Hier")) {
        date = date.replace(/Hier/, moment().subtract(1, 'days').format('DD MMMM YYYY'))
    }

    return moment(date, Constants.WAKFU_DATE_FORMAT)
}

const sendNewTopicReplyUpdate = async (rpHomepageDom, topicType, titleElement, delta) => {
    const noticeBoardTitle = titleElement.textContent.trim();
    const noticeBoardTitleURL = titleElement.href;

    await JSDOM.fromURL(noticeBoardTitleURL).then(async (noticeBoardDom) => {
        const repliesLastPageLink = ReplyHelper.getRepliesLastPageLink(noticeBoardDom)

        await JSDOM.fromURL(repliesLastPageLink).then(async noticeBoardLastPageDom => {
            const newReplies = ReplyHelper.getNewReplies(noticeBoardLastPageDom, delta)

            const webhookCredentials = CredentialsHelper.getWebhookCredentials(topicType)
            const webhookClient = await DiscordHelper.getWebhookClient(webhookCredentials.id, webhookCredentials.token)

            for (const reply of newReplies) {
                let {
                    authorName, authorProfileURL, authorAvatarURL, date, text, image
                } = ReplyHelper.getReplyContent(reply)

                const formattedDate = formatToWakfuDate(date)

                const embed = DiscordHelper.createEmbed(noticeBoardTitle, repliesLastPageLink, text.substring(0, Constants.EMBED_DESCRIPTION_LENGTH_LIMIT / 8).trim() + "...", {
                    name: authorName,
                    ///TODO: Fonctionnalité désactivée le temps qu'Ankama se décide à avoir un vrai serveur pour héberger ses images
                    //iconURL: authorAvatarURL,
                    url: authorProfileURL
                }, formattedDate.toDate(), {text: topicType === Topics.NoticeBoard ? "Tableau d'affichage" : "Rumeurs"}, topicType === Topics.NoticeBoard ? Colors.White : Colors.DarkBlue, image)

                /// TODO: Create discord bot that creates a webhook to use in order to have button links
                await webhookClient.send({
                    username: Constants.WEBHOOK_NAME,
                    avatarURL: Constants.WEBHOOK_PFP_URL,
                    embeds: [embed],
                });
            }
        });
    })
}
export default {
    sendNewGlobalTopicUpdate: async function (homepageDom, rpHomepageDom, topicType, delta) {
        logger.debug(`${moment().format()} ${chalk.red(`Found ${delta} roleplay main topic post difference!`)}`)

        const mainTopicTitle = homepageDom.window.document.body
            .querySelectorAll("[data-panel-id='493'] tbody > tr")[2]
            .querySelector(".ak-title-thread a").innerHTML.trim();

        const newTopics = TopicHelper.getNewTopics(rpHomepageDom, delta)

        const webhookCredentials = CredentialsHelper.getWebhookCredentials(topicType)
        const webhookClient = await DiscordHelper.getWebhookClient(webhookCredentials.id, webhookCredentials.token)

        for (const topic of newTopics) {
            let {
                title, topicLink, authorName, authorAvatarURL, authorProfileURL, date
            } = TopicHelper.getTopicInfos(topic)

            const formattedDate = formatToWakfuDate(date)

            await JSDOM.fromURL(topicLink).then(async postPageDom => {
                const document = postPageDom.window.document;
                const postText = document.body.querySelector(".ak-item-mid > .ak-text")
                const postTextContent = postText.textContent
                const postImage = postText.querySelector(".ak-bbcode-image > img")?.src

                const embed = DiscordHelper.createEmbed(title, topicLink, postTextContent.substring(0, Constants.EMBED_DESCRIPTION_LENGTH_LIMIT / 8).trim() + "...", {
                    name: authorName,
                    ///TODO: Fonctionnalité désactivée le temps qu'Ankama se décide à avoir un vrai serveur pour héberger ses images
                    //iconURL: authorAvatarURL,
                    url: authorProfileURL
                }, formattedDate.toDate(), {text: _.unescape(mainTopicTitle)}, Colors.Yellow, postImage)

                /// TODO: Create discord bot that creates a webhook to use in order to have button links
                const message = await webhookClient.send({
                    username: Constants.WEBHOOK_NAME,
                    avatarURL: Constants.WEBHOOK_PFP_URL,
                    embeds: [embed],
                });
            })
        }

        return delta;
    }, sendNewNoticeBoardTopicUpdate: async function (rpHomepageDom, delta) {
        logger.debug(`${moment().format()} ${chalk.red(`Found ${delta} notice board replies difference!`)}`)

        const pinnedTopics = rpHomepageDom.window.document.body
            .querySelectorAll("tr.ak-pinned-topic")

        const noticeBoardTitleElement = Array.from(pinnedTopics)
            .find(el => el.querySelector("a.ak-title-topic").textContent.trim() === Constants.WAKFU_FORUM_NOTICE_BOARD_TITLE)
            .querySelector("a.ak-title-topic")

        await sendNewTopicReplyUpdate(rpHomepageDom, Topics.NoticeBoard, noticeBoardTitleElement, delta);

        return delta;
    }, sendNewRumorsTopicUpdate: async function (rpHomepageDom, delta) {
        logger.debug(`${moment().format()} ${chalk.red(`Found ${delta} rumors replies difference!`)}`)

        const pinnedTopics = rpHomepageDom.window.document.body
            .querySelectorAll("tr.ak-pinned-topic")

        const rumorsTitleElement = Array.from(pinnedTopics)
            .find(el => el.querySelector("a.ak-title-topic").textContent.trim() === Constants.WAKFU_FORUM_RUMORS_TITLE)
            .querySelector("a.ak-title-topic")

        await sendNewTopicReplyUpdate(rpHomepageDom, Topics.Rumors, rumorsTitleElement, delta);

        return delta;
    }
}
