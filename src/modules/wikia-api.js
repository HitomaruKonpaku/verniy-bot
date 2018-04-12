const request = require('request-promise')

const APISearchSuggestions = 'SearchSuggestions'
const APISearchSuggestionsList = 'List'

function getAPI(domain, category, group) {
    domain = domain || ''
    category = category || ''
    group = group || ''

    if (domain != '') domain += '.'

    const url = `http://${domain}wikia.com/api/v1/${category}/${group}`
    return url
}

module.exports = {
    searchSuggestions: ({ domain, query }) => {
        const options = {
            uri: getAPI(domain, APISearchSuggestions, APISearchSuggestionsList),
            qs: { query },
            json: true,
        }
        return request(options)
            .then(response => {
                return response
            })
            .catch(error => {
                console.log(error)
            })
    },
}