import { Database } from '../server/db'

async function main() {
  const db = new Database()
  const users = await db.getUsers()

  for (let user of users) {
    console.log(user.name, user.tweetQuota)
    await db.updateUser({...user, tweetQuota: 50000})
  }

  console.log('closing')
  await db.close()
}

main()