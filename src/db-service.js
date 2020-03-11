const { Client } = require('pg');

require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();

client
  .query('SELECT table_schema,table_name FROM information_schema.tables;')
  .then(res => {
    res.rows.map(row => console.log(JSON.stringify(row)));
    client.end();
  })
  .catch(e => console.error(e.stack));
