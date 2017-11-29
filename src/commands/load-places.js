import { Database } from '../server/db'

async function main() {
  const db = new Database()
  const places = await db.loadPlaces()

  for (const place of places) {
    if (place.type == 'Town') {
      console.log(`added ${place.name}, ${place.country}`)
    } else {
      console.log(`added ${place.name}`)
    }
  }

  console.log('loaded ' + places.length + ' places.')
  await db.close()
}

main()
