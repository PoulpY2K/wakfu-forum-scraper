import 'dotenv/config'

import chalk from "chalk";
import {JSDOM} from "jsdom";
import TopicCount from "./topic-count.js";
import NewPost from "./new-post.js"
import {EmbedBuilder, WebhookClient} from "discord.js";

const logger = console
logger.info(chalk.magenta("Successfully loaded scraping script"))

await JSDOM.fromURL("https://www.wakfu.com/fr/forum").then(async homepageDom => {
    const mainTopicCount = TopicCount.getMainTopicCount(homepageDom)
    logger.debug(chalk.cyan(`Found ${mainTopicCount} roleplay main topics!`))

    /// TODO: Implement database for real previous value persistence and getter
    const precedentValue = 288

    if (mainTopicCount > precedentValue) {
        const delta = mainTopicCount - precedentValue;
        logger.debug(chalk.red(`Found ${delta} roleplay main topic post difference!`))

        await JSDOM.fromURL("https://www.wakfu.com/fr/forum/496-histoire-jeu-role").then(async rpHomepageDom => {
            const newPosts = NewPost.getNewPosts(rpHomepageDom, delta)
            for (const topic of newPosts) {
                const authorAvatarURL = topic.querySelector(".ak-avatar > img").src
                const author = topic.querySelector("a.ak-linker-nickname")
                const date = topic.querySelector(".ak-desc-topic")
                console.log(date.childNodes[3].textContent)
                const title = topic.querySelector("a.ak-title-topic")
                await JSDOM.fromURL(title.href).then(postPageDom => {
                    const document = postPageDom.window.document;
                    const postContent = document.body.querySelector(".ak-item-mid > .ak-text").innerHTML

                    const webhookClient = new WebhookClient({
                        id: process.env.WEBHOOK_OTHER_ID,
                        token: process.env.WEBHOOK_OTHER_TOKEN
                    });

                    const embed = new EmbedBuilder()
                        .setTitle(title.innerHTML)
                        .setURL(title.href)
                        .setDescription(postContent.substring(0, 1024) + "...")
                        .setAuthor({
                            name: author.innerHTML,
                            iconURL: authorAvatarURL,
                            url: author.href
                        })
                        .setColor(0x00FFFF);

                    //webhookClient.send({
                    //    username: 'Potion de Rappel',
                    //    avatarURL: 'https://i.imgur.com/AfFp7pu.png',
                    //    embeds: [embed],
                    //});
                })

                //result.push({
                //    title: anchor.innerHTML,
                //    link: anchor.href,
                //})
            }
        });
    }
});

/*await JSDOM.fromURL("https://www.wakfu.com/fr/forum/496-histoire-jeu-role").then(rpHomepageDom => {
    logger.debug(chalk.cyan(`Found ${TopicCount.getSignRepliesCount(rpHomepageDom)} notice board replies!`))
    logger.debug(chalk.cyan(`Found ${TopicCount.getRumorsRepliesCount(rpHomepageDom)} rumors replies!`))
});*/