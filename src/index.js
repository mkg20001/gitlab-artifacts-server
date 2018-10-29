'use strict'

const Hapi = require('hapi')
const Joi = require('joi')
const Boom = require('boom')
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
      let latestDir
      try {
        latestDir = await artifacts.getLatestDir()
      } catch (e) {
        log.error(e)
        return Boom.boomify(e, {statusCode: 503})
      }
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
          try {
            await artifacts.main()
          } catch (e) {
            log.error(e)
            return {
              statusCode: 500,
              error: 'Internal Server Error',
              message: e.toString()
            }
          }
        },
        validate: {
          headers: {
            'x-secret': Joi.string().required().regex(new RegExp('^' + config.artifacts.webhook + '$'))
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
