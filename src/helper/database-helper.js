export default {
    updateTopicCount: async function (client, topic) {
        topic = await client.topic.update({
            where: {
                name: topic.name,
            },
            data: {
                count: topic.count
            }
        })

        return topic;
    }
}