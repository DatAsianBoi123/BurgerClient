import { SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../../src/typings';

const command: ICommand = {
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

export default command;
