export default {
    getWebhookCredentials: function (topicType) {
        switch (topicType) {
            case "global":
                return {
                    id: process.env.WEBHOOK_GLOBAL_ID,
                    token: process.env.WEBHOOK_GLOBAL_TOKEN
                }
            case "notice-board":
                return {
                    id: process.env.WEBHOOK_NOTICE_BOARD_ID,
                    token: process.env.WEBHOOK_NOTICE_BOARD_TOKEN
                }
            case "rumors":
                return {
                    id: process.env.WEBHOOK_RUMORS_ID,
                    token: process.env.WEBHOOK_RUMORS_TOKEN
                }
        }
    }
}