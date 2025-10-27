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
    const widget = new KLineChartPro({
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

    const handleResize = () => widget.resize()
    window.addEventListener('resize', handleResize)

    setTimeout(() => {
      const chart = widget.getInstanceApi()
      if (!chart) {
        return
      }

      const charts = chart.charts
      const line = chart.createOrderLine({ disableUndo: true })
      console.info("Created order line:", line)

      // const orderLine = chart.getInstanceApi()?.getOverlays({ name: 'positionLine', id: line, paneId: 'candle_pane'}).at(0) || null
      if (line && datafeed.firstData.length > 5) {
        setTimeout(() => {
          line.setPrice(datafeed.firstData[datafeed.firstData.length - 5].close)
            .setLineStyle('dashed')
            .setLineWidth(2)
            .setLineDashedValue([2, 6])
            .setText('Buystop Line')
            .setLineColor('#FF0000')
            .setBodyBackgroundColor('#ff0000a5')
            .setBodyTextColor('#0f0e0eff')
            .setBodyBorderColor('#0073ffff')
            .setBorderSize(1)
            .setBorderStyle('dashed')
            .setBorderDashedValue([0, 0])
            .setCancelButtonBorderColor('#0073ffff')
            .setCancelButtonBackgroundColor('#ff000041')
            .setQuantityColor('#0f0e0eff')
            .setQuantityBackgroundColor('#ff0000aa')
            .setQuantityBorderColor('#0073ffff')
        }, 2000)
      } else {
        console.log("No order line set")
      }
    }, 3000)

    return () => {
      window.removeEventListener('resize', handleResize)
      // chart?.dispose()
    }
  }, [])

  return <div className="chart-ui" id="chart-container"></div>
}

export default App