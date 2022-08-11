import { ApplicationCommand, Awaitable, ChatInputCommandInteraction, Client, ClientEvents, ClientUser, Collection, InteractionReplyOptions, PermissionsBitField } from 'discord.js';
import { Logger } from './logger';
import { IClientOptions, ICommand, IDeployCommandsOptions } from './typings';
import mongoose from 'mongoose';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import fs from 'fs';

export class BurgerClient {
  public static readonly logger = new Logger('Burger Client');

  private _client: Client;
  private _options: IClientOptions;
  private _commands = new Collection<string, ICommand>();
  private _dbReady = false;
  private _clientReady = false;
  private _readyFunc: ((client: Client<true>) => Awaitable<void>) | null = null;

  constructor(options: IClientOptions) {
    options.intents ??= [];
    options.partials ??= [];
    options.logInfo ??= true;

    this._client = new Client({ intents: options.intents, partials: options.partials });

    if (options.mongoURI) {
      mongoose.connect(options.mongoURI).then(() => {
        if (options.logInfo) BurgerClient.logger.log('Connected to MongoDB.');
        this._dbReady = true;
        this.tryReady();
      }).catch(() => {
        throw new Error('An error occurred when connecting to MongoDB.');
      });
    } else {
      this._dbReady = true;
    }

    this._options = options;

    this._client.on('ready', () => {
      this._clientReady = true;
      this.tryReady();
    });
  }

  public async login(token: string) {
    await this._client.login(token);

    if (!this._client.guilds.resolve(this._options.testGuild)) {
      throw new Error('The bot is not a part of that guild.');
    }
  }

  public onReady(cb: (client: Client<true>) => Awaitable<void>) {
    this._readyFunc = cb;
  }

  public on<T extends keyof ClientEvents>(event: T, listener: (...arg: ClientEvents[T]) => Awaitable<void>) {
    return this._client.on(event, listener);
  }

  public async registerAllCommands(dir: string): Promise<ICommand[] | null> {
    const commands: ICommand[] = [];
    let commandFiles: string[];

    try {
      commandFiles = fs.readdirSync(dir).filter(file => file.endsWith(this._options.typescript ? '.ts' : '.js'));
    } catch (e) {
      BurgerClient.logger.log('Invalid Directory', 'ERROR');
      return null;
    }

    for (const file of commandFiles) {
      let command: ICommand;

      try {
        command = require.main?.require(`${dir}/${file}`);
      } catch (err) {
        if (!(err instanceof Error)) continue;
        BurgerClient.logger.log(`An error occurred when registering the command in file ${file}: ${err.message}`, 'ERROR');
        continue;
      }

      this.registerCommand(command, file);
      commands.push(command);
    }

    return commands;
  }

  public registerCommand(command: ICommand, displayName: string) {
    if (!BurgerClient.isValid(command)) {
      if (this._options.logInfo) BurgerClient.logger.log(`The command ${displayName} is not registered correctly.`, 'WARNING');
      return;
    }

    if (command.skip) {
      if (this._options.logInfo) BurgerClient.logger.log(`Skipped command ${displayName}.`);
      return;
    }

    if (this._options.logInfo) BurgerClient.logger.log(`Registered command ${displayName}.`);
    this._commands.set(command.data.name, command);
  }

  public async updateCommands() {
    if (this._options.logInfo) BurgerClient.logger.log('Updating application commands...');
    const globalCommands = this._commands.filter(command => command.type === 'GLOBAL');
    const guildCommands = this._commands.filter(command => command.type === 'GUILD');

    await this._client.guilds.cache.get(this._options.testGuild)?.commands.set(guildCommands.map(command => command.data.toJSON()))
      .then(() => {
        if (this._options.logInfo) BurgerClient.logger.log(`Successfully updated ${guildCommands.size} guild commands.`);
      })
      .catch(error => {
        BurgerClient.logger.log(`An error ocurred when updating guild commands: ${error.message}`, 'ERROR');
      });

    await this._client.application?.commands.set(globalCommands.map(command => command.data.toJSON())).then(() => {
      if (this._options.logInfo) BurgerClient.logger.log(`Successfully updated ${globalCommands.size} global commands.`);
    }).catch(error => {
      BurgerClient.logger.log(`An error ocurred when updating global commands: ${error.message}`, 'ERROR');
    });
  }

