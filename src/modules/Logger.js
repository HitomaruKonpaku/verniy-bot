module.exports = {
    log: msg => {
        console.log(`INFO ${msg}`)
    },
    debug: msg => {
        console.log(`DEBUG ${msg}`)
    },
    warn: msg => {
        console.log(`WARN ${msg}`)
    },
    error: error => {
        console.log(`ERROR ${error}`)
        console.trace(error)
    },
}