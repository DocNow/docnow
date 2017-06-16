export const SET_PLACES = 'SAVE_SETTINGS'

export const saveSettings = (appKey, appSecret) => {
  return {
    type: SET_PLACES,
    appKey: appKey,
    appSecret: appSecret
  }
}
