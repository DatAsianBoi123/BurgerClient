"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
const customChalk = new chalk_1.default.Instance({
    level: 1,
});
class Logger {
    constructor(name) {
        this.name = name;
    }
    log(message, level = 'INFO') {
        switch (level) {
            case 'DEBUG':
                console.log(customChalk.blue(`${this.name}>`) + ` ${message}`);
                break;
            case 'INFO':
                console.log(`${this.name}> ${message}`);
                break;
            case 'WARNING':
                console.log(customChalk.bgYellow.black(`${this.name}>`) + ` ${message}`);
                break;
            case 'ERROR':
                console.log(customChalk.red(`${this.name}>`) + ` ${message}`);
                break;
            case 'CRITICAL':
                console.log(customChalk.bgRed.black(`${this.name}>`) + ` ${message}`);
                break;
        }
    }
}
exports.Logger = Logger;
