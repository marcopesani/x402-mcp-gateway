import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('hello', () => {
  it('runs hello with custom sender', async () => {
    const result = await runCommand('hello friend --from oclif')
    expect(result).to.be.ok
  })
})
