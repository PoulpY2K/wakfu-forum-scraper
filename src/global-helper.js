export default {
    getAuthorInfos: function (post) {
        const authorAvatarURL = post.querySelector(".ak-avatar > img").src
        const authorElement = post.querySelector("a.ak-linker-nickname")
        const authorName = authorElement.textContent.trim()
        const authorProfileURL = authorElement.href

        return {
            authorName, authorAvatarURL, authorProfileURL
        }
    }
}