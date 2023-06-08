import chalk from "chalk";
import {JSDOM} from "jsdom";
import TopicCount from "./topic-count.js";

const logger = console

logger.info(chalk.magenta("Successfully loaded scraping script"))


await JSDOM.fromURL("https://www.wakfu.com/fr/forum").then(homepageDom => {
    const mainTopicCount = TopicCount.getMainTopicCount(homepageDom)
    logger.debug(chalk.cyan(`Found ${mainTopicCount} roleplay main topics!`))

    /// TODO: Implement database for real previous value persistence and getter
    const precedentValue = 290

    if(mainTopicCount > precedentValue) {
        const delta = mainTopicCount - precedentValue;
        logger.debug(chalk.red(`Found ${delta} roleplay main topic post difference!`))
    }
});

await JSDOM.fromURL("https://www.wakfu.com/fr/forum/496-histoire-jeu-role").then(rpHomepageDom => {
    logger.debug(chalk.cyan(`Found ${TopicCount.getSignRepliesCount(rpHomepageDom)} notice board replies!`))
    logger.debug(chalk.cyan(`Found ${TopicCount.getRumorsRepliesCount(rpHomepageDom)} rumors replies!`))
});