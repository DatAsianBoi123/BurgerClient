"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurgerClient = void 0;
const discord_js_1 = require("discord.js");
const logger_1 = require("./logger");
const mongoose_1 = __importDefault(require("mongoose"));
const rest_1 = require("@discordjs/rest");
const v10_1 = require("discord-api-types/v10");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class BurgerClient {
    constructor(options) {
        var _a, _b, _c;
        this._commands = new discord_js_1.Collection();
        this._dbReady = false;
        this._clientReady = false;
        this._readyFunc = null;
        (_a = options.intents) !== null && _a !== void 0 ? _a : (options.intents = []);
        (_b = options.partials) !== null && _b !== void 0 ? _b : (options.partials = []);
        (_c = options.logInfo) !== null && _c !== void 0 ? _c : (options.logInfo = true);
        this._client = new discord_js_1.Client({ intents: options.intents, partials: options.partials });
        if (options.mongoURI) {
            mongoose_1.default.connect(options.mongoURI).then(() => {
                if (options.logInfo)
                    BurgerClient.logger.log('Connected to MongoDB.');
                this._dbReady = true;
                this.tryReady();
            }).catch(() => {
                throw new Error('An error occurred when connecting to MongoDB.');
            });
        }
        else {
            this._dbReady = true;
        }
        this._options = options;
        this._client.on('ready', () => {
            this._clientReady = true;
            this.tryReady();
        });
    }
    login(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._client.login(token);
            if (!this._client.guilds.resolve(this._options.testGuild)) {
                throw new Error('The bot is not a part of that guild.');
            }
        });
    }
    onReady(cb) {
        this._readyFunc = cb;
    }
    on(event, listener) {
        return this._client.on(event, listener);
    }
    registerAllCommands(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const commands = [];
            let commandFiles;
            try {
                commandFiles = fs_1.default.readdirSync(dir).filter(file => file.endsWith(this._options.typescript ? '.ts' : '.js'));
            }
            catch (e) {
                BurgerClient.logger.log('Invalid Directory', 'ERROR');
                return null;
            }
            for (const file of commandFiles) {
                let command;
                try {
                    command = (yield Promise.resolve().then(() => __importStar(require(path_1.default.resolve(dir, file))))).default;
                }
                catch (err) {
                    if (!(err instanceof Error))
                        continue;
                    BurgerClient.logger.log(`An error occurred when registering the command in file ${file}: ${err.message}`, 'ERROR');
                    continue;
                }
                this.registerCommand(command, file);
                commands.push(command);
            }
            return commands;
        });
    }
    registerCommand(command, displayName) {
        if (!BurgerClient.isValid(command)) {
            if (this._options.logInfo)
                BurgerClient.logger.log(`The command ${displayName} is not registered correctly.`, 'WARNING');
            return;
        }
        if (command.skip) {
            if (this._options.logInfo)
                BurgerClient.logger.log(`Skipped command ${displayName}.`);
            return;
        }
        if (this._options.logInfo)
            BurgerClient.logger.log(`Registered command ${displayName}.`);
        this._commands.set(command.data.name, command);
    }
    updateCommands() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this._options.logInfo)
                BurgerClient.logger.log('Updating application commands...');
            const globalCommands = this._commands.filter(command => command.type === 'GLOBAL');
            const guildCommands = this._commands.filter(command => command.type === 'GUILD');
            yield ((_a = this._client.guilds.cache.get(this._options.testGuild)) === null || _a === void 0 ? void 0 : _a.commands.set(guildCommands.map(command => command.data.toJSON())).then(() => {
                if (this._options.logInfo)
                    BurgerClient.logger.log(`Successfully updated ${guildCommands.size} guild commands.`);
            }).catch(error => {
                BurgerClient.logger.log(`An error ocurred when updating guild commands: ${error.message}`, 'ERROR');
            }));
            yield ((_b = this._client.application) === null || _b === void 0 ? void 0 : _b.commands.set(globalCommands.map(command => command.data.toJSON())).then(() => {
                if (this._options.logInfo)
                    BurgerClient.logger.log(`Successfully updated ${globalCommands.size} global commands.`);
            }).catch(error => {
                BurgerClient.logger.log(`An error ocurred when updating global commands: ${error.message}`, 'ERROR');
            }));
        });
    }
    updatePermissions() {
        return __awaiter(this, void 0, void 0, function* () {
            const updatePermissionsFor = (commands, filteredCommands) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h;
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
                    if (((_a = found.defaultMemberPermissions) === null || _a === void 0 ? void 0 : _a.bitfield) !== ((_b = commandData.permissions) === null || _b === void 0 ? void 0 : _b.default) ? discord_js_1.PermissionsBitField.resolve((_c = commandData.permissions) === null || _c === void 0 ? void 0 : _c.default) : undefined) {
                        updated = true;
                        yield found.setDefaultMemberPermissions((_e = (_d = commandData.permissions) === null || _d === void 0 ? void 0 : _d.default) !== null && _e !== void 0 ? _e : null);
                    }
                    if (found.dmPermission !== null && found.dmPermission != ((_g = (_f = commandData.permissions) === null || _f === void 0 ? void 0 : _f.DMs) !== null && _g !== void 0 ? _g : true)) {
                        updated = true;
                        yield found.setDMPermission((_h = commandData.permissions) === null || _h === void 0 ? void 0 : _h.DMs);
                    }
                    if (updated && this._options.logInfo)
                        BurgerClient.logger.log(`Updated permissions for command ${name}.`);
                }
            });
            const updateGuildPermissions = () => __awaiter(this, void 0, void 0, function* () {
                if (this._options.logInfo)
                    BurgerClient.logger.log('Updating guild command permissions...');
                const guild = this._client.guilds.cache.get(this._options.testGuild);
                if (!guild || !guild.available)
                    return BurgerClient.logger.log(`Error accessing guild ${this._options.testGuild}`, 'ERROR');
                const commands = yield guild.commands.fetch();
                yield updatePermissionsFor(commands, this._commands.filter(cmd => cmd.type === 'GUILD'));
            });
            const updateGlobalPermissions = () => __awaiter(this, void 0, void 0, function* () {
                var _j;
                if (this._options.logInfo)
                    BurgerClient.logger.log('Updating global command permissions...');
                const commands = yield ((_j = this._client.application) === null || _j === void 0 ? void 0 : _j.commands.fetch());
                if (!commands)
                    return BurgerClient.logger.log('Client does not have an application', 'ERROR');
                yield updatePermissionsFor(commands, this._commands.filter(cmd => cmd.type === 'GLOBAL'));
            });
            yield updateGuildPermissions();
            if (this._options.logInfo)
                BurgerClient.logger.log('Done!');
            yield updateGlobalPermissions();
            if (this._options.logInfo)
                BurgerClient.logger.log('Done!');
        });
    }
    resolveCommand(interaction) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const command = this._commands.get(interaction.commandName);
            if (!command) {
                BurgerClient.logger.log(`The command ${interaction.commandName} was not registered.`, 'WARNING');
                interaction.reply('This command is not registered, please report this!');
                return;
            }
            if (!interaction.channel) {
                BurgerClient.logger.log(`The command ${interaction.commandName} was sent in a null channel. Did you forget to add the \`Channels\` partial?`, 'WARNING');
                yield interaction.reply('This command is not enabled here');
                return;
            }
            if (interaction.channel.isDMBased() && !((_b = (_a = command.permissions) === null || _a === void 0 ? void 0 : _a.DMs) !== null && _b !== void 0 ? _b : true)) {
                BurgerClient.logger.log(`User ${interaction.user.tag} tried to use a command in DMs that isn't allowed there! Updating all permissions...`);
                yield this.updatePermissions();
                yield interaction.reply('This command is not allowed in DMs');
                return;
            }
            let member = null;
            if (interaction.inGuild()) {
                if (!interaction.inCachedGuild()) {
                    BurgerClient.logger.log(`The guild ${interaction.guildId} was not cached!`, 'WARNING');
                    yield interaction.reply('An unexpected error occurred, please try again later');
                    return;
                }
                member = interaction.member;
                if (((_c = command.permissions) === null || _c === void 0 ? void 0 : _c.default) && !member.permissions.has(command.permissions.default)) {
                    BurgerClient.logger.log(`User ${interaction.user.tag} in guild ${member.guild.id} tried to use a command they weren't supposed to! Updating all permissions...`, 'WARNING');
                    yield this.updatePermissions();
                    yield interaction.reply('You do not have permission to use this command');
                    return;
                }
            }
            yield command.listeners.onExecute({ interaction: interaction, channel: interaction.channel, args: interaction.options, subcommand: interaction.options.getSubcommand(false), client: interaction.client, guild: interaction.guild, user: interaction.user, member }).catch(error => {
                var _a, _b;
                BurgerClient.logger.log(`An error occurred when executing command ${command.data.name}: ${error.message}`, 'ERROR');
                if (!((_b = (_a = command.listeners).onError) === null || _b === void 0 ? void 0 : _b.call(_a, { interaction, error }))) {
                    const reply = {
                        content: 'There was an error executing this command',
                    };
                    if (interaction.replied || interaction.deferred)
                        interaction.editReply(reply);
                    else
                        interaction.reply(reply);
                }
            });
        });
    }
    getCommands() {
        return this._commands.clone();
    }
    static allCommandsInDir(dir, typescript) {
        var _a;
        const commands = [];
        let commandFiles;
        try {
            commandFiles = fs_1.default.readdirSync(dir).filter(file => file.endsWith(typescript ? '.ts' : '.js'));
        }
        catch (e) {
            BurgerClient.logger.log('Invalid Directory', 'ERROR');
            return null;
        }
        for (const file of commandFiles) {
            let command;
            try {
                command = (_a = require.main) === null || _a === void 0 ? void 0 : _a.require(`${dir}/${file}`);
            }
            catch (err) {
                if (!(err instanceof Error))
                    continue;
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
    static deployCommands(options, commands) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = options.logInfo) !== null && _a !== void 0 ? _a : (options.logInfo = true);
            const rest = new rest_1.REST({ version: '10' }).setToken(options.token);
            const deployGuildCommands = (guildCommands) => __awaiter(this, void 0, void 0, function* () {
                yield rest.put(v10_1.Routes.applicationGuildCommands(options.userId, options.guildId), { body: guildCommands })
                    .then(() => {
                    if (options.logInfo)
                        BurgerClient.logger.log(`Successfully registered ${guildCommands.length} guild commands.`);
                })
                    .catch(err => {
                    BurgerClient.logger.log(`An error occurred when deploying guild commands: ${err.message}`, 'ERROR');
                });
            });
            const deployGlobalCommands = (globalCommands) => __awaiter(this, void 0, void 0, function* () {
                yield rest.put(v10_1.Routes.applicationCommands(options.userId), { body: globalCommands })
                    .then(() => {
                    if (options.logInfo)
                        BurgerClient.logger.log(`Successfully registered ${globalCommands.length} global commands.`);
                })
                    .catch(() => {
                    BurgerClient.logger.log('An error occurred when deploying global commands.', 'ERROR');
                });
            });
            const guildCommands = [];
            const globalCommands = [];
            for (const command of commands) {
                if (options.logInfo)
                    BurgerClient.logger.log(`Loaded command ${command.data.name}.`);
                if (command.type === 'GUILD')
                    guildCommands.push(command.data.toJSON());
                else
                    globalCommands.push(command.data.toJSON());
            }
            yield deployGuildCommands(guildCommands);
            yield deployGlobalCommands(globalCommands);
        });
    }
    static isValid(command) {
        var _a;
        return !!(command === null || command === void 0 ? void 0 : command.data) && !!(command === null || command === void 0 ? void 0 : command.type) && !!((_a = command === null || command === void 0 ? void 0 : command.listeners) === null || _a === void 0 ? void 0 : _a.onExecute);
    }
    get client() {
        return this._client;
    }
    get user() {
        return this._client.user;
    }
    tryReady() {
        var _a;
        if (this._clientReady && this._dbReady)
            (_a = this._readyFunc) === null || _a === void 0 ? void 0 : _a.call(this, this._client);
    }
}
exports.BurgerClient = BurgerClient;
BurgerClient.logger = new logger_1.Logger('Burger Client');
