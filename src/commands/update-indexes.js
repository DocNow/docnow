import { Database } from '../server/db'

const db = new Database()

async function main() {
  const settings = await db.getSettings()
  await db.updateIndexes()
  db.close()
}

main()
