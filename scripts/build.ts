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
	if (srcPath) {
		let absPath = Path.resolve(process.cwd(), srcPath);
		let relPath = Path.relative(__dirname, absPath).replace(/\\/g, '/');
		srcPath = relPath;
	} else {
		srcPath = '../src';
	}

	try {
		let grammar = (await import(srcPath)).default;

		build(grammar, name, out);
	} catch (err) {
		cli.err(err);
	}

	async function build(grammar: TMGrammar, name = 'foo', out = 'dist') {
		let processed = toJson(grammar);
		let content = JSON.stringify(processed, null, '\t');

		let outPath = Path.resolve(process.cwd(), out);
		let filePath = Path.resolve(outPath, `${name}.tmLanguage.json`);

		await clean(outPath);
		await fs.writeFile(filePath, content);

		log.ok(`Wrote file '${filePath}'`);
	}

	function toJson(grammar: TMGrammar): JsonObject {
		let processed: JsonObject = {};
		for (let [key, value] of Object.entries(grammar)) {
			// prettier-ignore
			processed[key] =
				typeof value === 'string'
					? value :
				value instanceof RegExp
					? value.toString().replace(/^\/|\/$/g, '') :
				value instanceof Array
					? value.map(toJson)
					: toJson(value)
		}
		return processed;
	}
})();
