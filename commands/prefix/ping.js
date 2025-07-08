const { Message } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Shows the bot\'s ping',
    
    async execute(message, args) {
        const ping = message.client.ws.ping;
        await message.reply(`Pong! ${ping}ms`);
    },
}; 