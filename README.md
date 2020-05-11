# metadata-service

This service is responsible for returning metadata for specific movies. It uses a `Heroku-Postgres` database that stores all data related to the movies. If an `ImdbID` is passed as an explicit parameter, the given movie is fetched; alternatively, the service fetches random movies from the database. Filters and the number of random movies can be specified with additional parameters.

## Development

This service depends on the following:
* `Postgres` database
* Hydration (fill database with dataset)
* GitHub Access Token that can read packages (`read:packages`)
* `.env` file created from `.env.template`

### Database

We use the free `Postgres` database addon offered by Heroku.

- https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
- https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku#credentials

### Hydration

**Dataset**

This [dataset](https://www.kaggle.com/rounakbanik/the-movies-dataset) is used.

**Python**

1. Install required Python dependencies (jupyter, requests, pandas, sqlalchemy, psycopg2, python-dotenv (pip!))
   You can run the following to create and activate a conda environment directly with all the required dependencies specified

   ```python
   cd preprocessing
   conda env create -f environment.yml
   conda activate metadata-service
   ```

2. Ensure that `DATABASE_URL` in `.env` is set to a valid and complete URL
3. Run `_run.sh` script from the [Kwiz Repository](https://github.com/kwizapp/kwiz) to have the database ready.
   1. this will start the whole application (including other services)
4. Run the database hydration script with `python Preprocessing.py`

### GitHub Access Token NPM registry

We use a library provided by our organization, namely `kwiz-utils`. For npm to find the package, do the following:

- Login to Github Package Registry using `npm login --registry=https://npm.pkg.github.com` and your credentials.
  - Any provided access token will need at least the `read:packages` scope.

After that, `npm install` should run without any problems.

### Environment Variables

- Create a `.env` file based on `.env.template`

### Local Development with `micro-dev`

```bash
npm run start
```

This will start the micro HTTP service on PORT 3003.

## API

please consult the [wiki](https://github.com/kwizapp/kwiz/wiki/APIs#metadata-service) for the API documentation and examples

## Test

To execute all tests, run the following command:

```bash
npm run test
```
