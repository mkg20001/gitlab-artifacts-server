#!/usr/bin/env node

/* eslint-disable no-console */

'use strict'

const argv = require('yargs')
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
  .option('interval', {
    describe: 'Interval to check for updates',
    type: 'number',
    default: 3600 * 1000
  })
  .argv

const config = {
  hapi: {
    port: argv.port,
    host: argv.host
  },
  gitlab: {
    url: argv.url,
    token: argv.token
  },
  artifacts: {
    branch: argv.branch,
    tags: argv.tag,
    project: argv.project,
    webhook: argv.webhook,
    job: argv.job,
    interval: argv.interval
  }
}

const init = require('.')
init(config).catch(e => {
  console.error('')
  console.error('A fatal error has occured! Application has been terminated!')
  console.error('')
  console.error(e.stack)
  process.exit(1)
})
