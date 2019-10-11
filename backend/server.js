
const express = require('express');
const request = require('request');
const app = express();
const port = 3210;

let currencies = {
  "USD": {
    "Value": 64.7416,
  },
  "EUR": {
    "Value": 71.2999,
  },
}

request.get('https://www.cbr-xml-daily.ru/daily_json.js', (err, response, body) => {
  if (! err && response.statusCode == 200) {
    currencies = JSON.parse(body).Valute;
    // console.log(currencies);
  }
});

const reducer = (acc, {currency, quantity, price}) => {
  if (! (Number.isInteger(quantity) && quantity > 0 && quantity < 1000)) throw new Error('invalid quantity');
  if (! (typeof price === 'number' && price > 0 && price < 1000000)) throw new Error('invalid price');
  let rubles;
  if (currency === 'RUB') rubles = price;
  else {
    const c = currencies[currency];
    if (c) rubles = price * c.Value;
    else throw new Error('invalid currency');
  }
  return acc + (quantity * rubles);
}

app.use(express.static('frontend'));
app.use(express.json());

app.post('/', (req, res) => {
  const RUB = req.body.reduce(reducer, 0);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    RUB: RUB.toFixed(2),
    EUR: (RUB / currencies.EUR.Value).toFixed(2),
    USD: (RUB / currencies.USD.Value).toFixed(2),
  }));
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
