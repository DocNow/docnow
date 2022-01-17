import { StreamLoader } from '../server/stream-loader'
import { SearchLoader } from '../server/search-loader'

const streamLoader = new StreamLoader()
streamLoader.start()

const searchLoader = new SearchLoader()
searchLoader.start()
