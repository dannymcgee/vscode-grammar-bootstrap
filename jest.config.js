module.exports = {
	preset: 'ts-jest',
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.spec.json',
		},
	},
	setupFilesAfterEnv: ['<rootDir>/src/testing/lib/serializers.ts'],
	testEnvironment: 'node',
	rootDir: '.',
	snapshotResolver: '<rootDir>/src/testing/lib/resolver.js',
};
