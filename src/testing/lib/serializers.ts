/*
Portions of the code here were borrowed from:
https://github.com/PanAeon/vscode-tmgrammar-test

which is licensed as follows:

	Copyright 2019 PanAeon

	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
	the Software, and to permit persons to whom the Software is furnished to do so,
	subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
	FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
	COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
	IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import { expect, beforeAll } from '@jest/globals';
import { OnigScanner, OnigString, loadWASM } from 'vscode-oniguruma';
import * as tm from 'vscode-textmate';
import * as path from 'path';
import * as fs from 'fs';

import tsGrammar from '../../foo';
import { TMGrammar } from '../../types';

type FooCode = string;
interface AnnotatedLine {
	src: string;
	tokens: tm.IToken[];
}

let grammar: tm.IGrammar;

beforeAll(async () => {
	let rawGrammar = processGrammar(tsGrammar);

	const wasmBin = fs.readFileSync(
		path.resolve(
			process.cwd(),
			'node_modules/vscode-oniguruma/release/onig.wasm',
		),
	).buffer;

	const onigLib = loadWASM(wasmBin).then(() => ({
		createOnigScanner: (patterns: string[]) => new OnigScanner(patterns),
		createOnigString: (str: string) => new OnigString(str),
	}));

	const registry = new tm.Registry({
		onigLib,
		// prettier-ignore
		loadGrammar: (scope) => new Promise((resolve, reject) => {
			if (scope !== 'source.foo')
				reject(`Expected 'source.foo', received '${scope}'`);
			resolve(rawGrammar);
		}),
	});

	grammar = (await registry.loadGrammar('source.foo'))!;
});

expect.addSnapshotSerializer({
	serialize(val: FooCode): string {
		let tokens = getVSCodeTokens(val.replace(/\t/g, '    '));
		let result: string[] = tokens.reduce<string[]>((accum, line) => {
			accum.push('-> ' + line.src);
			if (line.src.trim().length) {
				let tokens = line.tokens
					.map(({ scopes, startIndex, endIndex }) => ({
						startIndex,
						endIndex,
						// prettier-ignore
						scopes: scopes.filter((scope) => !/^meta|^source\.foo$/.test(scope)),
					}))
					.filter((token) => token.scopes.length > 0);

				tokens.forEach((token) => {
					accum.push(
						' | ' +
							' '.repeat(token.startIndex) +
							'^'.repeat(token.endIndex - token.startIndex) +
							' ' +
							token.scopes.reverse().join('  '),
					);
				});
			}
			return accum;
		}, []);

		return '\n' + result.join('\n');
	},

	test(val: unknown): val is FooCode {
		return true; // Just use this serializer for all snapshots
	},
});

function getVSCodeTokens(source: string): AnnotatedLine[] {
	if (!grammar)
		throw new Error(`Tried to get tokens but there's no grammar!`);

	let ruleStack: tm.StackElement | null = null;
	return source.split(/\r\n|\n/).map((line: string) => {
		let result = grammar.tokenizeLine(line, ruleStack);
		ruleStack = result.ruleStack;

		return {
			src: line,
			tokens: result.tokens,
		};
	});
}

function processGrammar(grammar: TMGrammar): tm.IRawGrammar {
	let processed = {} as any;

	for (let [key, value] of Object.entries(grammar)) {
		if (typeof value === 'string') {
			processed[key] = value;
		} else if (value instanceof RegExp) {
			let source = value.source;
			let flags = value.flags;
			processed[key] = (flags ? `(?${flags})` : '') + source;
		} else if (value instanceof Array) {
			processed[key] = value.map(processGrammar);
		} else {
			processed[key] = processGrammar(value);
		}
	}

	return processed;
}
