import { TMGrammarScope } from '../../types';
import { regex } from '../../utility';

const IDENT = /[a-zA-Z][_a-zA-Z0-9]*/;

export const identifier: TMGrammarScope = {
	patterns: [
		{
			match: regex`/\b(${IDENT})\s*(?=\()/`,
			captures: {
				1: { name: 'entity.name.function.foo' },
			},
		},
		{
			match: /\b([a-zA-Z][_a-zA-Z0-9]*)\b/,
			captures: {
				1: { name: 'variable.other.foo' },
			},
		},
	],
};
