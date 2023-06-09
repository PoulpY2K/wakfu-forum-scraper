const getPinnedTopics = (dom) => {
    const document = dom.window.document
    return document.body.querySelectorAll("tr.ak-pinned-topic")
}
export default {
    getGlobalTopicCount: function (homepageDom) {
        const document = homepageDom.window.document;
        const rpCells = document.body
            .querySelectorAll("[data-panel-id='493'] tbody > tr")[2]
            .querySelectorAll("td")

        return +rpCells[2].innerHTML;
    },
    getSignRepliesCount: function (rpHomepageDom) {
        const pinnedTopics = getPinnedTopics(rpHomepageDom)
        return pinnedTopics[0].querySelectorAll("td")[1].innerHTML;
    },
    getRumorsRepliesCount: function (rpHomepageDom) {
        const pinnedTopics = getPinnedTopics(rpHomepageDom)
        return pinnedTopics[1].querySelectorAll("td")[1].innerHTML;
    },
    getNewTopics: function (rpHomepageDom, delta) {
        const document = rpHomepageDom.window.document;
        const topics = document.body.querySelectorAll("tr:not(.ak-pinned-topic):not(.ak-bg-odd)")
        return Array.from(topics).slice(1, delta + 1)
    },
    getTopicInfos: function (topic) {
        const authorAvatarURL = topic.querySelector(".ak-avatar > img").src
        const authorElement = topic.querySelector("a.ak-linker-nickname")
        const authorName = authorElement.textContent.trim()
        const authorProfileURL = authorElement.href

        const date = topic.querySelector(".ak-desc-topic").childNodes[2].textContent.trim()

        const titleElement = topic.querySelector("a.ak-title-topic")
        const topicLink = titleElement.href
        const title = titleElement.textContent.trim()

        return {
            title, topicLink, authorName, authorProfileURL, authorAvatarURL, date,
        }
    }
}