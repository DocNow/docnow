import { expect, assert } from 'chai'
import { Twitter } from '../src/server/twitter'

describe('docnow', () => {

  const t = new Twitter()

  describe('twitter', () => {

    it('should construct', () => {
      expect(t).to.exist
      expect(t.consumerKey).to.exist
      expect(t.consumerSecret).to.exist
      expect(t.accessToken).to.exist
      expect(t.accessTokenSecret).to.exist
      expect(t.twit).to.exist
    })

    it('should fetch trends by place', (done) => {
      t.getTrendsAtPlace(1)
        .then((place) => {
          expect(place.id).to.equal(1)
          expect(place.name).to.equal('Worldwide')
          expect(place.trends).to.have.lengthOf.above(0)
          expect(place.trends[0].name).to.exist
          expect(place.trends[0].tweets).to.exist
          done()
        })
    })
  })
})
