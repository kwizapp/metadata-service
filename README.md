# metadata-service

This service is responsible for returning metadata for specific movies. It uses a `Heroku-Postgres` database that stores all data related to the movies. If an `ImdbID` is passed as an explicit parameter, the given movie is fetched; alternatively, the service fetches random movies from the database. Filters and the number of random movies can be specified with additional parameters.

## Development

### Database Management

**Postgres:** We use the free postgres database addon offered by Heroku

- https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
- https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku#credentials

#### How to hydrate the database

**Dataset**

1. Download the required [dataset](https://www.kaggle.com/rounakbanik/the-movies-dataset)
2. Create a folder `datasets/` in the root folder
3. Extract the `the-movies-dataset.zip` into `datasets/the-movies-dataset/`

**Python**

1. Install required Python dependencies (jupyter, requests, pandas, sqlalchemy, psycopg2, python-dotenv (pip!))
   You can run the following to create and activate a conda environment directly with all the required dependencies specified

   ```python
   conda env create -f environment.yml
   conda activate metadata-service
   ```

2. Ensure that `DATABASE_URL` in `.env` is set to a valid and complete URL
3. Run the database hydration script with `python Preprocessing.py`

### Login to NPM registry

We use a library provided by our organization, namely `kwiz-utils`. For npm to find the package, do the following:

- Login to Github Package Registry using `npm login --registry=https://npm.pkg.github.com` and your credentials.
  - Any provided access token will need at least the repo and read:packages scope.

After that, `npm install` should run without any problems.

### Environment Variables

- Create a `.env` file based on `.env.template`
- Add the `DATABASE_URL` to `.env`
  - You can get the url from heroku inside the `metadata-service` app addons
- Set the `POSTER_SERVICE_URL` to link to a running instance of the `poster-service`
  - E.g., `http://localhost:3000`

### Local dev with `micro-dev`

```bash
npm run start
```

This will the micro HTTP service on PORT 3000.

## API

The `metadata-service` API provides two main modes of operation:

1. Fetching a single, specific movie given its `ImdbID`
2. Fetching a list of random movies (1-n items) with optional filtering applied

### Fetching a specific movie

`/?imdbId=<id>`

| Parameter | Type     |  Default  | Description                                                                                                            |
| :-------- | :------- | :-------: | :--------------------------------------------------------------------------------------------------------------------- |
| `imdbId`  | `ImdbID` | undefined | Optional. IMDb ID, uniquely identifies a movie. The service will return random movie(s) if the parameter is not given. |

**Example:**

`http://localhost:3000/?id=tt3450958`

**Returns:**

```json
[
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
    "release_year": 2017,
    "date_segment": "2"
  }
]
```

### Fetching a list of random movies

`/?numMovies=<MovieCount>&differentFrom=<OtherImdbID>&notReleasedIn=<ReleaseYear>`

| Parameter       | Type      |  Default  | Description                                                                               |
| :-------------- | :-------- | :-------: | :---------------------------------------------------------------------------------------- |
| `numMovies`     | `Integer` |     1     | Optional. Defines how many results should be fetched when fetching random movies.         |
| `differentFrom` | `ImdbID`  | undefined | Optional. Defines a base `ImdbID` that will not be included in any random results.        |
| `notReleasedIn` | `Integer` | undefined | Optional. Defines a release year that movies in the random results should not be from. \* |

_* If `notReleasedIn` is specified, the random results will have distinct release years (i.e., the release year will be different from the specified release year and there will not be two random results having the same release year.)._

## Test

```bash
npm run test
```
