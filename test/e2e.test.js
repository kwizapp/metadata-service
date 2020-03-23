const micro = require('micro')
const request = require('supertest')

const server = require('../src/index')

describe('metadata-service', () => {
  it('fails if an invalid ImdbID is specified', async () => {
    const response = await request(micro(server)).get('/?id=123')
    expect(response.statusCode).toEqual(400)
  })

  it('fails if a non-existent ImdbID is specified', async () => {
    const response = await request(micro(server)).get('/?id=tt1234567')
    expect(response.statusCode).toEqual(404)
  })

  it('fetches a specific movie given an ImdbID', async () => {
    const response = await request(micro(server)).get('/?id=tt0076759')
    expect(response.statusCode).toEqual(200)
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "budget": "11000000",
        "date_segment": "0",
        "homepage": "http://www.starwars.com/films/star-wars-episode-iv-a-new-hope",
        "imdb_id": "tt0076759",
        "omdb_consistent": true,
        "original_language": "en",
        "original_title": "Star Wars",
        "overview": "Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.",
        "popularity": 42.149696999999996,
        "poster_path": "/btTdmkgIvOi0FFip1sPuZI2oQG6.jpg",
        "release_date": "1977-05-25",
        "revenue": 775398007,
        "runtime": 121,
        "status": "Released",
        "tagline": "A long time ago in a galaxy far, far away...",
        "title": "Star Wars",
        "video": false,
        "vote_average": 8.1,
        "vote_count": 6778,
      }
    `)
  })

  it('fetches a random movie if no ImdbID is given', async () => {
    const response = await request(micro(server)).get('/')
    expect(response.statusCode).toEqual(200)
    expect(response.body).toMatchObject({
      // budget: expect.any(String),
      date_segment: expect.any(String),
      // homepage: expect.any(String),
      imdb_id: expect.any(String),
      // original_language: expect.any(String),
      // original_title: expect.any(String),
      // overview: expect.any(String),
      // popularity: expect.any(Number),
      // poster_path: expect.any(String),
      // release_date: expect.any(String),
      // revenue: expect.any(Number),
      // runtime: expect.any(Number),
      // status: expect.any(String),
      // tagline: expect.any(String),
      title: expect.any(String),
      // video: expect.any(Boolean),
      // vote_average: expect.any(Number),
      // vote_count: expect.any(Number),
    })
  })
})
