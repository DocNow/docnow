import '../env'
import knex from 'knex'
import knexfile from '../../knexfile'

const db = knex(knexfile)

db.migrate.latest()
  .then(result => {
    for (const migration of result[1]) {
      console.log(`migrated ${migration}`)
    }
    db.destroy()
  })