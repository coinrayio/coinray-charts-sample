import {CoinrayDatafeed} from "../CoinrayDatafeed.ts";
import {type Ref, useEffect, useMemo, useRef} from "react";
import {DummyOrderController, KLineChartPro} from "@klinecharts/pro";
import {useElementSize, useVisibility} from "../hooks/useResize.ts";

function Chart() {
  const [containerRef, {width, height}] = useElementSize<HTMLDivElement>();
  const widgetRef: Ref<KLineChartPro> = useRef();
  let initialized = false;
  const datafeed = new CoinrayDatafeed();
  let originalPosition = 150;

  useEffect(() => {
    if (((import.meta.env.VITE_APP_ENV || 'development') as string).includes('dev')) {
      console.log("Running in development mode")
      if (!initialized) {
        initialized = true;
        return;
      }
    }
    widgetRef.current = new KLineChartPro({
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
      period: {span: 15, type: 'minute', text: '15m'},
      locale: 'en-US',
      theme: 'light',
      mainIndicators: [],
      subIndicators: [],
      datafeed,
      orderController: new DummyOrderController()
    })
    let chart = widgetRef.current.getInstanceApi();

    setTimeout(() => {
      if (!chart) {
        return
      }

      const line = chart.createOrderLine({ disableUndo: true })
      console.info("Created order line:", line)
      let cancelMessage: string = 'Are you sure you want to close order?'
      let modifyMessage: string = 'Are you sure you want to modify position?'

      // const orderLine = chart.getInstanceApi()?.getOverlays({ name: 'positionLine', id: line, paneId: 'candle_pane'}).at(0) || null
      if (line && datafeed.firstData.length > 5) {
        setTimeout(() => {
          line.setPrice(datafeed.firstData[datafeed.firstData.length - originalPosition].close)
              .setLineStyle('dashed')
              .setLineWidth(1)
              .setLineDashedValue([6, 2])
              .setText('Buystop Line')
              .setLineColor('#FF0000')
              .setBodyBackgroundColor('#ff00000c')
              .setBodyTextColor('#0f0e0eff')
              .setBodyBorderColor('#0d76e0ff')
              .setBodyFontWeight('medium')
              .setBorderSize(1)
              .setBorderRadius(0)
              .setBorderStyle('solid')
              .setCancelButtonFontWeight('thin')
              .setCancelButtonIconColor('#ff0000ff')
              .setCancelButtonBorderColor('#ff0000ff')
              .setCancelButtonBackgroundColor('#ff00000c')
              .setQuantityColor('#ffffffff')
              .setQuantityBackgroundColor('#0d76e0ff')
              .setQuantityBorderColor('#0073ffff')
              .onCancel(cancelMessage, (message) => {
                if (window.confirm(message)) {
                  chart.removeOverlay({ id: line.id })
                }
              })
              .onModify(modifyMessage, (message) => {
                if (window.confirm(message)) {
                  const pos = Math.floor(Math.random() * 150) + 1
                  originalPosition = pos
                  line.setPrice(datafeed.firstData[datafeed.firstData.length - originalPosition].close)
                }
              })
              .onMove({}, (p, e) => {
                console.info(p)
                if (e) {
                  // Sample of what can be done with event data
                  // const price = (e.chart.convertFromPixel([{ y: e.y, x: e.x }], { paneId: 'candle_pane' }) as Partial<Point>).value
                }
                // Reset the line to original position if you don't want it to be moveable or draggable.
                // Uncomment the next line to see it in action
                // line.setPrice(datafeed.firstData[datafeed.firstData.length - originalPosition].close)
              })
              .onMoveStart({}, (p, e) => {
                console.info(p)
                if (e) {
                  // Sample of what can be done with event data
                  // const price = (e.chart.convertFromPixel([{ y: e.y, x: e.x }], { paneId: 'candle_pane' }) as Partial<Point>).value
                }
                // Reset the line to original position if you don't want it to be moveable or draggable.
                // Uncomment the next line to see it in action
                // line.setPrice(datafeed.firstData[datafeed.firstData.length - originalPosition].close)
              })
              .onMoveEnd({}, (p, e) => {
                console.info(p)
                if (e) {
                  // Sample of what can be done with event data
                  // const price = (e.chart.convertFromPixel([{ y: e.y, x: e.x }], { paneId: 'candle_pane' }) as Partial<Point>).value
                }
                // Reset the line to original position if you don't want it to be moveable or draggable.
                // Uncomment the next line to see it in action
                line.setPrice(datafeed.firstData[datafeed.firstData.length - originalPosition].close)
              })
        }, 2000)
      } else {
        console.log("No order line set")
      }
    }, 3000)

    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (!widgetRef.current || !width || !height) return;
    widgetRef.current.resize()
    // chart.resize({ width, height })  // klinecharts / your lib’s API
  }, [width, height]);

  // Ensure a resize happens when the tab first becomes visible
  useVisibility(containerRef, () => {
    widgetRef.current?.resize()
  });

  return <div ref={containerRef} style={{width: '100%', height: '100%'}} className="chart-ui"
              id="chart-container"></div>;
}

export default Chart;
