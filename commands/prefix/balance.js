const { Message, EmbedBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

module.exports = {
    name: 'balance',
    description: 'Check your or another user\'s balance',

    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first() || message.author;
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
                .setDescription(`${targetUser.id === message.author.id ? 'Your' : `${targetUser.username}'s`} balance is **${data.users[userId].balance}** coins.`)
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await message.reply({ embeds: [balanceEmbed] });
        } catch (error) {
            console.error('Error in balance command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('There was an error while executing this command.')
                .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });

            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 