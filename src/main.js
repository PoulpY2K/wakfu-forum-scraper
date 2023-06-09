import 'dotenv/config'

import chalk from "chalk";
import {JSDOM} from "jsdom";
import moment from "moment";

import TopicHelper from "./topic-helper.js";
import UpdateHelper from "./update-helper.js";

moment.locale("fr")

const logger = console
logger.info(chalk.magenta("Successfully loaded scraping script"))

const main = async () => {
    await JSDOM.fromURL("https://www.wakfu.com/fr/forum").then(async homepageDom => {
        const globalTopicCount = TopicHelper.getGlobalTopicCount(homepageDom)
        logger.debug(chalk.cyan(`Found ${globalTopicCount} roleplay main topics!`))

        /// TODO: Implement database for real previous value persistence and getter
        const oldGlobalTopicReplies = 290
        const deltaGlobalTopicReplies = globalTopicCount - oldGlobalTopicReplies;

        await JSDOM.fromURL("https://www.wakfu.com/fr/forum/496-histoire-jeu-role").then(async rpHomepageDom => {
            /*
            const noticeBoardTopicCount = TopicHelper.getSignRepliesCount(rpHomepageDom)
            logger.debug(chalk.cyan(`Found ${noticeBoardTopicCount} notice board replies!`))
            const oldNoticeBoardTopicReplies = 759

            const rumorsTopicCount = TopicHelper.getRumorsRepliesCount(rpHomepageDom)
            logger.debug(chalk.cyan(`Found ${rumorsTopicCount} rumors replies!`))
            const oldRumorsTopicReplies = 496
             */

            if (deltaGlobalTopicReplies > 0) {
                logger.debug(chalk.red(`Found ${deltaGlobalTopicReplies} roleplay main topic post difference!`))
                await UpdateHelper.sendNewGlobalTopicUpdate(homepageDom, rpHomepageDom, deltaGlobalTopicReplies);
            }
        });
    });
}

await main()
    .then(() => logger.info(chalk.green("Successfully executed scraping script")))
    .catch((e) => logger.error(chalk.red(e)));