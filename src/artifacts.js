'use strict'

const os = require('os')
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp').sync
const rimraf = require('rimraf').sync

const TMP = path.join(os.tmpdir(), 'gitlab-artifacts-server')

module.exports = (api, {project, branch}) => {
  const tmp = path.join(TMP, project)
  mkdirp(tmp)

  let mainProm
  let latestDir

  const main = async () => {
    const latest = await api.getSuccessJobByBranch(project, branch)
    if (!latest) {
      throw new Error('No job found! Check if you had any successfull pipelines for ' + branch + '!')
    }
    const out = path.join(tmp, latest.id)
    if (fs.existsSync(path.join(out, 'ok'))) {
      return out // up-to-date
    }

    await api.downloadArtifacts(project, latest, out) // dl and extract

    fs.readdirSync(tmp).filter(dir => dir !== String(latest.id)).forEach(dir => rimraf(path.join(tmp, dir))) // rm old

    latestDir = out
    return out
  }

  return {
    main: async () => {
      if (mainProm) {
        return mainProm
      } else {
        mainProm = main()
        const res = await mainProm
        mainProm = null
        return res
      }
    },
    waitForMain: async () => {
      if (mainProm) {
        await mainProm
      }
    }
  }
}
