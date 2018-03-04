import { Database } from '../server/db'

const db = new Database()

async function main() {
  await db.mergeIndexes()
  db.close()
}

main()
