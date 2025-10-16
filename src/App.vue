<script setup lang="ts">
import { onMounted } from 'vue'
import { KLineChartPro, DefaultDatafeed } from '@klinecharts/pro'
import '@klinecharts/pro/dist/klinecharts-pro.css'

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
