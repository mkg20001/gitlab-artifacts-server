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

  await server.register({
    plugin: require('hapi-pino'),
    options: {name: 'gitlab-artifact-server'}
  })

  await server.register({
    plugin: require('inert')
  })

  config.artifacts.forEach(({artifactConfig, accessConfig}) => {
    const artifacts = Artifacts(api, artifactConfig)

    const b64accessAuth = accessConfig.token ? Buffer.from(accessConfig.token + ':').toString('base64') : false
    const b64webhookAuth = accessConfig.webhook ? Buffer.from(accessConfig.webhook + ':').toString('base64') : false
    let prefix = accessConfig.prefix || '/'

    if (!prefix.startsWith('/')) { prefix = '/' + prefix }
    if (!prefix.endsWith('/')) { prefix += '/' }

    server.route({
      method: 'GET',
      path: prefix + '{param*}',
      config: {
        handler: async (request, h) => {
          if (b64accessAuth) {
            if (request.headers.authorization !== b64accessAuth) {
              return Boom.forbidden('invalid authorization header')
            }
          }

          let latestDir
          try {
            latestDir = await artifacts.getLatestDir()
          } catch (e) {
            log.error(e)
            return Boom.boomify(e, {statusCode: 503})
          }
          let p = path.join(latestDir, request.path.replace(prefix, ''))
          return h.file(p, {confine: false})
        }
      }
    })

    if (b64webhookAuth) {
      server.route({
        method: 'GET',
        path: prefix + 'checkUpdate',
        config: {
          handler: async (h, request) => {
            if (request.headers.authorization !== b64webhookAuth) {
              return Boom.forbidden('invalid authorization header')
            }

            try {
              await artifacts.main()
              return {ok: true}
            } catch (e) {
              log.error(e)
              return {
                statusCode: 500,
                error: 'Internal Server Error',
                message: e.toString()
              }
            }
          }
        }
      })
    }
  })

  await server.start()
}

module.exports = init
