module.exports = {
  log: msg => {
    console.log(`INFO ${msg}`)
  },
  debug: msg => {
    console.log(`DEBUG ${msg}`)
  },
  warn: err => {
    const msg = err.message ? err.message : err
    console.log(`WARN ${msg}`)
  },
  error: err => {
    const msg = err.message ? err.message : err
    console.log(`ERROR ${msg}`)
    console.trace(err)
  }
}
