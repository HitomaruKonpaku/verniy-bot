const DTM = module.exports = {
    DateTime: (date) => {
        date = date || new Date()
        return [DTM.Date(date), DTM.Time(date)]
            .join(' ')
    },
    Date: (date) => {
        date = date || new Date()
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
            .map(v => v.toString().padStart(2, '0'))
            .join('-')
    },
    Time: (date) => {
        date = date || new Date()
        return [date.getHours(), date.getMinutes(), date.getSeconds()]
            .map(v => v.toString().padStart(2, '0'))
            .join(':')
    },
    TimeWithMilliseconds: (date) => {
        date = date || new Date()
        return [DTM.Time(date), date.getMilliseconds().toString().padStart(3, '0')]
            .join('.')
    },
}