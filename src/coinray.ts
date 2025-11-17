import Coinray, { CoinrayCache } from "coinrayjs"
// import { toSafeDate } from "coinrayjs/dist/util";
// import { toSafeDate } from "coinrayjs"

// const token = "eyJraWQiOiJSRVVrOGZZVnNveXBSUDIzIiwiYWxnIjoiSFMyNTYifQ.eyJpc3MiOiJSRVVrOGZZVnNveXBSUDIzIiwic3ViIjoiYTE0ZmUxZjAtMTJiZi00ZmFmLWI4OWUtZDIwN2NkNjI3NDVlIiwiZXhwIjoxNTgwNTcwNjI1fQ._d-t0O0qb1IHGyl1T_P8zTv1mxNQAXpEqHqHp_2YPUQ";
const validToken = ["eyJraWQiOiJSRVVrOGZZVnNveXBSUDIzIiwiYWxnIjoiSFMyNTYifQ.eyJpc3MiOiJSRVVrOGZZVnNveXBSUDIzIiwic3ViIjoiYTE0ZmUxZjAtMTJiZi00ZmFmLWI4OWUtZDIwN2NkNjI3NDVlIiwiZXhwIjoyMzY4MTAxNTExfQ.56cJbXGEcAXmp4Ts0zlYmrK2-92qHRWtgmLS8sR7zFI"];
const token = "eyJraWQiOiJSRVVrOGZZVnNveXBSUDIzIiwiYWxnIjoiSFMyNTYifQ.eyJpc3MiOiJSRVVrOGZZVnNveXBSUDIzIiwic3ViIjoiYTE0ZmUxZjAtMTJiZi00ZmFmLWI4OWUtZDIwN2NkNjI3NDVlIiwiZXhwIjoyMzY4MTAxNTExfQ.56cJbXGEcAXmp4Ts0zlYmrK2-92qHRWtgmLS8sR7zFI";

// const token = "eyJraWQiOiJSRVVrOGZZVnNveXBSUDIzIiwiYWxnIjoiSFMyNTYifQ.eyJpc3MiOiJSRVVrOGZZVnNveXBSUDIzIiwic3ViIjoiYTE0ZmUxZjAtMTJiZi00ZmFmLWI4OWUtZDIwN2NkNjI3NDVlIiwiZXhwIjoxNjY1NTc1NDE5fQ.9JG9PWGdA1T1mFO_EKqMcNW6mKHHBc1txZh7WDxRQ74"
// let validToken = [
//   "eyJraWQiOiJSRVVrOGZZVnNveXBSUDIzIiwiYWxnIjoiSFMyNTYifQ.eyJpc3MiOiJSRVVrOGZZVnNveXBSUDIzIiwic3ViIjoiYTE0ZmUxZjAtMTJiZi00ZmFmLWI4OWUtZDIwN2NkNjI3NDVlIiwiZXhwIjoxNjY1NTc1NDc5fQ.cQCGkvVTLbFnLrNe2tmMKOyOhB8HWUffqdBP9fW13gg",
//   "eyJraWQiOiJSRVVrOGZZVnNveXBSUDIzIiwiYWxnIjoiSFMyNTYifQ.eyJpc3MiOiJSRVVrOGZZVnNveXBSUDIzIiwic3ViIjoiYTE0ZmUxZjAtMTJiZi00ZmFmLWI4OWUtZDIwN2NkNjI3NDVlIiwiZXhwIjoxNjY1NTc1NTM5fQ.XlRK3aQ3uUp5hQ02m0EKPWi8Ga5zdZFhWOJ30JckYik",
// ]

const cache = new CoinrayCache(token, {
  apiEndpoint: "https://api-staging.coinray.eu",
  orderEndpoint: "http://localhost:3000",
  websocketEndpoint: "wss://ws.coinray.eu/v1"
}, 30 * 1000)

// const currentMarket1 = new CurrentMarket(cache)


cache.onTokenExpired(async () => {
  console.log("TOKEN EXPIRED")
  let token = validToken.shift()
  console.log(token, validToken)
  return token || ''
})

// const log = (start: number|Date, end: number|Date) => {
//   console.log({ start: toSafeDate(start).toUTCString(), end: toSafeDate(end).toUTCString() })
// }
//
// let resolution = "1"
// let end = new Date(Date.parse("2022-06-09T02:00:00"))
// let startTime = candleTime(4000, resolution, end)
// let endTime = candleTime(0, resolution, end)
// let minStart = toBucketStart(candleTime(10, resolution, end), resolution)
//
// let currentStart = Math.min(toBucketStart(endTime, resolution), minStart)
// let currentEnd = endTime
//
//
// let buckets = []
// while (currentStart >= startTime) {
//   buckets.push({start: currentStart, end: currentEnd})
//   currentEnd = currentStart - 1
//   currentStart = toBucketStart(currentStart - 1, resolution)
// }
//
// buckets.map(({start, end}) => log(start, end))

