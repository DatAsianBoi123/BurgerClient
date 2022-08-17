import { BurgerClient } from './src/index';
import 'dotenv/config';
import { GatewayIntentBits, Partials, SlashCommandBuilder } from 'discord.js';

const burgerClient = new BurgerClient({
  testGuild: process.env.guild ?? '',
  typescript: true,
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

burgerClient.onReady(async client => {
  burgerClient.registerCommand({
    data: new SlashCommandBuilder()
      .setName('bee')
      .setDescription('bee'),

    type: 'GLOBAL',

    listeners: {
      onExecute: async ({ interaction }) => {
        await interaction.reply(':bee:');
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
