import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CacheType, ChatInputCommandInteraction, Client, CommandInteractionOptionResolver, Guild, GuildMember, Partials, PermissionResolvable, TextBasedChannel, User } from 'discord.js';

interface ICallbackObject {
  channel: TextBasedChannel;
  client: Client;
  guild: Guild | null;
  args: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>;
  subcommand: string | null;
  interaction: ChatInputCommandInteraction;
  user: User;
  member: GuildMember | null;
}

interface IErrorObject {
  error: Error;
  interaction: ChatInputCommandInteraction;
}

interface IListeners {
  onExecute(obj: ICallbackObject): Promise<unknown>;
  onError?(obj: IErrorObject): Promise<void>;
}

export interface IClientOptions {
  intents?: number[];
  partials?: Partials[];
  testGuild: string;
  mongoURI?: string;
  logInfo?: boolean;
}

export interface IDeployCommandsOptions {
  token: string;
  guildId: string;
  userId: string;
  mongoURI?: string;
  logInfo?: boolean;
}

export interface ICommand {
  data: SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandSubcommandsOnlyBuilder;
  skip?: boolean;
  permissions?: {
    default?: PermissionResolvable;
    DMs?: boolean;
  };
  type: 'GUILD' | 'GLOBAL';
  listeners: IListeners;
}

export type LoggerLevels = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
