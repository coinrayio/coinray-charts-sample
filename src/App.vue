<script setup lang="ts">
import { onMounted } from 'vue'
import { KLineChartPro, DefaultDatafeed } from '@klinecharts/pro'
import '@klinecharts/pro/dist/klinecharts-pro.css'
import Coinray, { CoinrayCache } from 'coinrayjs'

const token = import.meta.env.VITE_COINRAY_API_KEY || ''
const coinrayapi = new Coinray(token)
const cache = new CoinrayCache(token, {
  apiEndpoint: "https://api-staging.coinray.eu",
  orderEndpoint: "http://localhost:3000",
  websocketEndpoint: "wss://ws.coinray.eu/v1"
}, 30 * 1000)

cache.onTokenExpired(async () => {
  console.log("TOKEN EXPIRED")
  // let token = validToken.shift()
  // console.log(token, validToken)
  return token || ''
})

onMounted(() => {
  const chart = new KLineChartPro({
    container: document.getElementById('container') || '',
    // Default symbol info
    symbol: {
      exchange: 'XNYS',
      market: 'stocks',
      name: 'Alibaba Group Holding Limited American Depositary Shares, each represents eight Ordinary Shares',
      shortName: 'BABA',
      ticker: 'BABA',
      priceCurrency: 'usd',
      type: 'ADRC',
    },
    // Default period
    period: { multiplier: 15, timespan: 'minute', text: '15m' },
    // The default data access is used here. If the default data is also used in actual use, you need to go to the https://polygon.io/ apply for API key
    datafeed: new DefaultDatafeed(`${import.meta.env.VITE_POLYGON_API_KEY}`),
  })
  window.addEventListener('resize', () => {
    //TODO: Resize chart
  })
})
</script>

<template>
  <div style="height: 100vh; width: 100vw;" id="container"></div>
</template>

<style scoped>
</style>
