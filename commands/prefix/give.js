const { Message, EmbedBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

module.exports = {
    name: 'give',
    description: 'Give coins to another user',

    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first();
            const amount = parseInt(args[1]);

            if (!targetUser || isNaN(amount) || amount < 1) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#000000')
                    .setDescription('Usage: `give @user amount`\n-# Example: `give @user 100`')
                    .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });
                return await message.reply({ embeds: [errorEmbed] });
            }

            if (targetUser.id === message.author.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#000000')
                    .setDescription('You cannot give coins to yourself!')
                    .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });
                return await message.reply({ embeds: [errorEmbed] });
            }

            const usersPath = path.join(process.cwd(), '@data', 'users.json');
            const data = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
            
            if (!data.users[message.author.id]) {
                data.users[message.author.id] = {
                    id: message.author.id,
                    balance: 0,
                    lastDaily: 0,
                    profile: {
                        username: message.author.username,
                        balance: 0,
                        rank: 0
                    }
                };
            }

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
            }

            if (data.users[message.author.id].balance < amount) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#000000')
                    .setDescription(`You don't have enough coins! Your balance: **${data.users[message.author.id].balance}** coins`)
                    .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });
                return await message.reply({ embeds: [errorEmbed] });
            }

            data.users[message.author.id].balance -= amount;
            data.users[targetUser.id].balance += amount;

            data.users[message.author.id].profile.balance = data.users[message.author.id].balance;
            data.users[targetUser.id].profile.balance = data.users[targetUser.id].balance;

            await fs.writeFile(usersPath, JSON.stringify(data, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription(`You gave **${amount}** coins to ${targetUser.username}!\n-# Your new balance: **${data.users[message.author.id].balance}** coins`)
                .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error in give command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('There was an error while executing this command.')
                .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });

            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 