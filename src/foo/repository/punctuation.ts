import { TMGrammarScope } from '../../types';

export const punctuation: TMGrammarScope = {
	patterns: [
		{
			match: /[()]/,
			name: 'punctuation.brace.round.foo',
		},
		{
			match: /[{}]/,
			name: 'punctuation.brace.curly.foo',
		},
		{
			match: /[\[\]]/,
			name: 'punctuation.brace.square.foo',
		},
		{
			match: /,/,
			name: 'punctuation.separator.comma.foo',
		},
		{
			match: /:/,
			name: 'punctuation.separator.key-value.foo',
		},
		{
			match: /\./,
			name: 'punctuation.accessor.foo',
		},
		{
			match: /;/,
			name: 'punctuation.terminator.foo',
		},
	],
};
