import React, { Component } from 'react'
import Header from './Header'
import Trends from './Trends'
import './App.css'

export default class App extends Component {
  render() {
    return (
      <div>
        <Header/>
        <Trends/>
      </div>
    )
  }
}

