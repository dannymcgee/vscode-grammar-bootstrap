import { promises as fs } from 'fs';
import * as rimraf from 'rimraf';

export function clean(path: string) {
	return new Promise<void>((resolve, reject) => {
		rimraf(path, (err) => {
			if (err) reject(err);
			else fs.mkdir(path).then(resolve).catch(reject);
		});
	});
}
