import { TMGrammar } from '../types';
import { identifier, punctuation, stringLiteral } from './repository';

const grammar: TMGrammar = {
	name: 'foo',
	scopeName: 'source.foo',
	patterns: [
		{ include: '#stringLiteral' },
		{ include: '#punctuation' },
		{ include: '#identifier' },
	],
	repository: {
		identifier,
		punctuation,
		stringLiteral,
	},
};

export default grammar;
