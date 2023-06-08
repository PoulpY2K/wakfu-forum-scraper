const getPinnedTopics = (dom) => {
    const document = dom.window.document
    return document.body.querySelectorAll("tr.ak-pinned-topic")
}
export default {
    getMainTopicCount: function (homepageDom) {
        const document = homepageDom.window.document;

        const dathuraTable = document.body.querySelector("[data-panel-id='493']")
        const rpRow = dathuraTable.querySelectorAll("tr")[3]
        const rpDataList = rpRow.querySelectorAll("td")

        return +rpDataList[2].innerHTML;
    },
    getSignRepliesCount: function (rpHomepageDom) {
        const pinnedTopics = getPinnedTopics(rpHomepageDom)
        return pinnedTopics[0].querySelectorAll("td")[1].innerHTML;
    },
    getRumorsRepliesCount: function (rpHomepageDom) {
        const pinnedTopics = getPinnedTopics(rpHomepageDom)
        return pinnedTopics[1].querySelectorAll("td")[1].innerHTML;
    }
}