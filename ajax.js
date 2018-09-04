const bitcoinApi = 'https://api.coinmarketcap.com/v2/ticker/1/?convert=BRL'
const byPassCors = 'https://cors-anywhere.herokuapp.com'
const url = `${byPassCors}/${bitcoinApi}`
const statuses = {
  0: 'request uninitialized',
  1: 'server connection established',
  2: 'request received',
  3: 'processing request',
  4: 'response is ready'
}

function formatNumber (number, pad = 2, frac = 2, locale = 'en-US') {
  return number.toLocaleString(locale, {
    minimumIntegerDigits: pad,
    maximumFractionDigits: frac,
    useGrouping: true
  })
}

function formatDate (date) {
  const HH = formatNumber(date.getHours())
  const MM = formatNumber(date.getMinutes())
  const SS = formatNumber(date.getSeconds())
  const sss = formatNumber(date.getMilliseconds(), 3)
  return `${HH}:${MM}:${SS}.${sss}`
}

function createRequest (url) {
  const request = new window.XMLHttpRequest()
  request.open('GET', url, true)
  request.setRequestHeader('Content-Type', 'application/json')
  return request
}

function successHandler () {
  const response = JSON.parse(this.responseText)
  updateQuotes(response)
}

function errorHandler (error) {
  console.error('AJAX error: ', error)
}

function stateChangeHandler () {
  const state = this.readyState
  const status = `${formatDate(new Date())} - ${statuses[state]}`
  const item = document.createElement('li')
  item.innerText = status
  document.querySelector('#statusHistory').appendChild(item)
}

function createCell (className, value) {
  const td = document.createElement('td')
  td.classList.add(className)
  td.innerText = value
  return td
}

function updateQuotes (response) {
  // console.log(response)
  const date = new Date()
  date.setTime(response.data.last_updated * 1000)
  const lastUpdated = formatDate(date)
  const line = document.createElement('tr')
  const cells = [
    createCell('lastUpdated', lastUpdated.slice(0, -4)),
    createCell('btc', 1),
    createCell('usd', formatNumber(response.data.quotes.USD.price)),
    createCell('brl', formatNumber(response.data.quotes.BRL.price, 2, 2, 'pt-BR'))
  ]
  cells.forEach(cell => line.appendChild(cell))
  const quotes = document.querySelector('#quotes')
  quotes.appendChild(line)
}

function makeRequest () {
  const request = createRequest(url)
  request.onreadystatechange = stateChangeHandler
  request.onload = successHandler
  request.onerror = errorHandler
  stateChangeHandler.call(request)
  request.send()
}

function run () {
  const button = document.querySelector('#updateButton')
  button.addEventListener('click', makeRequest)
}

window.onload = run

// 0 (uninitialized) or (request not initialized)
// 1 (loading) or (server connection established)
// 2 (loaded) or (request received)
// 3 (interactive) or (processing request)
// 4 (complete) or (request finished and response is ready)
