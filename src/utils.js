const { validateId } = require('@kwizapp/kwiz-utils')
const { createError } = require('micro')

/**
 * Check if a imdb id is valid
 *
 * @param {number} value - The value to check
 * @param {boolean} optional - Defines if the imdb id is optional (or not present)
 *
 * @returns true if idmb id is valid, else returns false
 */
function isImdbIdValid(value, optional = true) {
  if (optional && typeof value === 'undefined') {
    return true
  }
  try {
    validateId(createError, value)
    return true
  } catch (e) {
    return false
  }
}

module.exports = {
  isImdbIdValid,
}
