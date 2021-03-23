import * as Path from 'path';
import { promises as fs } from 'fs';

import cli from '../cli';
import log from '../log';
import { clean } from '../clean';
import { processIndex, processRepo } from './processing';
import { JsonGrammar, TMGrammarScope } from '../../src/types';

interface Args {
	default: string;
	out: string;
}

(async function () {
	let { default: path, out }: Args = cli.args();
	if (!path) {
		log.warn('TODO - print usage');
		cli.err('Expected path to a grammar JSON file');
	}

	try {
		await decompile(path, out);
	} catch (err) {
		cli.err(err);
	}

	async function decompile(path: string, out = 'out') {
		let file = Path.resolve(process.cwd(), path);
		let outPath = Path.resolve(process.cwd(), out);

		await clean(outPath);

		let contents = await fs.readFile(file);
		let grammar: JsonGrammar = JSON.parse(contents.toString());
		log.ok(`Parsed grammar for '${grammar.name}'`);

		let repo: Map<string, TMGrammarScope> = undefined;
		if ('repository' in grammar) {
			repo = await processRepo(outPath, grammar.repository);
		}

		await processIndex(outPath, grammar, repo!);
	}
})();
