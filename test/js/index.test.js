const { BurgerClient } = require('../../src/out/index');
require('dotenv/config');
const { GatewayIntentBits, Partials } = require('discord.js');
const path = require('path');

const burgerClient = new BurgerClient({
  testGuild: process.env.guild,
  typescript: false,
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

burgerClient.onReady(async client => {
  await burgerClient.registerAllCommands(path.resolve('test', 'js', 'commands'));
  await burgerClient.updateCommands();
  await burgerClient.updatePermissions();

  BurgerClient.logger.log(`Logged in as ${client.user.tag}`);
});

burgerClient.on('interactionCreate', interaction => {
  if (!interaction.isChatInputCommand()) return;

  burgerClient.resolveCommand(interaction);
});

burgerClient.login(process.env.token ?? '');
