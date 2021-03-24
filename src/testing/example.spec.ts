import { loadTestFile } from '../testing/utility';

describe('example', () => {
	it('should work', async () => {
		let code = await loadTestFile('example.foo');

		expect(code).toMatchSnapshot();
	});
});
