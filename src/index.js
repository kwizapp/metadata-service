const { createError } = require('micro')
const { parse } = require('url')
const { validateId } = require('@kwizapp/kwiz-utils')

const dbService = require('./dbService')

module.exports = async req => {
  let imdbId

  try {
    // try to extract query params from the request URL
    const { query } = parse(req.url, true)
    imdbId = query.id
  } catch (e) {}

  // if the imdbId has been set, ensure that it is valid
  if (typeof imdbId !== 'undefined') {
    validateId(createError, imdbId)
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
  }
}
