# BurgerClient
<a href="https://www.npmjs.com/package/burgerclient"><img src="https://img.shields.io/npm/v/burgerclient.svg?maxAge=3600" alt="npm version" /></a>
<a href="https://www.npmjs.com/package/burgerclient"><img src="https://img.shields.io/npm/dt/burgerclient.svg?maxAge=3600" alt="npm downloads" /></a>

Burger Client is a simple command handler for Discord.js

## Features

- Object Oriented
- Written in TypeScript
- Command Handler
- Full Typescript & Javascript support

## Installation

**[Node.js](https://nodejs.dev) 16.9.0 or newer is requried.**

Burger Client depends on these dependencies:
- [discord.js](https://npmjs.com/package/discord.js) `^14.0.3`
- [@discordjs/rest](https://www.npmjs.com/package/@discordjs/rest) `^1.0.0`
- [mongoose](https://www.npmjs.com/package/mongoose) `^6.4.5`

### npm

```
npm i burgerclient
```

## Usage

### JavaScript
<details>
  <summary>index.js</summary>
  
  ```javascript
  const { BurgerClient } = require('burgerclient');
  const { GatewayIntentsBits } = require('discord.js');
  const path = require('path');

  const client = new BurgerClient({
    typescript: false,                    // Whether or not your project is made in typescript
    intents: [GatewayIntentsBits.Guilds], // Put your intents here
    partials: [],                         // Put your partials here
    testGuild: '1234567890',              // Test guild ID for commands with the `type: 'GUILD'` property
    logInfo: true,                        // Whether or not to log info logs (enabled by default)
    mongoURI: 'myURIHere',                // URI for connecting to MongoDB, if supplied
  });

  // Listener to when the client is ready and the database has been connected to
  client.onReady(async discordClient => {
    await client.registerAllCommands(path.resolve('commands')); // Registers all commands in the directory ./commands
    await client.updateCommands();    // Updates all application commands
    await client.updatePermissions(); // Updates all application command permissions

    console.log(`Ready! Logged in as ${discordClient.user.tag}`);
  });

  // Listener when a user creates an interaction
  client.on('interactionCreate', interaction => {
    if (!interaction.isChatInputCommand()) return; // Checks if the command is a slash (/) command

    client.resolveCommand(interaction); // Executes the command
  });

  client.login('myTokenHere'); // Logins to Discord using your bot's token
  ```
</details>

<details>
  <summary>commands/ping.js</summary>
  
  ```javascript
  const { ICommand } = require('burgerclient');
  const { SlashCommandBuilder } = require('discord.js');
  
  // For intellisense and auto-completions
  /**
   * @type {ICommand}
   */
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with pong!'),
  
    type: 'GUILD', // Command type can be either GUILD or GLOBAL
    
    // Optional permissions
    permissions: {
      default: 'SendMessages', // Default member permissions (only users with a specific permission can use this command)
      DMs: true,               // Whether or not this command is enabled in DMs (enabled by default)
    },
  
    listeners: {
      // Gets called when the command is executed
      onExecute: async ({ interaction }) => {
        interaction.reply('Pong!');
      },
      
      // Optional `onError` listener that gets called when an unexpected error gets thrown while executing the command
      onError: ({ error, interaction }) => {
        interaction.reply(`Uh oh, an error occurred! ${error.message}`);
      },
    },
  };
  ```
</details>

### TypeScript
<details>
  <summary>index.ts</summary>
  
  ```typescript
  import { BurgerClient } from 'burgerclient';
  import { GatewayIntentBits } from 'discord.js';

  const client = new BurgerClient({
    typescript: true,                     // Whether or not your project is made in typescript
    intents: [GatewayIntentsBits.Guilds], // Put your intents here
    partials: [],                         // Put your partials here
    testGuild: '1234567890',              // Test guild ID for commands with the `type: 'GUILD'` property
    logInfo: true,                        // Whether or not to log info logs (enabled by default)
    mongoURI: 'myURIHere',                // URI for connecting to MongoDB, if supplied
  });

  // Listener to when the client is ready and the database has been connected to
  client.onReady(async discordClient => {
    await client.registerAllCommands(path.resolve('commands')); // Registers all commands in a given directory
    await client.updateCommands();    // Updates all application commands
    await client.updatePermissions(); // Updates all application command permissions

    console.log(`Ready! Logged in as ${discordClient.user.tag}`);
  });

  // Listener when a user creates an interaction
  client.on('interactionCreate', interaction => {
    if (!interaction.isChatInputCommand()) return; // Checks if the command is a slash (/) command

    client.resolveCommand(interaction); // Executes the command
  });

  client.login('myTokenHere'); // Logins to Discord using your bot's token
  ```
</details>

<details>
  <summary>commands/ping.ts</summary>
  
  ```typescript
  import { ICommand } from 'burgerclient';
  import { SlashCommandBuilder } from 'discord.js';
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with pong!'),
  
    type: 'GUILD', // Command type can be either GUILD or GLOBAL
    
    // Optional permissions
    permissions: {
      default: 'SendMessages', // Default member permissions (only users with a specific permission can use this command)
      DMs: true,               // Whether or not this command is enabled in DMs (enabled by default)
    },
  
    listeners: {
      // Gets called when the command is executed
      onExecute: async ({ interaction }) => {
        interaction.reply('Pong!');
      },
      
      // Optional `onError` listener that gets called when an unexpected error gets thrown while executing the command
      onError: ({ error, interaction }) => {
        interaction.reply(`Uh oh, an error occured! ${error.message}`);
      },
    },
  } as ICommand;
  ```
</details>

## Contributing

[Fork](https://github.com/datasianboi123/burgerclient/fork) this project

Create an [issue](https://github.com/datasianboi123/burgerclient/issues/new)

Create a [pull request](https://github.com/datasianboi123/burgerclient/compare)
