require('dotenv').config()

try {
    require('./serverWatcher').start()
    require('./main').start()
} catch (err) {
    console.trace(err)
}
