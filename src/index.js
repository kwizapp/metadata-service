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
  notReleasedIn: yup.number(),
})

module.exports = async (req) => {
  // try to extract query params from the request URL
  const { query } = parse(req.url, true)
  const transformedQuery = queryValidator.cast(query)

  try {
    // validate query params
    queryValidator.validateSync(transformedQuery)
  } catch (e) {
    throw createError(400, 'VALIDATION_ERROR', e)
  }

  // setup a database connection
  const client = dbService.connectDb()

  // if an imdb id has been passed, fetch the requested movie metadata
  if (typeof transformedQuery.imdbId !== 'undefined') {
    try {
      return dbService.fetchMoviesById(client, [transformedQuery.imdbId])
    } catch (e) {
      console.error(e)
      throw createError(404, 'MOVIE_NOT_FOUND', e)
    }
  }

  // if no id has been passed, fetch a random movie
  // TODO: improve filtering structure to make it more extendable (e.g., as an array with generic props?)
  const filters = {
    differentFrom: query.differentFrom,
    notReleasedIn: query.notReleasedIn,
  }
  try {
    return dbService.fetchRandomMovies(
      client,
      transformedQuery.numMovies,
      filters,
    )
  } catch (e) {
    console.error(e)
    throw createError(500, 'COULD_NOT_FETCH_MOVIE', e)
  }
}
