import * as chalk from 'chalk';

namespace log {
	export function warn(msg: string, ...extras: any[]) {
		console.log(
			chalk.bold.yellow.inverse(' WARNING '),
			chalk.bold.yellow(msg, ...extras),
		);
	}

	export function ok(msg: string, ...extras: any[]) {
		console.log(chalk.bold.greenBright('OK'), msg, ...extras);
	}

	export function err(err: string | Error, ...extras: any[]) {
		let msg = typeof err === 'string' ? err : err.message;
		console.log(
			chalk.bold.redBright.inverse(' ERROR '),
			chalk.bold.redBright(msg, ...extras),
		);
		if (err instanceof Error) {
			console.log(err, ...extras);
		}
	}
}

export default log;
