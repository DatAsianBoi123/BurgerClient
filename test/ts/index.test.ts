import { BurgerClient } from '../../src/index';
import 'dotenv/config';
import { GatewayIntentBits, Partials } from 'discord.js';
import path from 'path';

const burgerClient = new BurgerClient({
  testGuild: process.env.guild ?? '',
  typescript: true,
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

burgerClient.onReady(async client => {
  await burgerClient.registerAllCommands(path.resolve('test', 'ts', 'commands'));
  await burgerClient.updateCommands();
  await burgerClient.updatePermissions();

  BurgerClient.logger.log(`Logged in as ${client.user.tag}`);
});

burgerClient.on('interactionCreate', interaction => {
  if (!interaction.isChatInputCommand()) return;

  burgerClient.resolveCommand(interaction);
});

burgerClient.login(process.env.token ?? '');
