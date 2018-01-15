import http from 'http'
import moment from 'moment'
import request from 'request-promise'
import log from './logger'
import { getRedis, waybackKey } from './redis'

const pool = new http.Agent({keepAlive: true, maxSockets: 1})
const redis = getRedis()

/**
 * Save Wayback metadata by URL in Redis.
 * @param {string} The URL that was archived.
 * @param {object} Metadata (url, time) about the Wayback snapshot.
 * @returns {promise}
 */

function save(url, metadata) {
  return redis.setAsync(waybackKey(url), JSON.stringify(metadata))
}

/**
 * Get saved Wayback metadata by URL from Redis.
 * @param {string}
 * @param {promise} The Wayback snapshot metadata.
 */

async function get(url) {
  const json = await redis.getAsync(waybackKey(url))
  if (json) {
    return JSON.parse(json)
  } else {
    return null
  }
}

/**
 * Tells Wayback Machine to archive a URL.
 * @param {string} a URL string
 * @returns {object} an object
 */

async function saveArchive(url) {
  const saveUrl = `https://web.archive.org/save/` + url
  try {
    const resp = await request.get({url: saveUrl, resolveWithFullResponse: true})
    const location = resp.headers['content-location']
    const iaUrl = 'https://wayback.archive.org/' + location
    const time = moment(location.split('/')[2] + 'Z', 'YYYYMMDDhhmmssZ').toDate()
    const metadata = {url: iaUrl, time: time}
    save(url, metadata)
    return metadata
  } catch (e) {
    log.warn(`got error when fetching ${saveUrl}`, e.response.statusCode)
    return null
  }
}

/**
 * Fetch metadata for archival snapshots at the Internet Archive.
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

/**
 * Fetch the closest Wayback snapshot by URL.
 * @param {string} A URL
 * @param {boolean} Set to true to ignore cache and go back to the web.
 * @returns {object} Metadata about the Wayback snapshot.
 */

async function closest(url, refresh = false) {

  if (! refresh) {
    const result = await get(url)
    if (result) {
      return result
    }
  }

  const today  = moment().format('YYYYMMDD')
  const q = {url: url, timestamp: today}
  const iaUrl = 'https://archive.org/wayback/available'

  try {
    const result = await request.get({url: iaUrl, qs: q, pool: pool, json: true})
    if (! result) {
      return null
    }

    const snap = result.archived_snapshots.closest
    if (! snap) {
      return null
    }

    const metadata = {
      url: snap.url,
      time: moment(snap.timestamp, 'YYYYMMDDHHmmss').toDate()
    }

    save(url, metadata)
    return metadata
  } catch (e) {
    log.error(`wayback error for: ${url}`)
    return null
  }
}

module.exports = { memento, closest, saveArchive, get }