  public async updatePermissions() {
    const updatePermissionsFor = async (commands: Collection<string, ApplicationCommand>, filteredCommands: Collection<string, ICommand>) => {
      for (const [name] of filteredCommands) {
        const found = commands.find(cmd => cmd.name === name);
        const commandData = this._commands.get(name);
        if (!found) {
          BurgerClient.logger.log(`The command ${name} was not found.`, 'WARNING');
          continue;
        }
        if (!commandData) {
          BurgerClient.logger.log(`The command ${name} is not registered.`, 'WARNING');
          continue;
        }

        let updated = false;
        if (found.defaultMemberPermissions?.bitfield !== commandData.permissions?.default ? PermissionsBitField.resolve(commandData.permissions?.default) : undefined) {
          updated = true;
          await found.setDefaultMemberPermissions(commandData.permissions?.default ?? null);
        }

        if (found.dmPermission !== null && found.dmPermission != (commandData.permissions?.DMs ?? true)) {
          updated = true;
          await found.setDMPermission(commandData.permissions?.DMs);
        }
        if (updated && this._options.logInfo) BurgerClient.logger.log(`Updated permissions for command ${name}.`);
      }
    };

    const updateGuildPermissions = async () => {
      if (this._options.logInfo) BurgerClient.logger.log('Updating guild command permissions...');
      const guild = this._client.guilds.cache.get(this._options.testGuild);
      if (!guild || !guild.available) return BurgerClient.logger.log(`Error accessing guild ${this._options.testGuild}`, 'ERROR');
      const commands = await guild.commands.fetch();
      await updatePermissionsFor(commands, this._commands.filter(cmd => cmd.type === 'GUILD'));
    };

    const updateGlobalPermissions = async () => {
      if (this._options.logInfo) BurgerClient.logger.log('Updating global command permissions...');
      const commands = await this._client.application?.commands.fetch();
      if (!commands) return BurgerClient.logger.log('Client does not have an application', 'ERROR');
      await updatePermissionsFor(commands, this._commands.filter(cmd => cmd.type === 'GLOBAL'));
    };

    await updateGuildPermissions();
    if (this._options.logInfo) BurgerClient.logger.log('Done!');
    await updateGlobalPermissions();
    if (this._options.logInfo) BurgerClient.logger.log('Done!');
  }

