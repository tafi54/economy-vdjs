const { Message, EmbedBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

module.exports = {
    name: 'leaderboard',
    description: 'Show the richest users',
    aliases: ['lb', 'top'],

    async execute(message, args) {
        try {
            const page = parseInt(args[0]) || 1;
            const itemsPerPage = 10;
            const startIndex = (page - 1) * itemsPerPage;

            const usersPath = path.join(process.cwd(), '@data', 'users.json');
            const data = JSON.parse(await fs.readFile(usersPath, 'utf-8'));

            const sortedUsers = Object.values(data.users)
                .sort((a, b) => b.balance - a.balance);

            sortedUsers.forEach((user, index) => {
                data.users[user.id].profile.rank = index + 1;
            });

            await fs.writeFile(usersPath, JSON.stringify(data, null, 2));

            const pageUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);
            const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

            if (page > totalPages) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#000000')
                    .setDescription(`There are only \`\`${totalPages}\`\` pages available!`)
                    .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });
                return await message.reply({ embeds: [errorEmbed] });
            }

            const leaderboardEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription(
                    pageUsers.map((user, index) => {
                        const position = startIndex + index + 1;
                        const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '👥';
                        return `${medal} **${position}.** ${user.profile.username} - **${user.balance}** coins`;
                    }).join('\n')
                )
                .setFooter({ text: `Page ${page}/${totalPages} && Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await message.reply({ embeds: [leaderboardEmbed] });
        } catch (error) {
            console.error('Error in leaderboard command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('There was an error while executing this command.')
                .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });

            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 