import redis from 'redis'

export const db = redis.createClient()
