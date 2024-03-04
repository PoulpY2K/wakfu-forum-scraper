import chalk from "chalk";
import GlobalHelper from "./global-helper.js";
import moment from "moment";

const logger = console;

moment.locale("fr")

export default {
    getGlobalTopicCount: function (homepageDom) {
        const document = homepageDom.window.document;
        const rpCells = document.body
            .querySelectorAll("[data-panel-id='493'] tbody > tr")[2]
            .querySelectorAll("td")

        const globalTopicCount = +rpCells[2].innerHTML;
        logger.debug(`${moment().format()} ${chalk.cyan(`Found ${globalTopicCount} roleplay main topics!`)}`)

        return globalTopicCount;
    },
    getNewTopics: function (rpHomepageDom, delta) {
        const document = rpHomepageDom.window.document;
        const topics = document.body.querySelectorAll("tr:not(.ak-pinned-topic):not(.ak-bg-odd)")
        return Array.from(topics).slice(1, delta + 1)
    },
    getTopicInfos: function (topic) {
        const {authorName, authorProfileURL, authorAvatarURL} = GlobalHelper.getAuthorInfos(topic)

        const date = topic.querySelector(".ak-desc-topic").childNodes[2].textContent.trim()

        const titleElement = topic.querySelector("a.ak-title-topic")
        const topicLink = titleElement.href
        const title = titleElement.textContent.trim()

        return {
            title, topicLink, authorName, authorProfileURL, authorAvatarURL, date,
        }
    }
}