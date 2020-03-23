const yup = require('yup')
const { createError } = require('micro')
const { parse } = require('url')

const dbService = require('./dbService')
const { isImdbIdValid } = require('./utils')

const queryValidator = yup.object().shape({
  imdbId: yup
    .string()
    .test('isValidImdbId', '${path} is an invalid Imdb ID', isImdbIdValid),
  numMovies: yup.number().default(1),
  differentFrom: yup
    .string()
    .test('isValidImdbId', '${path} is an invalid Imdb ID', isImdbIdValid),
})

module.exports = async (req, res) => {
  // try to extract query params from the request URL
  const { query } = parse(req.url, true)

  try {
    // validate query params
    queryValidator.validateSync(query)
  } catch (e) {
    console.error(e)
    throw createError(400, 'VALIDATION_ERROR', e)
  }

  // setup a database connection
  const client = dbService.connectDb()

  // if an imdb id has been passed, fetch the requested movie metadata
  if (typeof query.imdbId !== 'undefined') {
    try {
      return dbService.fetchMoviesById(client, [query.imdbId])
    } catch (e) {
      console.error(e)
      throw createError(404, 'MOVIE_NOT_FOUND', e)
    }
  }

  // if no id has been passed, fetch a random movie
  try {
    return dbService.fetchRandomMovies(client, 1)
  } catch (e) {
    console.error(e)
    throw createError(500, 'COULD_NOT_FETCH_MOVIE', e)
  }
}
