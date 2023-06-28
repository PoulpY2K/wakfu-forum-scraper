import chalk from "chalk";
import GlobalHelper from "./global-helper.js";
import Constants from "../constants.js";

const logger = console;
const getPinnedTopics = (dom) => {
    const document = dom.window.document
    return document.body.querySelectorAll("tr.ak-pinned-topic")
}
export default {
    getNoticeBoardRepliesCount: function (rpHomepageDom) {
        const pinnedTopics = getPinnedTopics(rpHomepageDom)

        const noticeBoardTopicCount = Array.from(pinnedTopics)
            .find(el => el.querySelector("a.ak-title-topic").textContent.trim() === Constants.WAKFU_FORUM_NOTICE_BOARD_TITLE)
            .querySelectorAll("td")[1].innerHTML

        logger.debug(chalk.cyan(`Found ${noticeBoardTopicCount} notice board replies!`))

        return noticeBoardTopicCount;
    }, getRumorsRepliesCount: function (rpHomepageDom) {
        const pinnedTopics = getPinnedTopics(rpHomepageDom)

        const rumorsTopicCount = Array.from(pinnedTopics)
            .find(el => el.querySelector("a.ak-title-topic").textContent.trim() === Constants.WAKFU_FORUM_RUMORS_TITLE)
            .querySelectorAll("td")[1].innerHTML;

        logger.debug(chalk.cyan(`Found ${rumorsTopicCount} rumors replies!`))

        return rumorsTopicCount;
    }, getRepliesLastPageLink: function (dom) {
        const document = dom.window.document;
        const paginationElement = document.body
            .querySelectorAll("ul.ak-pagination.pagination")[0]
            .querySelectorAll("li:not(.disabled):not([class^='page-']) a")[0]
        return paginationElement.href;
    }, getNewReplies: function (dom, delta) {
        const document = dom.window.document;
        const recentReplies = document.body.querySelectorAll("div.ak-container.ak-panel.ak-comments-list > div.ak-panel-content > div.ak-post")
        return Array.from(recentReplies).slice(-delta);
    }, getReplyContent: function (reply) {
        const {authorName, authorProfileURL, authorAvatarURL} = GlobalHelper.getAuthorInfos(reply)

        const date = reply.querySelector(".ak-post-infos span.ak-date").textContent.trim()

        const text = reply.querySelector(".ak-text").textContent

        return {
            authorName, authorProfileURL, authorAvatarURL, date, text
        }
    }
}