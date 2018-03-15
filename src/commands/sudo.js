import { Database } from '../server/db'

async function main(screenName) {
  const db = new Database()
  const user = await db.getUserByTwitterScreenName(screenName)
  user.isSuperUser = ! user.isSuperUser
  db.updateUser(user)
  console.log(`${screenName}: isSuperUser=${user.isSuperUser}`)
  await db.close()
}

main(process.argv[2])
