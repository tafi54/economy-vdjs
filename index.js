const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, prefix } = require('./config.json');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.prefixCommands = new Collection();
client.slashCommands = new Collection();
client.prefix = prefix;

require('./handlers/eventHandler')(client);

client.login(token); 