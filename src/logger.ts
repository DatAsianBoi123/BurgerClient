import chalk from 'chalk';
import { LoggerLevels } from './typings';

const customChalk = new chalk.Instance({
  level: 1,
});

export class Logger {
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public log(message: string, level: LoggerLevels = 'INFO') {
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
