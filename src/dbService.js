const { createError } = require('micro')
const { Client } = require('pg')
const { append, remove } = require('ramda')

require('dotenv').config()

function connectDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })

  try {
    client.connect()
  } catch (e) {
    throw createError(500, 'DB_CONNECTION_FAILURE')
  }

  return client
}

async function fetchRandomMovieIds(client, numIds, filters) {
  // compose a query with filters (POC)
  // TODO: write this in a more extendable fashion
  let movieIdQuery = 'SELECT imdb_id FROM movies'
  let queryValues = []
  if (filters) {
    if (filters.differentFrom) {
      movieIdQuery += ` WHERE imdb_id != $1`
      queryValues = append(filters.differentFrom, queryValues)
    }
  }

  // get all movie ids that match the above filter
  const queryResult = await client.query(movieIdQuery)

  // select numIds random ids from the list of ids
  let randomIds = []
  let rows = queryResult.rows
  for (let i = 0; i < numIds; i++) {
    const randomIndex = Math.floor(Math.random() * rows.length)

    // append the random row to the selection
    randomIds = append(rows[randomIndex].imdb_id, randomIds)

    // remove the extracted id from the rows to prevent duplicates
    rows = remove(randomIndex, 1, rows)
  }

  return randomIds
}

async function fetchMovieById(client, imdbId) {
  // fetch the movie with the given imdb_id
  const MOVIE_QUERY = 'SELECT * FROM movies WHERE imdb_id = $1'
  const result = await client.query(MOVIE_QUERY, [imdbId])

  // if we have data, return the result and disconnect from
  // the database, as we only do a single db request
  client.end()

  // if the result is empty, we do not know about this movie
  if (!result.rows || result.rows.length === 0) {
    throw createError(404, 'MOVIE_ID_NOT_AVAILABLE')
  }

  return result.rows[0]
}

async function fetchRandomMovie(client) {
  // fetch a random movie id
  const [randomId] = await fetchRandomMovieIds(client, 1)

  // fetch the movie with the random id and return the result
  return fetchMovieById(client, randomId)
}

module.exports = {
  connectDb,
  fetchMovieById,
  fetchRandomMovie,
}
