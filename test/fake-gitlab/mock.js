'use strict'

const Hapi = require('hapi')
const path = require('path')

const init = async (config) => {
  const server = Hapi.server({host: '::', port: 5382})

  await server.register({
    plugin: require('inert')
  })

  server.route({
    method: 'GET',
    path: '/{param*}',
    config: {
      handler: async (request, h) => {
        const file = path.join(__dirname, (request.url.pathname + request.url.search).replace('/', '').replace(/[^a-z0-9]/gm, '_'))
        console.log('Serving', file)
        return h.file(file, {confine: false})
      }
    }
  })

  await server.start()
}

init()
