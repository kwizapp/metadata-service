const { createError } = require('micro')
const { Client } = require('pg')
const { append, remove } = require('ramda')

require('dotenv').config()

function connectDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true',
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
  let movieIdQuery = 'SELECT imdb_id, release_year FROM movies'
  let queryValues = []
  if (filters) {
    if (filters.differentFrom) {
      movieIdQuery += ` WHERE imdb_id != $1`
      queryValues = append(filters.differentFrom, queryValues)
    }
    if (filters.notReleasedIn) {
      if (filters.differentFrom) {
        movieIdQuery += ' AND release_year != $2'
      } else {
        movieIdQuery += ' WHERE release_year != $1'
      }
      queryValues = append(filters.notReleasedIn, queryValues)
    }
  }
  console.log(`> Prepared query: ${movieIdQuery}`)

  // get all movie ids that match the above filter
  const queryResult = await client.query(movieIdQuery, queryValues)
  console.log(`> Received query result: ${queryResult}`)

  // select numIds random ids from the list of ids
  let randomIds = []
  let rows = queryResult.rows
  for (let i = 0; i < numIds; i++) {
    const randomIndex = Math.floor(Math.random() * rows.length)
    const randomRow = rows[randomIndex]

    // append the random row to the selection
    randomIds = append(randomRow.imdb_id, randomIds)

    // remove the extracted id from the rows to prevent duplicates
    rows = remove(randomIndex, 1, rows)

    // remove all rows having the same release year
    // to prevent two random movies from having the same release year
    // Note: this restriction is bound to the constraint that all random movies
    //       should have different release years than the specified movie
    if (filters.notReleasedIn) {
      rows = rows.filter((row) => row.release_year !== randomRow.release_year)
    }
  }

  return randomIds
}

async function fetchMoviesById(client, imdbIds) {
  // fetch the movie with the given imdb_id
  const moviesQuery = `SELECT * FROM movies WHERE imdb_id IN (${imdbIds.map(
    (_, ix) => '$' + (ix + 1),
  )})`
  console.log(`> Prepared query: ${moviesQuery}`)
  const result = await client.query(moviesQuery, imdbIds)

  // if we have data, return the result and disconnect from
  // the database, as we only do a single db request
  client.end()

  // if the result is empty, we do not know about this movie
  if (!result.rows || result.rows.length === 0) {
    throw createError(404, 'MOVIES_NOT_AVAILABLE')
  }

  return result.rows
}

async function fetchRandomMovies(client, numMovies, filters) {
  // fetch random movie ids
  const randomIds = await fetchRandomMovieIds(client, numMovies, filters)

  // fetch the movies with the random ids and return the result
  return fetchMoviesById(client, randomIds)
}

module.exports = {
  connectDb,
  fetchMoviesById,
  fetchRandomMovies,
}
