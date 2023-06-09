import chalk from "chalk";

import Topics from "./topics.js";

const logger = console

export default {
    init: async function (client) {
        const topics = []

        const databaseTopics = await client.topic.findMany()
        for (const topic of Object.values(Topics)) {
            const databaseTopicIndex = databaseTopics.findIndex(databaseTopic => databaseTopic.name === topic);
            if (databaseTopicIndex >= 0) {
                topics.push(databaseTopics[databaseTopicIndex])
            } else {
                const newTopic = await client.topic.create({
                    data: {
                        name: topic, count: 0
                    }
                })

                topics.push(newTopic);
                console.log(chalk.blueBright(`Created ${topic} entry in database`))
            }
        }

        logger.table(topics)

        return topics;
    }
}