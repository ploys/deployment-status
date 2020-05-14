import crypto from 'crypto'
import path from 'path'

import nock from 'nock'
import { Octokit } from '@octokit/rest'

type Dispatch = Omit<Octokit.ReposCreateDispatchEventParams, 'owner' | 'repo'>

describe('Deployment Status', () => {
  const owner = 'ploys'
  const repo = 'tests'
  const sha = crypto.createHash('sha1').digest('hex')

  beforeAll(() => {
    process.env.GITHUB_ACTION = 'ploysdeployment-status'
    process.env.GITHUB_ACTOR = 'ploys'
    process.env.GITHUB_EVENT_NAME = 'deployment'
    process.env.GITHUB_EVENT_PATH = path.join(__dirname, 'fixtures/payload.json')
    process.env.GITHUB_REF = sha
    process.env.GITHUB_REPOSITORY = `${owner}/${repo}`
    process.env.GITHUB_SHA = sha
    process.env.GITHUB_WORKFLOW = 'deploy'

    process.env.INPUT_TOKEN = 'token'
    process.env.INPUT_STATE = 'success'
    process.env.INPUT_DEPLOYMENT = '1'
    process.env.INPUT_ENVIRONMENT = 'production'
    process.env.INPUT_URL = 'https://www.example.com'
    process.env.INPUT_OUTPUT = 'Hello world'
  })

  beforeEach(() => {
    nock.disableNetConnect()
  })

  test('creates a repository dispatch event', async done => {
    const event: Dispatch = {
      event_type: 'deployment_status',
      client_payload: {
        ref: sha,
        state: 'success',
        deployment: '1',
        environment: 'production',
        url: 'https://www.example.com',
        output: 'Hello world',
      },
    }

    nock('https://api.github.com')
      .post(`/repos/${owner}/${repo}/dispatches`, (body: Dispatch) => {
        done(expect(body).toMatchObject(event))

        return true
      })
      .reply(200)

    await import('../src')
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
