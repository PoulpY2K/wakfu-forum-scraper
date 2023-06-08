const privateFunc = () => {
}
export default {
    getNewPosts: function (rpHomepageDom, delta) {
        const document = rpHomepageDom.window.document;
        const topics = document.body.querySelectorAll("tr:not(.ak-pinned-topic):not(.ak-bg-odd)")
        return Array.from(topics).slice(1, delta + 1)
    },
}