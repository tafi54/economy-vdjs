const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows the bot\'s ping'),
    
    async execute(interaction) {
        const ping = interaction.client.ws.ping;
        await interaction.reply(`Pong! ${ping}ms`);
    },
}; 