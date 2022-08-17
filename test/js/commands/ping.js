const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong!'),

  type: 'GUILD',
  listeners: {
    onExecute: async ({ interaction }) => {
      interaction.reply('Pong');
    },
  },
};
