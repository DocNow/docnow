import { Database } from '../server/db'

const db = new Database()

async function main() {
  const results = await db.mergeIndexes()
  console.log(JSON.stringify(results, null, 2))
  db.close()
}

main()
