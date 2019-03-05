import { Database } from '../server/db'

async function main() {
  const db = new Database()
  const users = await db.getUsers()
  console.log(JSON.stringify(users, null, 2))
  await db.close()
}

main()