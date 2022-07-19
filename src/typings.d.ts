import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { Awaitable, CacheType, ChatInputCommandInteraction, Client, ClientEvents, ClientUser, Collection, CommandInteractionOptionResolver, Guild, GuildMember, Partials, PermissionResolvable, TextBasedChannel, User } from 'discord.js';

declare class BurgerClient {
  public static readonly logger: Logger;

  public constructor(options: IClientOptions);
  private _client: Client;
  private _options: IClientOptions;
  private _commands: Collection<string, ICommand>;
  private _dbReady: boolean;
  private _clientReady: false;
  private _readyFunc: ((client: Client<true>) => Awaitable<void>) | null;

  private tryReady(): void;

  /**
   * Attempts to log into Discord with a specific token
   * @param token The token to log in with
   */
  public login(token: string): Promise<void>;
  /**
   * Attaches a callback when the client is ready and the database has been connected to
   * @param cb Callback once ready
   */
  public onReady(cb: (client: Client<true>) => Awaitable<void>): void;
  /**
   * Used to listen to different events such as `interactionCreate`
   * Note: Use {@link onReady()|onReady} instead of Discord's built-in ready event
   * @param event Event to listen to
   * @param listener Listener once event is emitted
   */
  public on<T extends keyof ClientEvents>(event: T, listener: (...arg: ClientEvents[T]) => Awaitable<void>): Client<boolean>;
  /**
   * Registers all commands in a specified directory
   * @param dir Directory to search in
   */
  public registerAllCommands(dir: string): ICommand[] | null;
  public registerCommand(command: ICommand, displayName: string): void;
  public updatePermissions(): Promise<void>;
  /**
   * Resolves a command from an interaction emitted from an `interactionCreate` event
   * @param interaction The command interaction
   */
  public resolveCommand(interaction: ChatInputCommandInteraction): void;
  public getCommands(): Collection<string, ICommand>;

  public static allCommandsInDir(dir: string, typescript: boolean):ICommand[] | null;
  public static deployCommands(options: IDeployCommandsOptions, commands: ICommand[]): Promise<void>;
  public static isValid(command: ICommand): boolean;

  public get client(): Client<boolean>;
  public get user(): ClientUser | null;
}

declare class Logger {
  constructor(name: string);

  public readonly name: string;

  public log(message: string, level?: LoggerLevels): void;
}

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
  typescript: boolean;
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
