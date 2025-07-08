const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your or another user\'s balance')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check balance for')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const usersPath = path.join(process.cwd(), '@data', 'users.json');
            const data = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
            
            const userId = targetUser.id;
            if (!data.users[userId]) {
                data.users[userId] = {
                    id: userId,
                    balance: 0,
                    lastDaily: 0,
                    profile: {
                        username: targetUser.username,
                        balance: 0,
                        rank: 0
                    }
                };
                await fs.writeFile(usersPath, JSON.stringify(data, null, 2));
            }

            const balanceEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription(`${targetUser.id === interaction.user.id ? 'Your' : `${targetUser.username}'s`} balance is **${data.users[userId].balance}** coins.`)
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [balanceEmbed] });
        } catch (error) {
            console.error('Error in balance command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('There was an error while executing this command.')
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}; 