'use strict'

const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const debug = require('debug')
const log = debug('gitlab-artifacts-server:api')
const unzip = require('unzip-stream')

const apiClient = ({url, token}) => {
  const doCall = (apiUrl, opt) => {
    apiUrl = url + '/api/v4' + apiUrl
    if (!opt) opt = {}
    opt.headers = {'PRIVATE-TOKEN': token}
    log('call %o', apiUrl)
    return fetch(apiUrl, opt)
  }

  return {
    getSuccessPipelineByBranch: async (pid, branch) => {
      log('getting success pipelines for %s, branch=%s', pid, branch)
      let res = await doCall('/projects/' + pid + '/pipelines?ref=' + branch + '&per_page=1&status=success')
      res = await res.json()
      if (res.error) throw new Error(res.error)
      return res[0]
    },
    getSuccessJobsByPipeline: async (pid, pipeId, jobName) => {
      log('getting success jobs for %s, pipeline=%s', pid, pipeId)
      let res = await doCall('/projects/' + pid + '/pipelines/' + pipeId + '/jobs?per_page=1&scope=success')
      res = await res.json()
      if (res.error) throw new Error(res.error)
      return res.filter(res => res.name === jobName)[0]
    },
    downloadArtifacts: async (pid, job, out) => {
      log('downloading and extracting artifacts file for %s to %s', job.id, out)
      if (!job) {
        throw new Error('No matching job found!')
      }
      if (!job.artifacts_file) {
        throw new Error('Job did not produce artifacts file!')
      }

      let res = await doCall('/projects/' + pid + '/jobs/' + job.id + '/artifacts')
      return new Promise((resolve, reject) => {
        // const dest = fs.createWriteStream(outfile)

        res.body.on('error', (err) => {
          reject(err)
        })

        res.body.pipe(
          unzip
            .Extract({ path: out })
            .on('close', () => {
              fs.writeFileSync(path.join(out, 'ok'), '1')
              resolve()
            })
            .on('error', reject)
        )

        /* dest.on('finish', () => {
          log('finished download')
          resolve(outfile)
        })
        dest.on('error', (err) => {
          reject(err)
        })

        res.body.pipe(dest) */
      })
    }
  }
}

module.exports = apiClient
