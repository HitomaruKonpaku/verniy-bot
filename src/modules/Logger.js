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
    error: err => {
        console.log(`ERROR ${err.message ? err.message : err}`)
        console.trace(err)
    },
}