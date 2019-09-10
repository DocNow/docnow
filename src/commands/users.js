import log from '../server/logger'
import { Database } from '../server/db'
import cmd from 'commander'



async function main(cmd) {
  log.info('fetching users')
  const db = new Database()

  const users = await db.getUsers()

  for (const user of users) {
    if (cmd.quota) {
      user = {...user, tweetQuota: parseInt(cmd.quota)}
      await db.updateUser(user)
    }
  }

  console.log(JSON.stringify(users, null, 2))
  await db.close()
}

cmd.
  option('-q --quota <int>', 'set the tweet quota')

cmd.parse(process.argv)
main(cmd)