import { BurgerClient } from './src/index';
import 'dotenv/config';
import { GatewayIntentBits, SlashCommandBuilder } from 'discord.js';

const burgerClient = new BurgerClient({
  testGuild: process.env.guild ?? '',
  typescript: true,
  intents: [GatewayIntentBits.Guilds],
});

burgerClient.onReady(async client => {
  burgerClient.registerCommand({
    data: new SlashCommandBuilder()
      .setName('bee')
      .setDescription('bee'),

    type: 'GUILD',

    listeners: {
      onExecute: async ({ interaction }) => {
        interaction.reply(':bee:');
      },
    },
  }, 'bee');

  await burgerClient.updateCommands();
  await burgerClient.updatePermissions();

  BurgerClient.logger.log(`Logged in as ${client.user.tag}`);
});

burgerClient.on('interactionCreate', interaction => {
  if (!interaction.isChatInputCommand()) return;

  burgerClient.resolveCommand(interaction);
});

burgerClient.login(process.env.token ?? '');
