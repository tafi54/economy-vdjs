const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give coins to another user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to give coins to')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of coins to give')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');

            if (targetUser.id === interaction.user.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#000000')
                    .setDescription('You cannot give coins to yourself!')
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const usersPath = path.join(process.cwd(), '@data', 'users.json');
            const data = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
            
            if (!data.users[interaction.user.id]) {
                data.users[interaction.user.id] = {
                    id: interaction.user.id,
                    balance: 0,
                    lastDaily: 0,
                    profile: {
                        username: interaction.user.username,
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

            if (data.users[interaction.user.id].balance < amount) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#000000')
                    .setDescription(`You don't have enough coins! Your balance: **${data.users[interaction.user.id].balance}** coins`)
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            data.users[interaction.user.id].balance -= amount;
            data.users[targetUser.id].balance += amount;

            data.users[interaction.user.id].profile.balance = data.users[interaction.user.id].balance;
            data.users[targetUser.id].profile.balance = data.users[targetUser.id].balance;

            await fs.writeFile(usersPath, JSON.stringify(data, null, 2));

            const successEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription(`You gave **${amount}** coins to ${targetUser.username}!\n-# Your new balance: **${data.users[interaction.user.id].balance}** coins`)
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error in give command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#000000')
                .setDescription('There was an error while executing this command.')
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}; 