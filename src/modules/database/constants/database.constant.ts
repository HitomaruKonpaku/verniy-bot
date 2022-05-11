export const DB_DATABASE = './db/database.sqlite'

// eslint-disable-next-line quotes
export const DB_CURRENT_TIMESTAMP = `strftime('%s', 'now') || substr(strftime('%f', 'now'), 4)`
