import React from 'react'
import style from './AppSettings.css'

const AppSettings = () => (
  <form className={style.AppSettings}>
    <input name="app-key" type="text" /><br />
    <br />
    <input name="app-secret" type="text"/ >
  </form>
)

export default AppSettings
