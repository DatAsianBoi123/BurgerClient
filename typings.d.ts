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

interface ISkyblockProfile {
  profile_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members: Record<string, any>;
  community_upgrades: ICommunityUpgrades;
  cute_name: string;
  game_mode?: SkyblockGameModes;
  banking?: IBankingInfo;
}

interface IBankingInfo {
  balance: number;
  transactions: IBankingTransactions[];
}

interface IBankingTransactions {
  amount: number;
  timestamp: number;
  action: BankTransactionActions;
  initiator_name: string;
}

interface ICommunityUpgrades {
  currently_upgrading?: string | null;
  upgrade_states: Record<string, string | number | boolean>[];
}

interface IHypixelPlayer {
  [key: string]: string | number | boolean | object;

  _id: string;
  uuid: string;
  displayname: string;
  firstLogin: number;
  lastLogin: number;
  playername: string;
  karma: string;
  stats: Record<string, Record<string, string | number | boolean | object>>;
  networkExp: number;
  achievements: Record<string, number>;
  socialMedia: IHypixelSocialMedia;
}

interface IHypixelSocialMedia {
  [key: string]: string | boolean | object | null;

  links: Record<string, string>;
  prompt: boolean | null;
}

type HypixelDefaultFetchModel = {
  success: boolean;
  cause?: string;
};

type SkyblockGameModes = 'bingo' | 'ironman' | 'island';

type BankTransactionActions = 'DEPOSIT' | 'WITHDRAW';

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

export type MinecraftUserFetchModel = {
  name: string;
  id: string;
};

export type SkyblockProfilesFetchModel = HypixelDefaultFetchModel & {
  profiles: ISkyblockProfile[] | null;
};

export type HypixelPlayerFetchModel = HypixelDefaultFetchModel & {
  player: IHypixelPlayer;
};

export type SkillResolvable = 'FARMING' | 'MINING' | 'COMBAT' | 'FORAGING' | 'FISHING' | 'ENCHANTING' | 'ALCHEMY' | 'TAMING';
