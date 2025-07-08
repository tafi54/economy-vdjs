const { Message, EmbedBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

module.exports = {
    name: 'profile',
    description: 'View user profile',
    aliases: ['p', 'prof'],

    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first() || message.author;
            const usersPath = path.join(process.cwd(), '@data', 'users.json');
            const data = JSON.parse(await fs.readFile(usersPath, 'utf-8'));

            if (!data.users[targetUser.id]) {
                data.users[targetUser.id] = {
                    id: targetUser.id,
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

            const user = data.users[targetUser.id];
            const rankEmoji = user.profile.rank === 1 ? '🥇' : user.profile.rank === 2 ? '🥈' : user.profile.rank === 3 ? '🥉' : '👥';

            const profileEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setTitle(`${rankEmoji} ${user.profile.username}'s Profile`)
                .addFields(
                    { name: 'Balance', value: `**${user.balance}** coins`, inline: true },
                    { name: 'Rank', value: `#**${user.profile.rank}**`, inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await message.reply({ embeds: [profileEmbed] });
        } catch (error) {
            console.error('Error in profile command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('There was an error while executing this command.')
                .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });

            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 