import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Awaitable, CacheType, ChatInputCommandInteraction, Client, ClientEvents, ClientUser, Collection, CommandInteractionOptionResolver, GatewayIntentBits, Guild, GuildMember, Partials, PermissionResolvable, TextBasedChannel, User } from 'discord.js';

/**
 * Main class for interacting with Discord.js and the Discord API
 */
declare class BurgerClient {
  /**
   * Logger used by BurgerClient
   */
  public static readonly logger: Logger;

  /**
   * Creates a new {@link BurgerClient} instance
   * @param options Client options
   */
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

/**
 * Simple logger class BurgerClient uses
 */
declare class Logger {
  /**
   * Creates a new {@link Logger} instance
   * @param name The name of the logger
   */
  constructor(name: string);

  /**
   * Name of the logger
   */
  public readonly name: string;

  /**
   * Logs a message to the console
   * @param message The message to log
   * @param level The logger level
   */
  public log(message: string, level?: LoggerLevels): void;
}

/**
 * Callback arguments when a command gets executed
 */
interface ICallbackObject {
  /**
   * The channel the command was executed in
   */
  channel: TextBasedChannel;

  /**
   * The logged in Discord client
   */
  client: Client<boolean>;

  /**
   * The guild the command was executed in, or null if it wasn't executed in a guild
   */
  guild: Guild | null;

  /**
   * The command arguments
   */
  args: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>;

  /**
   * The subcommand used, or null if there are no subcommands
   */
  subcommand: string | null;

  /**
   * The command interaction
   */
  interaction: ChatInputCommandInteraction;

  /**
   * The user that executed the command
   */
  user: User;

  /**
   * The guild member that executed the command, or null if it wasn't executed in a guild
   */
  member: GuildMember | null;
}

/**
 * Callback arguments when an error gets thrown while a command is running
 */
interface IErrorObject {
  /**
   * The error thrown
   */
  error: Error;

  /**
   * The command interaction
   */
  interaction: ChatInputCommandInteraction;
}

/**
 * Command listeners
 */
interface IListeners {
  /**
   * Creates a callback that gets called when the command is executed
   * @param obj Callback params
   */
  onExecute(obj: ICallbackObject): Promise<unknown>;

  /**
   * Creates a callback that gets called when an unexpected error gets thrown when executing the command
   * @param obj Error info
   */
  onError?(obj: IErrorObject): Promise<void>;
}

/**
 * Client options when instantiating a new BurgerClient
 */
export interface IClientOptions {
  /**
   * Client intents
   * @see {@link GatewayIntentBits}
   */
  intents?: number[];

  /**
   * Client partials
   * @see {@link Partials}
   */
  partials?: Partials[];

  /**
   * Test guild ID for guild commands
   */
  testGuild: string;

  /**
   * Url to use when connecting to MongoDB
   */
  mongoURI?: string;

  /**
   * Whether or not to log info logs
   */
  logInfo?: boolean;

  /**
   * Whether or not this project is in typescript
   */
  typescript: boolean;
}

/**
 * Options to use when deploying commands
 */
export interface IDeployCommandsOptions {
  /**
   * Token to use when deploying commands
   */
  token: string;

  /**
   * Guild ID to use when deploying guild commands
   */
  guildId: string;

  /**
   * Bot's user ID
   *
   * This can be found in the developer portal
   */
  userId: string;

  /**
   * Whether or not to log info logs
   */
  logInfo?: boolean;
}

/**
 * Data for slash commands
 */
export interface ICommand {
  /**
   * The command's data
   * @see {@link https://discord.js.org/#/docs/builders/main/class/SlashCommandBuilder docs} for more info
   */
  data: SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandSubcommandsOnlyBuilder;

  /**
   * Whether or not to skip this command when registering
   */
  skip?: boolean;

  /**
   * Command permissions
   */
  permissions?: {
    default?: PermissionResolvable;
    DMs?: boolean;
  };

  /**
   * Command type
   */
  type: 'GUILD' | 'GLOBAL';

  /**
   * Command listeners
   */
  listeners: IListeners;
}

/**
 * Different log levels used by the {@link Logger}
 */
export type LoggerLevels = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
