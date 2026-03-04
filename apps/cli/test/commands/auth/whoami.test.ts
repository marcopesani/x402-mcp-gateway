import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('auth whoami', () => {
  it('command metadata is registered', async () => {
    const result = await runCommand('auth whoami')
    expect(result).to.be.ok
  })
})
