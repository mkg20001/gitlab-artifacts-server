'use strict'

const Hapi = require('hapi')
const Joi = require('joi')
const pino = require('pino')
const path = require('path')
const log = pino({name: 'gitlab-artifacts-server'})

const APIClient = require('./api')
const Artifacts = require('./artifacts')

const init = async (config) => {
  const server = Hapi.server(config.hapi)
  const api = APIClient(config.gitlab)
  const artifacts = Artifacts(api, config.artifacts)

  await server.register({
    plugin: require('hapi-pino'),
    options: {name: 'gitlab-artifact-server'}
  })

  await server.register({
    plugin: require('inert')
  })

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: async (request, h) => {
      const latestDir = await artifacts.getLatestDir()
      let p = path.join(latestDir, request.path)
      return h.file(p, {confine: false})
    }
  })

  if (config.artifacts.webhook) {
    server.route({
      method: 'GET',
      path: '/checkUpdate',
      config: {
        handler: async (h, request) => {
          await artifacts.main()
        },
        validate: {
          headers: {
            'x-secret': Joi.string().regex(new RegExp('^' + config.artifacts.webhook + '$'))
          },
          options: {
            allowUnknown: true
          }
        }
      }
    })
  }

  await server.start()
}

module.exports = init
