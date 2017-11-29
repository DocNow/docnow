import { Database } from '../server/db'

const db = new Database()

async function main() {
  const settings = await db.getSettings()
  await db.clear()
  await db.setupIndexes()
  await db.addSettings(settings)
  db.close()
}

main()
