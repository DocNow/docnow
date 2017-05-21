import style from './style.css'

const hello = document.getElementById('hello')
hello.innerHTML = 'Hello World!'

console.log(style)

if (module.hot) {
  module.hot.accept()
}
