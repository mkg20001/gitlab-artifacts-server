'use strict'

const os = require('os')
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp').sync
const rimraf = require('rimraf').sync

const debug = require('debug')
const log = debug('gitlab-artifacts-server:artifacts')

const TMP = path.join(os.tmpdir(), 'gitlab-artifacts-server')

module.exports = (api, {project, branch, job}) => {
  const tmp = path.join(TMP, project)
  mkdirp(tmp)

  let mainProm
  let latestDir

  const main = async () => {
    log('getting latest')
    const pipe = await api.getSuccessPipelineByBranch(project, branch)
    if (!pipe) {
      throw new Error('No pipeline found! Check if you had any successfull pipelines for ' + branch + '!')
    }
    const latest = await api.getSuccessJobsByPipeline(project, pipe.id, job)
    if (!latest) {
      throw new Error('No job found! Check if you had any successfull job named ' + job + ' for ' + pipe.id + '!')
    }
    const out = path.join(tmp, String(latest.id))
    if (fs.existsSync(path.join(out, 'ok'))) {
      log('already up-to-date')
      return // up-to-date
    }

    await api.downloadArtifacts(project, latest, out) // dl and extract

    fs.readdirSync(tmp).filter(dir => dir !== String(latest.id)).forEach(dir => {
      log('cleanup old', dir)
      rimraf(path.join(tmp, dir))
    }) // rm old

    log('newest is %s', out)
    latestDir = out
  }

  const A = {
    main: async () => {
      if (mainProm) {
        return mainProm
      } else {
        mainProm = main()
        let mp = mainProm
        try {
          await mainProm
        } catch (e) {
          // silently ignore error, will re-throw below
        }
        mainProm = null
        return mp
      }
    },
    waitForMain: async () => {
      if (mainProm) {
        await mainProm
      }
    },
    getLatestDir: async () => {
      if (!latestDir) {
        await A.main()
      } else {
        await A.waitForMain()
      }

      return latestDir
    }
  }

  return A
}
