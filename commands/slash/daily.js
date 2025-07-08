const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

const MIN_DAILY = 890;
const MAX_DAILY = 1070;
const COOLDOWN = 24 * 60 * 60 * 1000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Collect your daily reward'),

    async execute(interaction) {
        try {
            const usersPath = path.join(process.cwd(), '@data', 'users.json');
            const data = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
            
            const userId = interaction.user.id;
            if (!data.users[userId]) {
                data.users[userId] = {
                    id: userId,
                    balance: 0,
                    lastDaily: 0,
                    profile: {
                        username: interaction.user.username,
                        balance: 0,
                        rank: 0
                    }
                };
            }

            const now = Date.now();
            const timeSinceLastDaily = now - (data.users[userId].lastDaily || 0);

            if (timeSinceLastDaily < COOLDOWN) {
                const timeLeft = COOLDOWN - timeSinceLastDaily;
                const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
                const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                
                const cooldownEmbed = new EmbedBuilder()
                    .setColor('#000000')
                    .setDescription(`You need to wait **${hoursLeft}h ${minutesLeft}m** before collecting your next daily reward!`)
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

                return await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
            }

            const dailyAmount = Math.floor(Math.random() * (MAX_DAILY - MIN_DAILY + 1)) + MIN_DAILY;
            data.users[userId].balance += dailyAmount;
            data.users[userId].lastDaily = now;

            await fs.writeFile(usersPath, JSON.stringify(data, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription(`You've received **${dailyAmount}** coins!\nYour new balance is **${data.users[userId].balance}** coins.`)
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error in daily command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('There was an error while executing this command.')
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}; 