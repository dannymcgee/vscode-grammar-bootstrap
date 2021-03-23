export interface JsonObject {
	[key: string]: string | JsonObject | JsonObject[];
}

export interface JsonGrammarCaptures {
	[key: string]: {
		name: string;
	};
}
export interface TMGrammarCaptures {
	[key: number]: {
		name: string;
	};
}

export interface JsonGrammarScope {
	name?: string;
	comment?: string;
	match?: string;
	begin?: string;
	end?: string;
	captures?: JsonGrammarCaptures;
	beginCaptures?: JsonGrammarCaptures;
	endCaptures?: JsonGrammarCaptures;
	contentName?: string;
	patterns?: JsonGrammarScope;
	include?: string;
}
export interface TMGrammarScope {
	name?: string;
	comment?: string;
	match?: string | RegExp;
	begin?: string | RegExp;
	end?: string | RegExp;
	captures?: TMGrammarCaptures;
	beginCaptures?: TMGrammarCaptures;
	endCaptures?: TMGrammarCaptures;
	contentName?: string;
	patterns?: TMGrammarScope[];
	include?: string;
}

export interface JsonGrammar {
	name: string;
	scopeName: string;
	injectionSelector?: string;
	fileTypes?: string[];
	keyEquivalent?: string;
	uuid?: string;
	patterns: JsonGrammarScope[];
	repository: {
		[key: string]: JsonGrammarScope;
	};
}
export interface TMGrammar {
	name: string;
	scopeName: string;
	injectionSelector?: string;
	fileTypes?: string[];
	keyEquivalent?: string;
	uuid?: string;
	patterns: TMGrammarScope[];
	repository: {
		[key: string]: TMGrammarScope;
	};
}
