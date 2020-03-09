# metadata-service

This service is responsible for returning metadate to movies. It uses a `Heroku-Postgres` database that stores the data related to the movies.

## Database

**Postgres:** We use the free postgres database addon offered by Heroku

- https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
- https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku#credentials

## What to do

- create a `.env` file based on `.env.template`
- add the DATABASE_URL
  - you can get the url from heroku inside the `poster-service` app addons

## How to run

```bash
npm run start
```

This will the micro HTTP service on PORT 3000.

## Test

```bash
npm run test
```

For testing, we use the suggested test-runner [ava](https://github.com/avajs/ava).
