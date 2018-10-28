'use strict'

const Hapi = require('hapi')
const Joi = require('joi')
const pino = require('pino')
const log = pino({name: 'gitlab-artifacts-server'})
const path = require('path')

const APIClient = require('./api')

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

  if (config.artifacts.webhook) {
    server.route({
      method: 'GET',
      path: '/checkUpdate',
      config: {
        handler: async (h, request) => {
          await artifacts.checkUpdate()
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
