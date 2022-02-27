import { UrlFetcher } from '../server/url-fetcher'
import { VideoFetcher } from '../server/video-fetcher'

const urlFetcher = new UrlFetcher()
urlFetcher.start()

const videoFetcher = new VideoFetcher()
videoFetcher.start()
