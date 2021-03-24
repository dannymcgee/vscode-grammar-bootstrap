import { TMGrammarScope } from '../../types';

export const stringLiteral: TMGrammarScope = {
	name: 'string.foo',
	begin: /"/,
	beginCaptures: {
		0: { name: 'punctuation.definition.string.begin.foo' },
	},
	end: /(?<!\\)(")|\\\\(")/,
	endCaptures: {
		1: { name: 'punctuation.definition.string.end.foo' },
		2: { name: 'punctuation.definition.string.end.foo' },
	},
};
