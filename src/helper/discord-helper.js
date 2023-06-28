import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, WebhookClient} from "discord.js";

export default {
    createEmbed: function (title, url, description, author, timestamp, footer, color) {
        return new EmbedBuilder()
            .setTitle(title)
            .setURL(url)
            .setDescription(description)
            .setAuthor(author)
            .setTimestamp(timestamp)
            .setFooter(footer)
            .setColor(color);
    },
    createActionRow: function (...components) {
        return new ActionRowBuilder()
            .addComponents(components);
    },
    createButton: function (url, label) {
        return new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(url)
            .setLabel(label);
    },
    getWebhookClient: function (id, token) {
        return new WebhookClient({
            id: id, token: token
        });
    }
}