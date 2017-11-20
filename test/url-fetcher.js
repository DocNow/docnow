import { ok, equal, deepEqual } from 'assert'
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
    // load up some URLs for url-fetcher to fetcher

    // these three point to the same wikipedia articlej
    await uf.add(search, 'http://bit.ly/2AP2zvF')
    await uf.add(search, 'https://en.wikipedia.org/wiki/Twitter')
    await uf.add(search, 'https://is.gd/drV7bJ')

    // this should result in the stats being recorded for the same canonical url
    await uf.add(search, 'http://www.nytimes.com/1994/05/07/business/new-venture-in-cyberspace-by-silicon-graphics-founder.html?utm=foobar')
    await uf.add(search, 'http://www.nytimes.com/1994/05/07/business/new-venture-in-cyberspace-by-silicon-graphics-founder.html?utm=barbaz')
  })

  it('should get webpages in search', (done) => {
    setTimeout(async () => {
      const webpages = await uf.getWebpages(search)
      ok(webpages.length == 2, 'webpages.length')

      let w = webpages[0]
      equal(w.url, 'https://en.wikipedia.org/wiki/Twitter', 'webpage.url')
      equal(w.title, 'Twitter - Wikipedia', 'webpage.title')
      equal(w.count, 3, 'tally works')

      w = webpages[1]
      equal(w.url, 'http://www.nytimes.com/1994/05/07/business/new-venture-in-cyberspace-by-silicon-graphics-founder.html', 'tally should use canonical url')
      equal(w.title, 'New Venture in Cyberspace By Silicon Graphics Founder - NYTimes.com')
      equal(w.count, 2, 'tally uses canonical url')

      done()
    }, 10000)
  })

  it('should return queue stats', async () => {
    const stats = await uf.queueStats(search)
    deepEqual({total: 5, remaining: 0}, stats)
  })

  it('should stop', async () => {
    await uf.stop()
  })

})
