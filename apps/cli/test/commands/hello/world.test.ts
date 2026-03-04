import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('hello world', () => {
  it('supports default person value', async () => {
    const result = await runCommand('hello world')
    expect(result).to.be.ok
  })
})
