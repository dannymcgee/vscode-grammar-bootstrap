const path = require('path');

module.exports = {
	/**
	 * @param {string} testPath
	 * @param {string} snapshotExtension
	 */
	resolveSnapshotPath: (testPath, snapshotExtension) => {
		let basename = path.basename(testPath).replace(/\.spec\.ts$/, '');

		return path.resolve(
			path.dirname(testPath),
			`${basename}.foo` + snapshotExtension,
		);
	},

	/**
	 * @param {string} snapshotPath
	 * @param {string} snapshotExtension
	 */
	resolveTestPath: (snapshotPath, snapshotExtension) => {
		let basename = path
			.basename(snapshotPath)
			.replace(`.foo${snapshotExtension}`, '');

		return path.resolve(path.dirname(snapshotPath), `${basename}.spec.ts`);
	},

	testPathForConsistencyCheck: path.resolve(
		process.cwd(),
		'src/testing/example.spec.ts',
	),
};
