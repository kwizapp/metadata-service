const { Client } = require('pg')

require('dotenv').config()

function connectDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })

  client.connect()

  return client
}

module.exports = {
  connectDb,
}
