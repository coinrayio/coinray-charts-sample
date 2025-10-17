import { useEffect } from 'react'
import { KLineChartPro } from '@klinecharts/pro'
import '@klinecharts/pro/dist/klinecharts-pro.css'
import './App.css'
import { CoinrayDatafeed } from './CoinrayDatafeed'

function App() {
  let initialized = false;

  useEffect(() => {
    if ((import.meta.env.VITE_APP_ENV || 'development') as string === 'development') {
      console.log("Running in development mode")
      if (!initialized) {
        initialized = true;
        return;
      }
    }
    const chart = new KLineChartPro({
      container: document.getElementById('chart-container') || '',
      symbol: {
        exchange: 'BINA',
        market: 'crypto',
        name: 'United States Dollar Tether vs Bitcoin',
        shortName: 'USDT_BTC',
        ticker: 'USDT_BTC',
        priceCurrency: 'usd',
        type: 'ADRC',
      },
      period: { multiplier: 1, timespan: 'minute', text: '1m' },
      datafeed: new CoinrayDatafeed(),
    })

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      // chart?.dispose()
    }
  }, [])

  return <div className="chart-ui" id="chart-container"></div>
}

export default App