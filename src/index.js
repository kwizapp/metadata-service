const { createError } = require('micro')
const { parse } = require('url')

const dbService = require('./dbService')

module.exports = async (req, res) => {
  let imdbId

  // parse the request query params
  try {
    const { query } = parse(req.url, true)

    // TODO: validate the imdb id, set null if invalid
    imdbId = query.id
  } catch (e) {
    console.error(e)
    throw createError(422, 'INVALID_PARAMETERS', e)
  }

  // setup a database connection
  const client = dbService.connectDb()

  // if an imdb id has been passed, fetch the requested movie metadata
  if (typeof imdbId !== 'undefined') {
    try {
      return dbService.fetchMovieById(client, imdbId)
    } catch (e) {
      console.error(e)
      throw createError(404, 'MOVIE_NOT_FOUND', e)
    }
  }

  // if no id has been passed, fetch a random movie
  try {
    return dbService.fetchRandomMovie(client)
  } catch (e) {
    console.error(e)
    throw createError(500, 'COULD_NOT_FETCH_MOVIE', e)
  } finally {
    // client.end()
  }
}
