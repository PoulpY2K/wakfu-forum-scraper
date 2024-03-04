import "dotenv/config"

import chalk from "chalk";
import {JSDOM} from "jsdom";
import moment from "moment";
import schedule from "node-schedule";
import {PrismaClient} from '@prisma/client'

import TopicHelper from "./helper/topic-helper.js";
import ReplyHelper from "./helper/reply-helper.js";
import UpdateHelper from "./helper/update-helper.js";
import Constants from "./constants.js";
import Topics from "./topics.js";
import Database from "./database.js";
import DatabaseHelper from "./helper/database-helper.js";

moment.locale("fr")

const logger = console
const prisma = new PrismaClient()

await Database.init(prisma)
    .then(async () => {
        logger.info(`${moment().format()} ${chalk.green("Successfully loaded database.")}`)
    })
    .catch(async (e) => {
        logger.error(`${moment().format()} ${chalk.red(e.stack)}`)
        await prisma.$disconnect()
        process.exit(1)
    })

logger.info(`${moment().format()} ${chalk.magenta("Wakfu Forum Scraper is ready. Executing job every 10th minute.")}`)
schedule.scheduleJob(Constants.CRONJOB_PATTERN, async () => {
    logger.info(`${moment().format()} ${chalk.magenta("Starting job...")}`)

    await main()
        .then(async () => {
            logger.info(`${moment().format()} ${chalk.green("Successfully executed job.")}`)
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            logger.error(`${moment().format()} ${chalk.red(e.stack)}`)
            await prisma.$disconnect()
            process.exit(1)
        });
});

const main = async () => {
    const allTopics = await prisma.topic.findMany()
    const allFormatedTopics = []
    for (const topic of allTopics) {
        allFormatedTopics[topic.name] = topic
    }

    await JSDOM.fromURL(Constants.WAKFU_FORUM_URL).then(async homepageDom => {
        const globalTopicCount = TopicHelper.getGlobalTopicCount(homepageDom)

        let databaseGlobalTopic = allFormatedTopics[Topics.Global]
        // Update count in database on database initialisation
        if (databaseGlobalTopic.count === 0) {
            databaseGlobalTopic.count = +globalTopicCount
            databaseGlobalTopic = await DatabaseHelper.updateTopicCount(prisma, databaseGlobalTopic)
        }

        const oldGlobalTopicReplies = databaseGlobalTopic.count
        const deltaGlobalTopicReplies = globalTopicCount - oldGlobalTopicReplies;

        await JSDOM.fromURL(Constants.WAKFU_FORUM_RP_URL).then(async rpHomepageDom => {
            const noticeBoardTopicCount = ReplyHelper.getNoticeBoardRepliesCount(rpHomepageDom)

            let databaseNoticeBoardTopic = allFormatedTopics[Topics.NoticeBoard]
            // Update count in database on database initialisation
            if (databaseNoticeBoardTopic.count === 0) {
                databaseNoticeBoardTopic.count = +noticeBoardTopicCount
                databaseNoticeBoardTopic = await DatabaseHelper.updateTopicCount(prisma, databaseNoticeBoardTopic)
            }

            const oldNoticeBoardTopicReplies = databaseNoticeBoardTopic.count
            const deltaNoticeBoardTopicReplies = noticeBoardTopicCount - oldNoticeBoardTopicReplies;

            const rumorsTopicCount = ReplyHelper.getRumorsRepliesCount(rpHomepageDom)

            let databaseRumorsTopic = allFormatedTopics[Topics.Rumors]
            // Update count in database on database initialisation
            if (databaseRumorsTopic.count === 0) {
                databaseRumorsTopic.count = +rumorsTopicCount
                databaseRumorsTopic = await DatabaseHelper.updateTopicCount(prisma, databaseRumorsTopic)
            }

            const oldRumorsTopicReplies = databaseRumorsTopic.count;
            const deltaRumorsTopicReplies = rumorsTopicCount - oldRumorsTopicReplies;

            if (deltaGlobalTopicReplies > 0) {
                await UpdateHelper.sendNewGlobalTopicUpdate(homepageDom, rpHomepageDom, Topics.Global, deltaGlobalTopicReplies)
                    .then(async (updateCount) => {
                        databaseGlobalTopic.count = +globalTopicCount;
                        await DatabaseHelper.updateTopicCount(prisma, databaseGlobalTopic);
                        logger.info(`${moment().format()} ${chalk.greenBright(`Successfully sent ${updateCount} global topic updates!`)}`)
                    })
                    .catch((e) => logger.error(`${moment().format()} ${chalk.red(e.stack)}`));
            }

            if (deltaNoticeBoardTopicReplies > 0) {
                await UpdateHelper.sendNewNoticeBoardTopicUpdate(rpHomepageDom, deltaNoticeBoardTopicReplies)
                    .then(async (updateCount) => {
                        databaseNoticeBoardTopic.count = +noticeBoardTopicCount;
                        await DatabaseHelper.updateTopicCount(prisma, databaseNoticeBoardTopic);
                        logger.info(`${moment().format()} ${chalk.greenBright(`Successfully sent ${updateCount} notice board updates!`)}`)
                    })
                    .catch((e) => logger.error(`${moment().format()} ${chalk.red(e.stack)}`));
            }

            if (deltaRumorsTopicReplies > 0) {
                await UpdateHelper.sendNewRumorsTopicUpdate(rpHomepageDom, deltaRumorsTopicReplies)
                    .then(async (updateCount) => {
                        databaseRumorsTopic.count = +rumorsTopicCount;
                        await DatabaseHelper.updateTopicCount(prisma, databaseRumorsTopic);
                        logger.info(`${moment().format()} ${chalk.greenBright(`Successfully sent ${updateCount} rumors updates!`)}`)
                    })
                    .catch((e) => logger.error(`${moment().format()} ${chalk.red(e.stack)}`));
            }
        });
    });
}