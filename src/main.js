import "dotenv/config"

import chalk from "chalk";
import {JSDOM} from "jsdom";
import moment from "moment";

import TopicHelper from "./helper/topic-helper.js";
import ReplyHelper from "./helper/reply-helper.js";
import UpdateHelper from "./helper/update-helper.js";
import Constants from "./constants.js";
import Topics from "./topics.js";

moment.locale("fr")

const logger = console
logger.info(chalk.magenta("Successfully loaded scraping script"))

const main = async () => {
    await JSDOM.fromURL(Constants.WAKFU_FORUM_URL).then(async homepageDom => {
        const globalTopicCount = TopicHelper.getGlobalTopicCount(homepageDom)
        /// TODO: Implement database for real previous value persistence and getter
        const oldGlobalTopicReplies = 290
        const deltaGlobalTopicReplies = globalTopicCount - oldGlobalTopicReplies;

        await JSDOM.fromURL(Constants.WAKFU_FORUM_RP_URL).then(async rpHomepageDom => {
            const noticeBoardTopicCount = ReplyHelper.getNoticeBoardRepliesCount(rpHomepageDom)
            /// TODO: Implement database for real previous value persistence and getter
            const oldNoticeBoardTopicReplies = 759
            const deltaNoticeBoardTopicReplies = noticeBoardTopicCount - oldNoticeBoardTopicReplies;

            const rumorsTopicCount = ReplyHelper.getRumorsRepliesCount(rpHomepageDom)
            /// TODO: Implement database for real previous value persistence and getter
            const oldRumorsTopicReplies = 496;
            const deltaRumorsTopicReplies = rumorsTopicCount - oldRumorsTopicReplies;

            if (deltaGlobalTopicReplies > 0) {
                await UpdateHelper.sendNewGlobalTopicUpdate(homepageDom, rpHomepageDom, Topics.Global, deltaGlobalTopicReplies)
                    .then((updateCount) => logger.info(chalk.greenBright(`Successfully sent ${updateCount} global topic updates!`)))
                    .catch((e) => logger.error(chalk.red(e.stack)));
            }

            if (deltaNoticeBoardTopicReplies > 0) {
                await UpdateHelper.sendNewNoticeBoardTopicUpdate(rpHomepageDom, deltaNoticeBoardTopicReplies)
                    .then((updateCount) => logger.info(chalk.greenBright(`Successfully sent ${updateCount} notice board updates!`)))
                    .catch((e) => logger.error(chalk.red(e.stack)));
            }

            if (deltaRumorsTopicReplies > 0) {
                await UpdateHelper.sendNewRumorsTopicUpdate(rpHomepageDom, deltaRumorsTopicReplies)
                    .then((updateCount) => logger.info(chalk.greenBright(`Successfully sent ${updateCount} rumors updates!`)))
                    .catch((e) => logger.error(chalk.red(e.stack)));
            }
        });
    });
}

main()
    .then(() => logger.info(chalk.green("Successfully executed scraping script")))
    .catch((e) => logger.error(chalk.red(e.stack)));