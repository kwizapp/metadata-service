const { json } = require('micro')

const { connectDb } = require('./db-service')

module.exports = async (req, res) => {
  // parse the request body
  const body = await json(req)

  // TODO: validate the parameters

  // setup a database connection
  const client = connectDb()

  // TODO: fetch the relevant row from the database
  console.log(body)

  // TODO: return the poster url
  return {
    hello: 1,
  }
}