// console.log("start", toSafeDate(startTime))
// console.log("end", toSafeDate(endTime))
//
// let day = beginningOfDay(new Date())
// console.log(toSafeDate(day))
// console.log(toSafeDate(beginningOfDay(day - 1)))
// console.log(beginningOfWeek(new Date()))
// console.log(beginningOfMonth(new Date()))
// console.log(beginningOfYear(new Date()))
let api = new Coinray("eyJraWQiOiJSRVVrOGZZVnNveXBSUDIzIiwiYWxnIjoiSFMyNTYifQ.eyJpc3MiOiJSRVVrOGZZVnNveXBSUDIzIiwic3ViIjoiYTE0ZmUxZjAtMTJiZi00ZmFmLWI4OWUtZDIwN2NkNjI3NDVlIiwiZXhwIjoyMzY4MTAxNTExfQ.56cJbXGEcAXmp4Ts0zlYmrK2-92qHRWtgmLS8sR7zFI")
api.subscribeOrderBook({ coinraySymbol: "KUCN_USDT_BTC" }, (data) => {
  console.log(JSON.stringify(data))
})

cache.initialize().then(async () => {
  // console.log("Initialized")

  // console.log("aaa", cache.getMarket("ADAS_ADD_ASD"))

  // let resolution = "1"
  // let now = candleTime(1, resolution, new Date())
  // let start = candleTime(1000, resolution, now)
  //

  // cache.subscribeOrderBook({ coinraySymbol: "KUCN_USDT_BTC" }, (data) => {
  //   console.log(data)
  // })
  // let candles = await cache.fetchCandles({ coinraySymbol: "BINA_USDT_BTC", resolution, start, end: now })

  // log(start, now)
  // console.log(candles)

  // candles.map(({ time }) => {
  //   console.log(time)
  // })
});

// api.fetchCandles({coinraySymbol: "GDAX_EUR_BTC", resolution: "1"}).then((response) => {
//
//   console.log(response)
// })
// currentMarket1.setCoinraySymbol("BINA_USDT_BTC")


//
// api.subscribeCandles({coinraySymbol: "GDAX_EUR_BTC", resolution: "1"}, (info) => {
//   console.log(info)
// })

// console.log(api.clientId)
// api.authenticateDevice({}, "MY_SECRET_KEY")
// api.createSmartOrderSignature().then((result) => console.log(result))

// setTimeout(() =>{
//   const currentMarket2 = new CurrentMarket(api, cache)
//   currentMarket2.setCoinraySymbol("BINA_USDT_BTC")
//   currentMarket2.subscribeOrderBook(({ data: {orderBook} }) => {
//     console.log(orderBook)
//   })
// }, 1000)


// api.get("credentials/certificate").then(async ({ result: { jwk } }) => {
//   console.log(jwk)
//
//   const publicKey = await jwkToPublicKey(jwk)
//
//   const jwt = await createJWT({})
//
//   const encrypted = await encryptPayload(jwt, publicKey)
//
//   console.log(encrypted)
//
// })
//
// api.onTokenExpired(() => {
//   console.log("token expired")
//   return validToken
// })
//
// setTimeout(() => {
//   console.log("set token")
//   api.refreshToken(token)
// }, 5000)

// // api.subscribeOrderBook({ coinraySymbol: "KUCN_USDT_BTC" }, (data) => {
// //   console.log(data)
// // })
// //
// // cache.getCandles("BINA_USDT_BTC", undefined, undefined, "60").then((response) => console.log(response))
//
// try {
//   cache.initialize().then(() => {
//     const currentMarket = new CurrentMarket(cache)
//     console.log("ini")
//     //
//     // cache.fetchCandles({
//     //   coinraySymbol: "BYBI_USDT_BTC",
//     //   start: new Date().getTime() / 1000 - 60,
//     //   end: new Date().getTime() / 1000,
//     //   resolution: "5S",
//     //   useWebSocket: true
//     // }).then((response) => console.log(response))
//     //
//     // cache.subscribeCandles({ coinraySymbol: "BYBI_USDT_BTC", resolution: "1S" }, ({ candle, ...rest }) => {
//     //   console.log(candle.numTrades, candle.open, candle.close, candle.open != candle.close)
//     // })
//     //
//     // cache.fetchFirstCandleTime({coinraySymbol: "BINA_USDT_BTC", resolution: "60"}).then((r) => console.log(r))
//     // return await crypto.subtle.importKey(
//     //     "jwk", jwk, {hash: {name: "SHA-1"}, name: "RSA-OAEP"}, false, ["wrapKey"]
//     // );
//
//     // currentMarket.subscribeMarketUpdates(({ data: { market } }) => {
//     //   const { lastPrice, askPrice, bidPrice } = market
//     //   console.log("M", lastPrice.toFixed(8), askPrice.toFixed(8), bidPrice.toFixed(8))
//     // })
//     // api.refreshToken(token)
//
//     // currentMarket.subscribeTrades(({data: {trades}}) => {
//     //   console.log("T", trades[0].price.toFixed(10))
//     // })
//
//     currentMarket.setCoinraySymbol("BINA_USDT_BTC")
//     currentMarket.subscribeOrderBook(({ type, data: { orderBook } }) => {
//       console.log(orderBook)
//       console.log("OB asks", _.first(orderBook.asks).price.toString(), _.last(orderBook.asks).price.toString())
//       console.log("OB bids", _.first(orderBook.bids).price.toString(), _.last(orderBook.bids).price.toString())
//     })
//
//
//
//   })
//
//
// } catch (error) {
//   console.error(error)
// }