const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = async (client) => {
    const slashCommands = [];

    const prefixCommandsPath = path.join(__dirname, '..', 'commands', 'prefix');
    const prefixCommandFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));

    for (const file of prefixCommandFiles) {
        const filePath = path.join(prefixCommandsPath, file);
        const command = require(filePath);
        
        if ('name' in command && 'execute' in command) {
            client.prefixCommands.set(command.name, command);
        }
    }

    const slashCommandsPath = path.join(__dirname, '..', 'commands', 'slash');
    const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

    for (const file of slashCommandFiles) {
        const filePath = path.join(slashCommandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.slashCommands.set(command.data.name, command);
            slashCommands.push(command.data.toJSON());
        }
    }

    const rest = new REST().setToken(client.token);
    
    try {

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashCommands },
        );

    } catch (error) {
    }
};