  public async resolveCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.inCachedGuild()) {
      BurgerClient.logger.log(`The guild ${interaction.guildId} was not cached!`, 'WARNING');
      await interaction.reply('An unexpected error occurred, please try again later');
      return;
    }

    const command = this._commands.get(interaction.commandName);

    if (!command) {
      BurgerClient.logger.log(`The command ${interaction.commandName} was not registered.`, 'WARNING');
      interaction.reply('This command is not registered, please report this!');
      return;
    }

    const member = interaction.member;

    if (!interaction.channel) return interaction.reply('This command is not enabled here');
    if (interaction.channel.isDMBased() && !(command.permissions?.DMs ?? true)) {
      BurgerClient.logger.log(`User ${interaction.user.tag} tried to use a command in DMs that isn't allowed there! Updating all permissions...`);
      await this.updatePermissions();
      await interaction.reply('This command is not allowed in DMs');
      return;
    }
    if (member) {
      if (command.permissions?.default && !member.permissions.has(command.permissions.default)) {
        BurgerClient.logger.log(`User ${interaction.user.tag} in guild ${member.guild.id} tried to use a command they weren't supposed to! Updating all permissions...`, 'WARNING');
        await this.updatePermissions();
        await interaction.reply('You do not have permission to use this command');
        return;
      }
    }

    await command.listeners.onExecute({ interaction: interaction, channel: interaction.channel, args: interaction.options, subcommand: interaction.options.getSubcommand(false), client: interaction.client, guild: interaction.guild, user: interaction.user, member }).catch(error => {
      BurgerClient.logger.log(`An error occurred when executing command ${command.data.name}: ${error.message}`, 'ERROR');
      if (!command.listeners.onError?.({ interaction, error })) {
        const reply: InteractionReplyOptions = {
          content: 'There was an error executing this command',
        };

        if (interaction.replied || interaction.deferred) interaction.editReply(reply);
        else interaction.reply(reply);
      }
    });
  }

  public getCommands() {
    return this._commands.clone();
  }

  public static allCommandsInDir(dir: string, typescript: boolean): ICommand[] | null {
    const commands: ICommand[] = [];
    let commandFiles: string[];

    try {
      commandFiles = fs.readdirSync(dir).filter(file => file.endsWith(typescript ? '.ts' : '.js'));
    } catch (e) {
      BurgerClient.logger.log('Invalid Directory', 'ERROR');
      return null;
    }

    for (const file of commandFiles) {
      let command: ICommand;

      try {
        command = require.main?.require(`${dir}/${file}`);
      } catch (err) {
        if (!(err instanceof Error)) continue;
        BurgerClient.logger.log(`An error occurred when registering the command in file ${file}: ${err.message}`, 'ERROR');
        continue;
      }

      if (command === undefined) {
        BurgerClient.logger.log(`The command ${file} does not have any exports.`, 'WARNING');
        continue;
      }

      if (!BurgerClient.isValid(command)) {
        BurgerClient.logger.log(`The command ${file} is not registered correctly.`, 'WARNING');
        continue;
      }

      if (command.skip) {
        BurgerClient.logger.log(`Skipped command ${command.data.name}.`);
        continue;
      }

      commands.push(command);
    }

    return commands;
  }

  public static async deployCommands(options: IDeployCommandsOptions, commands: ICommand[]) {
    options.logInfo ??= true;

    const rest = new REST({ version: '10' }).setToken(options.token);

    const deployGuildCommands = async (guildCommands: unknown[]) => {
      await rest.put(Routes.applicationGuildCommands(options.userId, options.guildId), { body: guildCommands })
        .then(() => {
          if (options.logInfo) BurgerClient.logger.log(`Successfully registered ${guildCommands.length} guild commands.`);
        })
        .catch(err => {
          BurgerClient.logger.log(`An error occurred when deploying guild commands: ${err.message}`, 'ERROR');
        });
    };

    const deployGlobalCommands = async (globalCommands: unknown[]) => {
      await rest.put(Routes.applicationCommands(options.userId), { body: globalCommands })
        .then(() => {
          if (options.logInfo) BurgerClient.logger.log(`Successfully registered ${globalCommands.length} global commands.`);
        })
        .catch(() => {
          BurgerClient.logger.log('An error occurred when deploying global commands.', 'ERROR');
        });
    };

    const guildCommands = [];
    const globalCommands = [];

    for (const command of commands) {
      if (options.logInfo) BurgerClient.logger.log(`Loaded command ${command.data.name}.`);
      if (command.type === 'GUILD') guildCommands.push(command.data.toJSON());
      else globalCommands.push(command.data.toJSON());
    }

    await deployGuildCommands(guildCommands);
    await deployGlobalCommands(globalCommands);
  }

  public static isValid(command: ICommand) {
    return !!command?.data && !!command?.type && !!command?.listeners?.onExecute;
  }

  public get client() {
    return this._client;
  }

  public get user(): ClientUser | null {
    return this._client.user;
  }

  private tryReady() {
    if (this._clientReady && this._dbReady) this._readyFunc?.(this._client);
  }
}
