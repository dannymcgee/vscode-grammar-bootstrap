import * as Path from 'path';
import { promises as fs } from 'fs';

import {
	JsonObject,
	JsonGrammarCaptures,
	TMGrammarCaptures,
	TMGrammarScope,
	JsonGrammarScope,
	JsonGrammar,
} from '../../src/types';

import {
	assertType,
	isCapturesKey,
	isPatternsKey,
	isRegexKey,
	isStringKey,
} from './type-guards';

import log from '../log';
import fmt from './fmt';

export async function processIndex(
	outPath: string,
	grammar: JsonGrammar,
	repository?: Map<string, TMGrammarScope>,
) {
	let lines: string[] = [];
	let repoNames = repository ? Array.from(repository.keys()) : [];

	let typesPath = Path.resolve(process.cwd(), './src/types');
	let typesPathRel = Path.relative(outPath, typesPath).replace(/\\/g, '/');
	lines.push(`import { TMGrammar } from '${typesPathRel}';\n`);

	if (repoNames.length) {
		lines.push(`import {`);
		lines.push(...repoNames.map((name) => `${name},`));
		lines.push(`} from './repository';\n`);
	}

	lines.push(`const grammar: TMGrammar = {`);

	Object.keys(grammar).forEach((key) => {
		assertType<keyof JsonGrammar>(key);
		let value = grammar[key];

		switch (key) {
			case 'name':
			case 'injectionSelector':
			case 'scopeName': {
				assertType<string>(value);
				lines.push(`${key}: '${value}',`);

				break;
			}
			case 'patterns': {
				assertType<JsonGrammarScope[]>(value);
				lines.push(`${key}: [`);
				lines.push(value.map(processScope).map(printScope).join(',\n'));
				lines.push(`],`);

				break;
			}
			case 'repository': {
				lines.push(`${key}: {`);
				lines.push(repoNames.join(',\n'));
				lines.push(`},`);

				break;
			}
			// prettier-ignore
			default: {
				log.warn(`Unrecognized grammar key '${key}' -- output may be unexpected!`);

				if (typeof value === 'string') {
					lines.push(`${key}: '${value}',`);
				}
				else if (
					Array.isArray(value) &&
					(value as any).every((it: unknown) => typeof it === 'string')
				) {
					assertType<string[]>(value);
					lines.push(`${key}: [`);
					lines.push(value.map((it) => `'${it}'`).join(',\n'));
					lines.push('],');
				}
				else {
					log.err(`Unsure how to handle value: ${value}`);
					log.err(`Discarding value of key '${key}'!`);
				}
			}
		}
	});

	lines.push(`};\n`);
	lines.push(`export default grammar;`);

	let index = Path.resolve(outPath, 'index.ts');
	let contents = await fmt.print(lines.join('\n'));

	await fs.writeFile(index, contents);
}

export async function processRepo(
	outPath: string,
	repository: { [key: string]: JsonGrammarScope },
): Promise<Map<string, TMGrammarScope>> {
	let repo = new Map<string, TMGrammarScope>();

	Object.keys(repository).forEach((name) => {
		repo.set(name, processScope(repository[name]));
		log.ok(`Processed repo '${name}'`);
	});

	let repoPath = Path.resolve(outPath, 'repository');
	let typesPath = Path.resolve(process.cwd(), './src/types');
	let typesPathRel = Path.relative(repoPath, typesPath).replace(/\\/g, '/');

	let index: string = '';
	await fs.mkdir(repoPath);

	// prettier-ignore
	for (let [name, scope] of repo) {
		let file = Path.resolve(repoPath, `${name}.ts`);
		let contents = await fmt.print([
			`import { TMGrammarScope } from '${typesPathRel}';`,
			``,
			`export const ${name}: TMGrammarScope = ${printScope(scope)}`,
			``,
		]);

		await fs.writeFile(file, contents);
		index += `export * from './${name}'\n`;
	}

	index = await fmt.print(index);
	await fs.writeFile(Path.resolve(repoPath, 'index.ts'), index);

	return repo;
}

function processScope(scope: JsonGrammarScope): TMGrammarScope {
	let result: TMGrammarScope = {};

	// prettier-ignore
	Object.keys(scope).forEach((key) => {
		let value = scope[key];

		if (isRegexKey(key)) {
			assertType<string>(value);
			try {
				result[key] = new RegExp(value);
			} catch(_) {
				log.warn(`Failed to parse pattern: ${value}`);
				result[key] = value;
			}
		}
		else if (isPatternsKey(key)) {
			assertType<JsonObject[]>(value);
			result[key] = value.map(processScope);
		}
		else if (isCapturesKey(key)) {
			assertType<JsonGrammarCaptures>(value);
			let captures: TMGrammarCaptures = {};
			Object.entries(value).forEach(([key, val]) => {
				captures[parseInt(key)] = val;
			});
			result[key] = captures;
		}
		else if (isStringKey(key)) {
			assertType<string>(value);
			result[key] = value;
		}
		else {
			log.warn(`WARNING: Unrecognized key '${key}'; discarding!`);
		}
	});

	return result;
}

function printScope(scope: TMGrammarScope): string {
	let result = ['{'];

	// prettier-ignore
	Object.entries(scope).forEach(([key, value]) => {
		let line = `${key}: `;

		if (isRegexKey(key)) {
			if (typeof value === 'string')
				line += `\`${value}\``;
			else {
				assertType<RegExp>(value);
				line += `/${value.source}/${value.flags}`;
			}
		}
		else if (isStringKey(key)) {
			assertType<string>(value);
			line += `'${value}'`;
		}
		else if (isCapturesKey(key)) {
			assertType<TMGrammarCaptures>(value);
			line += printCaptures(value);
		}
		else if (isPatternsKey(key)) {
			assertType<TMGrammarScope[]>(value);
			line += '[' + value.map(printScope).join(',\n') + ']';
		}
		else {
			log.warn(`Unrecognized key '${key}' -- discarding`);
		}

		result.push(`${line},`);
	});

	result.push('}');

	return result.join('\n');
}

function printCaptures(captures: TMGrammarCaptures): string {
	let result = ['{'];

	Object.keys(captures).forEach((key: any) => {
		key = parseInt(key);
		let { name } = captures[parseInt(key)];

		result.push(`${key}: { name: '${name}' },`);
	});

	result.push('}');

	return result.join('\n');
}
