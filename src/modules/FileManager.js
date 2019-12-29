const fs = require('fs')

class FileManager {

  constructor() {
    if (!fs.existsSync(this.CacheDir)) {
      fs.mkdirSync(this.CacheDir, { recursive: true })
    }
  }

  get CacheDir() {
    return '.cache'
  }

}

module.exports = new FileManager()
