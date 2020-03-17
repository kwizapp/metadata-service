const { createError } = require('micro')
const { Client } = require('pg')

require('dotenv').config()

// prepare an sql query
const MOVIE_QUERY = 'SELECT * FROM movies WHERE imdb_id = $1'

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

async function fetchRandomMovieId(client) {
  // get all movie ids and select a random one
  const movieIds = await client.query('SELECT imdb_id FROM movies')
  const randomRow =
    movieIds.rows[Math.floor(Math.random() * movieIds.rows.length)]
  return randomRow.imdb_id
}

async function fetchMovieById(client, imdbId) {
  // fetch the movie with the given imdb_id
  const result = await client.query(MOVIE_QUERY, [imdbId])

  // if the result is empty, we do not know about this movie
  if (!result.rows || result.rows.length === 0) {
    throw createError(404, 'MOVIE_ID_NOT_AVAILABLE')
  }

  // if we have data, return the result and disconnect from
  // the database, as we only do a single db request
  client.end()
  return result.rows[0]
}

async function fetchRandomMovie(client) {
  // fetch a random movie id
  const randomId = await fetchRandomMovieId(client)

  // fetch the movie with the random id and return the result
  return fetchMovieById(client, randomId)
}

module.exports = {
  connectDb,
  fetchMovieById,
  fetchRandomMovie,
}
