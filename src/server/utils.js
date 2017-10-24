const sep = '-'

export const addPrefix = (prefix, id) => {
  let idString = String(id)
  if (! idString.match('^' + prefix + sep)) {
    idString = prefix + sep + idString
  }
  return idString
}

export const stripPrefix = (s) => {
  const pattern = new RegExp(`^.+?${sep}`)
  return String(s).replace(pattern, '')
}

export const addPrefixes = (ids, prefix) => {
  return ids.map((id) => { return addPrefix(prefix, id  ) })
}
