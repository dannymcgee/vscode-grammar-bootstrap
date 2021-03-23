import log from './log';

namespace cli {
	export function err(err: Error | string) {
		log.err(err);

		process.exit(1);
	}

	export function args(): any {
		let args = process.argv.slice(2);
		let result: any = {};

		let i = 0;
		while (i < args.length) {
			let next = args[i];

			// prettier-ignore
			if (next.startsWith('-')) {
				let key = next.replace(/^-+/, '');
				if (result[key] != null) {
					err(`Duplicate argument key '${key}'`);
				}

				let val: any;

				if (
					i + 1 >= args.length ||
					args[i + 1].startsWith('-')
				) {
					val = true;

					i++;
				}
				else {
					val = args[i + 1];

					if (val === 'true')
						val = true;
					else if (val === 'false')
						val = false;
					else if (/^[0-9.]+$/.test(val))
						val = +val;

					i += 2;
				}

				result[key] = val;
				continue;
			}

			if (!result.default) {
				result.default = next;
				i++;
			} else {
				err(
					`Tried to add default arg '${next}',` +
						`but args already has default '${result.default}'`,
				);
			}
		}

		return result;
	}
}

export default cli;
