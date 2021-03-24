import { promises as fs } from 'fs';
import * as Path from 'path';

import { JsonObject, TMGrammar } from '../src/types';
import { clean } from './clean';
import log from './log';
import cli from './cli';

interface Args {
	default: string;
	name: string;
	out: string;
}

(async function () {
	let { default: srcPath, name, out }: Args = cli.args();

	let outPath = Path.resolve(process.cwd(), out ?? 'dist');
	let relPath = '';
	let absPath = '';

	if (srcPath) {
		absPath = Path.resolve(process.cwd(), srcPath);
		relPath = Path.relative(__dirname, absPath).replace(/\\/g, '/');
	} else {
		relPath = '../src/foo';
		absPath = Path.resolve(__dirname, relPath);
	}

	try {
		let grammar = (await import(relPath)).default;

		await build(grammar, outPath, name);
		await copyConfigs(absPath, outPath);
	} catch (err) {
		cli.err(err);
	}

	async function build(grammar: TMGrammar, outPath: string, name = 'foo') {
		let processed = toJson(grammar);
		let content = JSON.stringify(processed, null, '\t');
		let filePath = Path.resolve(outPath, `${name}.tmLanguage.json`);

		await clean(outPath);
		await fs.writeFile(filePath, content);

		log.ok(`Wrote file '${filePath}'`);
	}

	function copyConfigs(srcPath: string, outPath: string) {
		return new Promise<void>(async (resolve, reject) => {
			let files = await fs.readdir(srcPath);
			files = files.filter((file) => file.endsWith('json'));

			let pending = files.length;
			let done = 0;

			if (!pending) resolve();

			files.forEach((file) => {
				let dest = Path.resolve(outPath, file);
				file = Path.resolve(srcPath, file);

				fs.copyFile(file, dest)
					.catch(reject)
					.then(() => {
						log.ok(`Copied '${file}' -> '${dest}'`);
						if (++done === pending) resolve();
					});
			});
		});
	}

	function toJson(grammar: TMGrammar): JsonObject {
		let processed: JsonObject = {};
		for (let [key, value] of Object.entries(grammar)) {
			// prettier-ignore
			if (typeof value === 'string')
				processed[key] = value;
			else if (value instanceof RegExp)
				processed[key] = value.toString().replace(/^\/|\/$/g, '');
			else if (Array.isArray(value))
				processed[key] = value.map(toJson);
			else
				processed[key] = toJson(value);
		}
		return processed;
	}
})();
