import * as prettier from 'prettier';

namespace fmt {
	export async function print(src: string | string[]): Promise<string> {
		let options = await prettier.resolveConfig(__filename);
		if (Array.isArray(src)) src = src.join('\n');

		return prettier.format(src, {
			...options,
			parser: 'typescript',
		});
	}
}

export default fmt;
