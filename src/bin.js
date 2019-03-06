#!/usr/bin/env node

/* eslint-disable no-console */

'use strict'

const projectOptions = (yargs) => yargs
  .option('project', {
    describe: 'GitLab Project ID',
    type: 'string',
    required: true
  })
  .option('branch', {
    describe: 'Branch to fetch artifacts for',
    type: 'string',
    required: true
  })
  .option('job', {
    describe: 'Name of job that produces the artifacts',
    type: 'string',
    required: true
  })
  .option('tag', {
    describe: 'Fetch tags instead of branches',
    type: 'boolean'
  })
  .option('webhook', {
    describe: 'Enable /checkUpdate route with webhook X-Secret header',
    type: 'string'
  })
  .option('prefix', {
    describe: 'Prefix to append to URL (allows serving multiple projects over one instance)',
    type: 'string',
    default: '/'
  })
  .option('access-token', {
    describe: 'Basic authentication token required for access',
    type: 'string'
  })
  .option('path', {
    describe: 'Path to load from artifact',
    type: 'string'
  })
  .option('interval', {
    describe: 'Interval to check for updates',
    type: 'number',
    default: 3600 * 1000
  })

const mainOptions = (yargs) => yargs
  .option('host', {
    describe: 'Host to listen on',
    type: 'string',
    default: '::'
  })
  .option('port', {
    describe: 'Port to listen on',
    type: 'number',
    default: 5236
  })
  .option('url', {
    describe: 'GitLab Instance URL',
    type: 'string',
    default: 'https://gitlab.com'
  })
  .option('token', {
    describe: 'Private access token',
    type: 'string',
    required: true
  })

let argv = projectOptions(mainOptions(require('yargs'))).argv

const structureProjectOptions = (argv) => {
  return {
    artifactConfig: {
      path: argv.path,
      branch: argv.branch,
      tags: argv.tag,
      project: argv.project,
      webhook: argv.webhook,
      job: argv.job,
      interval: argv.interval
    },
    accessConfig: {
      prefix: argv.prefix,
      token: argv.accessToken
    }
  }
}

const config = {
  hapi: {
    port: argv.port,
    host: argv.host
  },
  gitlab: {
    url: argv.url,
    token: argv.token
  },
  artifacts: []
}

let lastLen
config.artifacts.push(structureProjectOptions(argv))
while (argv._ && argv._.length && lastLen !== argv._.length) {
  lastLen = argv._.length
  argv = projectOptions(require('yargs')(argv._)).argv
  config.artifacts.push(structureProjectOptions(argv))
}

const init = require('.')
init(config).catch(e => {
  console.error('')
  console.error('A fatal error has occured! Application has been terminated!')
  console.error('')
  console.error(e.stack)
  process.exit(1)
})
