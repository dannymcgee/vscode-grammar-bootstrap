import * as chalk from 'chalk';

namespace log {
	export function warn(msg: string) {
		console.log(
			chalk.bold.yellow.inverse(' WARNING '),
			chalk.bold.yellow(msg),
		);
	}

	export function ok(msg: string) {
		console.log(chalk.bold.greenBright('OK'), msg);
	}

	export function err(err: string | Error) {
		let msg = typeof err === 'string' ? err : err.message;
		console.log(
			chalk.bold.redBright.inverse(' ERROR '),
			chalk.bold.redBright(msg),
		);
		if (err instanceof Error) {
			console.log(err);
		}
	}
}

export default log;
