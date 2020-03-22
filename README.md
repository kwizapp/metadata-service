# metadata-service

This service is responsible for returning metadata for specific movies. It uses a `Heroku-Postgres` database that stores all data related to the movies. If an `IMDb Id` is passed as an explicit parameter, the given movie is fetched; alternatively, the service fetches a random movie from the database.

## Database

**Postgres:** We use the free postgres database addon offered by Heroku

- https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
- https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku#credentials

## Development

### Login to NPM registry

We use a library provided by our organization, namely `kwiz-utils`. For npm to find the package, do the following:

- Login to Github Package Registry using npm login --registry=https://npm.pkg.github.com and your credentials.
  - Any provided access token will need at least the repo and read:packages scope.

After that, `npm install` should run without any problems.

### Environment Variables

- Create a `.env` file based on `.env.template`
- Add the `DATABASE_URL` to `.env`
  - You can get the url from heroku inside the `metadata-service` app addons

### Local dev with `micro-dev`

```bash
npm run start
```

This will the micro HTTP service on PORT 3000.

## API

`/?id=<id>`

| Parameter | Type     | Description                                                                                     |
| :-------- | :------- | :---------------------------------------------------------------------------------------------- |
| `id`      | `string` | IMDb ID, unique to a film. The service will return a random movie if the parameter is not given |

**Example:**

`http://localhost:3000/?id=tt3450958`

**Returns:**

```json
{
  "imdb_id": "tt3450958",
  "budget": "152000000",
  "homepage": "http://www.foxmovies.com/movies/war-for-the-planet-of-the-apes",
  "original_language": "en",
  "original_title": "War for the Planet of the Apes",
  "overview": "Caesar and his apes are forced into a deadly conflict with an army of humans led by a ruthless Colonel. After the apes suffer unimaginable losses, Caesar wrestles with his darker instincts and begins his own mythic quest to avenge his kind. As the journey finally brings them face to face, Caesar and the Colonel are pitted against each other in an epic battle that will determine the fate of both their species and the future of the planet.",
  "popularity": 146.161786,
  "poster_path": "/3vYhLLxrTtZLysXtIWktmd57Snv.jpg",
  "release_date": "2017-07-11",
  "revenue": 369907963,
  "runtime": 140,
  "status": "Released",
  "tagline": "For freedom. For family. For the planet.",
  "title": "War for the Planet of the Apes",
  "video": false,
  "vote_average": 6.7,
  "vote_count": 1675,
  "date_segment": "2"
}
```

## Test

```bash
npm run test
```
