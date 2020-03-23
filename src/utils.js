const { validateId } = require('@kwizapp/kwiz-utils')
const { createError } = require('micro')

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
