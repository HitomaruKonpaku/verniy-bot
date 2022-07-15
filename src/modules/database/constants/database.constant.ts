export const DB_DATABASE = './db/database.sqlite'

export const DB_CURRENT_TIMESTAMP = {
  // eslint-disable-next-line quotes
  sqlite: `strftime('%s', 'now') || substr(strftime('%f', 'now'), 4)`,
  postgres: 'FLOOR(EXTRACT(EPOCH FROM now()) * 1000)',
}[process.env.DB_TYPE || 'sqlite']
