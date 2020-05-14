import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const context = github.context

    const token = core.getInput('token', { required: true })
    const state = core.getInput('state', { required: true })
    const url = core.getInput('url')
    const output = core.getInput('output')
    const deployment = core.getInput('deployment', {
      required: context.payload.deployment === undefined,
    })
    const environment = core.getInput('environment', {
      required: context.payload.deployment === undefined,
    })

    const client = new github.GitHub(token)
    const params = {
      ...context.repo,
      event_type: 'deployment_status',
      client_payload: {
        ref: context.sha,
        state,
        deployment,
        environment,
      } as any,
    }

    if (!deployment) {
      params.client_payload.deployment = context.payload.deployment.id
    }

    if (!environment) {
      params.client_payload.environment = context.payload.deployment.environment
    }

    if (url) {
      params.client_payload.url = url
    }

    if (output) {
      params.client_payload.output = output
    }

    await client.repos.createDispatchEvent(params)
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
