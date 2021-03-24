import * as Path from 'path';
import * as shell from 'shelljs';

import { name, version } from '../package.json';

(function () {
	let vsixPath = Path.resolve(process.cwd(), `${name}-${version}.vsix`);

	shell.exec(`code --install-extension "${vsixPath}"`);
})();
