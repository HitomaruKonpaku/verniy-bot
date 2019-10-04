const fs = require('fs')
const path = require('path')

class FileManager {

  constructor() {
    if (!fs.existsSync(this.CacheDir)) {
      fs.mkdirSync(this.CacheDir, { recursive: true })
    }
  }

  get CacheDir() {
    return '.cache'
  }

  get FbAppStateFile() {
    return path.join(this.CacheDir, 'FbAppState.json')
  }

}

module.exports = new FileManager()
