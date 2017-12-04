import http from 'http'
import moment from 'moment'
import request from 'request-promise'

const pool = new http.Agent({keepAlive: true, maxSockets: 10})

/**
 * This function fetches metadata for archival snapshots at the Internet
 * Archive.
 * @param {string} the URL you want to search for.
 * @returns {array} a list of link objects
 */

async function memento(url) {
  const iaUrl = `http://web.archive.org/web/timemap/link/${url}`
  const text = await request.get(iaUrl, {pool: pool})
  const lines = text.split('\n')
  const links = []
  for (const line of lines) {
    const match = line.match(/<(.+)>; rel="(.+)"; datetime="(.+)",/)
    if (match) {
      links.push({
        url: match[1],
        rel: match[2],
        time: new Date(match[3])
      })
    }
  }
  return links
}

async function closest(url) {
  const today  = moment().format('YYYYMMDD')
  const q = {url: url, timestamp: today}
  const iaUrl = 'https://archive.org/wayback/available'

  const result = await request.get({url: iaUrl, qs: q, pool: pool, json: true})
  if (! result) {
    return null
  }

  const snap = result.archived_snapshots.closest
  if (! snap) {
    return null
  }

  return {
    url: snap.url,
    time: moment(snap.timestamp, 'YYYYMMDDHHmmss').toDate()
  }
}

module.exports = { memento, closest }
