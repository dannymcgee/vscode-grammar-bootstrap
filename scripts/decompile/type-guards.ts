export function isRegexKey(key: string): key is 'match' | 'begin' | 'end' {
	return /^(match|begin|end)$/.test(key);
}

export function isPatternsKey(key: string): key is 'patterns' {
	return key === 'patterns';
}

// prettier-ignore
export function isCapturesKey(key: string): key is 'captures'|'beginCaptures'|'endCaptures' {
	return /^(begin|end)?[Cc]aptures$/.test(key);
}

// prettier-ignore
export function isStringKey(key: string): key is 'name'|'comment'|'contentName'|'include' {
	return /^(name|comment|contentName|include)$/.test(key);
}

export function assertType<T>(value: unknown): asserts value is T {}
