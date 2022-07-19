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
   *
   * Note: Use {@link onReady()|onReady} instead of Discord's built-in ready event
   * @param event Event to listen to
   * @param listener Listener once event is emitted
   * @returns The client so methods can be chained
   */
  public on<T extends keyof ClientEvents>(event: T, listener: (...arg: ClientEvents[T]) => Awaitable<void>): Client<boolean>;

  /**
   * Registers all commands in a specified directory
   * @param dir Directory to search in
   * @returns All commands in that directory, or null if the directory is invalid
   */
  public registerAllCommands(dir: string): ICommand[] | null;

  /**
   * Registers one command
   * @param command The command to register
   * @param displayName Name of the command to display if something goes wrong
   */
  public registerCommand(command: ICommand, displayName: string): void;

  /**
   * Updates all registered command permissions
   */
  public updatePermissions(): Promise<void>;

  /**
   * Resolves a command from an interaction emitted from an `interactionCreate` event
   * @param interaction The command interaction
   */
  public resolveCommand(interaction: ChatInputCommandInteraction): Promise<void>;

  /**
   * Gets all registered commands
   * @returns The registered commands
   */
  public getCommands(): Collection<string, ICommand>;

  /**
   * Retrieves all commands in a given directory
   * @param dir The directory to search in
   * @param typescript Whether or not to look for typescript files
   * @returns The commands in that directory, or null if the directory is invalid
   */
  public static allCommandsInDir(dir: string, typescript: boolean): ICommand[] | null;
  /**
   * Deploys all commands to Discord using the REST API
   * @param options Deploy command options
   * @param commands Commands to deploy
   */
  public static deployCommands(options: IDeployCommandsOptions, commands: ICommand[]): Promise<void>;
  /**
   * Checks whether or not a command is valid
   * @param command The command to check
   * @returns If the command is valid
   */
  public static isValid(command: ICommand): boolean;

  /**
   * @returns The discord client.
   * @see {@link Client<boolean>}
   */
  public get client(): Client<boolean>;

  /**
   * @returns The bot user, or null if the bot has not logged in yet
   * @see {@link ClientUser}
   */
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
