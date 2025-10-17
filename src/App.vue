<script setup lang="ts">
import { onMounted } from 'vue'
import { KLineChartPro, DefaultDatafeed } from '@klinecharts/pro'
import '@klinecharts/pro/dist/klinecharts-pro.css'
import Coinray, { CoinrayCache } from 'coinrayjs'
import { CoinrayDatafeed } from './CoinrayDatafeed'

onMounted(() => {
  const chart = new KLineChartPro({
    container: document.getElementById('container') || '',
    // Default symbol info
    symbol: {
      exchange: 'BINA',
      market: 'crypto',
      name: 'United States Dollar Tether vs Bitcoin',
      shortName: 'USDT_BTC',
      ticker: 'USDT_BTC',
      priceCurrency: 'usd',
      type: 'ADRC',
    },
    // Default period
    period: { multiplier: 1, timespan: 'minute', text: '1m' },
    // The default data access is used here. If the default data is also used in actual use, you need to go to the https://polygon.io/ apply for API key
    datafeed: new CoinrayDatafeed(),
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
