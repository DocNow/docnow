import { ok, equal } from 'assert'
import { UrlFetcher } from '../src/server/url-fetcher'

describe('url-fetcher', () => {

  const uf = new UrlFetcher()

  const search = {
    id: 'test-123'
  }

  it('should start', async () => {
    await uf.redis.flushdbAsync()
    uf.start()
  })

  it('should add url', async () => {
    await uf.add(search, 'http://bit.ly/2AP2zvF')
  })

  it('should get webpages in search', (done) => {
    setTimeout(async () => {
      const webpages = await uf.getWebPages(search)
      ok(webpages.length > 0, 'webpages.length')
      const w = webpages[0]
      equal(w.url, 'https://en.wikipedia.org/wiki/Twitter', 'webpage.url')
      equal(w.title, 'Twitter - Wikipedia', 'webpage.title')
      done()
    }, 5000)
  })

})
