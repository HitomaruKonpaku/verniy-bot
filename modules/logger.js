module.exports = {
    info: data => {
        console.log(`INFO: ${data}`)
    },
    debug: data => {
        console.log(`DEBUG: ${JSON.stringify(data)}`)
    },
    error: data => {
        console.error(new Error(data))
    },
    custom: (level, data) => {
        console.log(`${level.toString().toUpperCase()}: ${data}`)
    },
}