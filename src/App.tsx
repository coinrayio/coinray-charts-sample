import { useEffect } from 'react'
import { DummyOrderController, KLineChartPro } from '@klinecharts/pro'
import '@klinecharts/pro/dist/klinecharts-pro.css'
import './App.css'
import { CoinrayDatafeed } from './CoinrayDatafeed'

function App() {
  let initialized = false;
  let datafeed = new CoinrayDatafeed();

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
      period: { span: 15, type: 'minute', text: '15m' },
      locale: 'en-US',
      theme: 'light',
      mainIndicators: [],
      subIndicators: [],
      datafeed,
      orderController: new DummyOrderController()
    })

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    setTimeout(() => {
      const line = chart.getInstanceApi()?.createOverlay({ name: 'positionLine', paneId: 'candle_pane', points: [{ timestamp: datafeed.firstData[datafeed.firstData.length - 40].timestamp, value: datafeed.firstData[datafeed.firstData.length - 40].close}]}) as string
      console.info("Created order line:", line)
      const orderLine = chart.getInstanceApi()?.getOverlays({ name: 'positionLine', id: line, paneId: 'candle_pane'}).at(0) || null
      if (orderLine && datafeed.firstData.length > 5) {
        setTimeout(() => {
          orderLine.setPrice(datafeed.firstData[datafeed.firstData.length - 5].close)
            .setText('Buystop Line')
        }, 10000)
      } else {
        console.log("No order line set")
      }
    }, 8000)

    return () => {
      window.removeEventListener('resize', handleResize)
      // chart?.dispose()
    }
  }, [])

  return <div className="chart-ui" id="chart-container"></div>
}

export default App