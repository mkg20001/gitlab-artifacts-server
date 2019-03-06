'use strict'

const Hapi = require('hapi')
const path = require('path')

require('colors')
const log = (...a) => console.log('%s', '[MOCK]'.grey.bold, ...a.map(l => l.grey)) // eslint-disable-line no-console

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
        log('Serving', file)
        return h.file(file, {confine: false})
      }
    }
  })

  await server.start()
}

init().then(() => log('Mock ready'), console.error) // eslint-disable-line no-console
