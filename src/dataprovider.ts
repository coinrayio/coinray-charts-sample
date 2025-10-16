import SymbolsStorage from "./symbol-storage"
import {getCoinrayCache} from "../../../../../../../actions/coinray"
import util from "../../../../../../../util/util"
import {resolutionToDuration} from "coinrayjs/dist/util"

export const OTHER_RESOLUTIONS = ["D", "1D", "2D", "W", "1W", "2W", "1M"]
export const SECOND_RESOLUTIONS = ["1S", "2S", "3S", "5S", "10S", "15S", "30S"]
export const INTRA_DAY_RESOLUTIONS = ["1", "2", "3", "5", "10", "15", "30", "60", "120", "240", "360", "720"]
export const SUPPORTED_RESOLUTIONS = OTHER_RESOLUTIONS.concat(SECOND_RESOLUTIONS).concat(INTRA_DAY_RESOLUTIONS)

export default class DataProvider {
  lastCandles = {}
  _subscribers = {}
  _symbolsStorage = new SymbolsStorage()

  _resolveLoaded
  _loadedPromise = new Promise((resolve) => {
    this._resolveLoaded = resolve
  })

  /** @type {ReplayController} */
  replayController

  /** @type {QuizController} */
  quizController

  currentMarket

  listenerGuid = ""
  resetDataCallbacks = {}

  firstCandleTimes = {}

  constructor(currentMarket, replayController, quizController) {
    this.setReplayController(replayController)

    if (quizController) this.quizController = quizController

    this.currentMarket = currentMarket
  }

  setReplayController(replayController) {
    this.replayController = replayController
    this.replayController.setDatafeed(this)
  }

  resetData = () => {
    const resetDataCallback = this.resetDataCallbacks[this.listenerGuid]
    if (resetDataCallback) resetDataCallback()
  }

  resetAllData = () => {
    this.setDrawCandleCallback(undefined)
    Object.values(this.resetDataCallbacks).forEach(c => c())
  }

  drawCandleCallbackResolve
  drawCandleCallbackPromise = new Promise((resolve) => this.drawCandleCallbackResolve = resolve)

  getDrawCandleCallback = async () => await this.drawCandleCallbackPromise
  setDrawCandleCallback = (drawCandlesCallback) => {
    if (drawCandlesCallback) {
      if (this.drawCandleCallbackResolve) this.drawCandleCallbackResolve(drawCandlesCallback)
      delete this.drawCandleCallbackResolve
    } else if (!this.drawCandleCallbackResolve) {
      this.drawCandleCallbackPromise = new Promise((resolve) => this.drawCandleCallbackResolve = resolve)
    }
  }

  get replayMode() {
    return this.replayController.replayMode
  }

  get coinraySymbol() {
    return this.listenerGuid.split("_#_")[0]
  }

  get resolution() {
    return this.listenerGuid.split("_#_")[1]
  }

  get firstCandleTime() {
    return this.firstCandleTimes[this.listenerGuid]
  }

  get lastCandle() {
    return this.lastCandles[this.listenerGuid]
  }

  updateGuid = ({coinraySymbol, resolution, guid} = {}) => {
    const tvResolution = !resolution ? undefined :
      resolutionToDuration(resolution) > resolutionToDuration("1D") ? "1D" : resolution

    if (guid) {
      this.listenerGuid = guid
    } else if (coinraySymbol && tvResolution) {
      this.listenerGuid = `${coinraySymbol}_#_${tvResolution}`
    } else if (this.listenerGuid) {
      if (coinraySymbol) this.listenerGuid = `${coinraySymbol}_#_${this.resolution}`
      if (tvResolution) this.listenerGuid = `${this.coinraySymbol}_#_${tvResolution}`
    }
    return this.listenerGuid
  }

  onGetMarks(callback) {
    console.log("onGetMarks", this.listenerGuid, new Date().toUTCString(), Object.keys(this._subscribers).join(", "))
    this._onGetMarksCallback = callback
  }

  onReady = (callback) => {
    console.log("onRead", this.listenerGuid, new Date().toUTCString(), Object.keys(this._subscribers).join(", "))
    setTimeout(() => {
      let exchanges = Object.values(getCoinrayCache().getExchanges())

      let configurationData = {
        supports_search: true,
        supports_marks: true,
        supported_resolutions: SUPPORTED_RESOLUTIONS,
        symbols_types: [
          {name: "All types", value: ""},
          {name: "Spot", value: "Spot"},
          {name: "Futures", value: "Futures"},
        ],
        exchanges: [{value: "", name: "All", desc: "All exchanges"}].concat(exchanges.map((exchange) => ({
          value: exchange.code,
          name: exchange.name,
          desc: exchange.name,
        }))),
      }
      callback(configurationData)
    }, 0)
  }

  searchSymbols = (userInput, exchange, symbolType, onResultReadyCallback) => {
    const search = () => {
      const marketMap = getCoinrayCache().searchMarkets(userInput.concat(` ${exchange}`))
      let filterType = (market) => {
        if (symbolType) {
          return symbolType === "Futures" ? market.getExchange().isFutures : !market.getExchange().isFutures
        }
        return true
      }

      const symbols = Object.values(marketMap).filter(filterType).map((market) => {
        let {coinraySymbol, quoteCurrency, baseCurrency, getExchange, baseLogoUrl, quoteLogoUrl} = market
        return {
          symbol: util.marketName({quoteCurrency, baseCurrency}),
          description: "",
          logo_urls: [baseLogoUrl, quoteLogoUrl],
          exchange: getExchange().name,
          exchange_logo: getExchange().logo,
          type: market.getExchange().isFutures ? "Futures" : "Spot",
          ticker: coinraySymbol,
        }
      })

      onResultReadyCallback(symbols)
    }
    if (this.searchSymbolsDebounce) {
      clearTimeout(this.searchSymbolsDebounce)
    }

    if (userInput.length > 2) {
      this.searchSymbolsDebounce = setTimeout(search, 200)
    }
  }

  resolveSymbol = (symbolName, onSymbolResolvedCallback, onError) => {
    function onResultReady(symbolInfo) {
      onSymbolResolvedCallback(symbolInfo)
    }

    this._symbolsStorage.resolveSymbol(symbolName).then(onResultReady).catch(onError)
  }

  loadFirstCandleTime = async () => {
    if (!this.firstCandleTimes[this.listenerGuid]) {
      const tvResolution = resolutionToDuration(this.resolution) > resolutionToDuration("1D") ? "1D" : this.resolution
      const firstCandleTime = await getCoinrayCache()
        .fetchFirstCandleTime({coinraySymbol: this.coinraySymbol, resolution: tvResolution})
      this.firstCandleTimes[this.listenerGuid] = new Date(firstCandleTime).valueOf()
    }
    return this.firstCandleTime
  }

  fetchCandles = async ({coinraySymbol, resolution, range}) => {
    const candles = await (getCoinrayCache().fetchCandles({
      coinraySymbol,
      resolution: resolution,
      start: range.from, end: range.to,
      useWebSocket: range.firstDataRequest,
    }))
    return {candles, noData: !candles.length}
  }


  getBars = async (symbolInfo, resolution, range, onResult) => {
    console.log("getBars", symbolInfo.ticker, resolution, new Date().toUTCString(), Object.keys(this._subscribers).join(", "))
    let barsResult

    try {
      if (this.replayMode) {
        barsResult = await this.replayController.fetchCandles({coinraySymbol: symbolInfo.ticker, resolution, range})
      } else if (this.quizController.questionController?.active) {
        barsResult = await this.quizController.questionController.getInitialCandles({coinraySymbol: symbolInfo.ticker, resolution, range})
      } else {
        barsResult = await this.fetchCandles({coinraySymbol: symbolInfo.ticker, resolution, range})
      }
    } catch (error) {
      console.error("fetchBars error", error)
    }

    if (!barsResult) {
      console.log("No barsResult")
      onResult([], {noData: true})
      return
    }
    const {candles, noData} = barsResult

    if (range.firstDataRequest && candles.length > 0) {
      this.lastCandles[`${symbolInfo.ticker}_#_${resolution}`] = candles[candles.length - 1]
    }

    let tvCandles = candles.map(util.parseTvCandle)

    if (this.replayMode) {
      tvCandles = await this.replayController.takeCandles(tvCandles)
    }
    console.log("getBars Result: ", symbolInfo.ticker, resolution, new Date().toUTCString(), tvCandles.length, noData, Object.keys(this._subscribers).join(", "))

    onResult(tvCandles, {noData})
  }

  subscribeBars = (symbolInfo, resolution, onRealtimeCallback, listenerGuid, onResetCacheNeededCallback) => {
    this.updateGuid({guid: listenerGuid})

    const wrongSymbol = symbolInfo.ticker !== this.currentMarket.coinraySymbol

    if (wrongSymbol) {
      console.error("Wrong symbol", listenerGuid, new Date().toUTCString())
      return
    }
    console.log("SubscribeBars", listenerGuid, new Date().toUTCString(), Object.keys(this._subscribers).join(", "))

    this.subscriptionReady = true
    this.resetDataCallbacks[listenerGuid] = onResetCacheNeededCallback

    this.setDrawCandleCallback(onRealtimeCallback)

    if (this.replayMode) {
      this.onRealtimeCallback = onRealtimeCallback
      this.replayController.setReady()
        .catch(console.error)
      return
    } else {
      this.replayController.setStopped()
        .catch(console.error)
    }

    if (this.quizController.questionController?.active) {
      return
    }

    let lastCandle = this.lastCandles[listenerGuid]

    try {
      const callback = ({candle}) => {
        if (!candle) {
          return
        }

        let {time, open, low, high, close, baseVolume} = candle

        if (!lastCandle || time >= lastCandle.time) {
          lastCandle = this.lastCandles[listenerGuid] = candle
        }

        if (this._subscribers[listenerGuid] && open && low && high && close) {
          this._subscribers[listenerGuid].listener({
            time: (new Date(time)).getTime(),
            open: open,
            low: low,
            high: high,
            close: close,
            volume: baseVolume,
          })
        }
      }
      getCoinrayCache()
        .subscribeCandles({coinraySymbol: symbolInfo.ticker, resolution, lastCandle}, callback)
        .catch(console.error)
      delete this.lastCandles[listenerGuid]
      this._subscribers[listenerGuid] = {
        listener: onRealtimeCallback,
        channel: {coinraySymbol: symbolInfo.ticker, resolution: resolution},
        callback,
      }
    } catch (error) {
      console.error("SubscribeBars error: ", error)
    }
  }

  unsubscribeBars = (listenerGuid) => {
    console.log("unsubscribeBars", listenerGuid, new Date().toUTCString())
    delete this.lastCandles[listenerGuid]
    delete this.resetDataCallbacks[listenerGuid]

    if (this._subscribers[listenerGuid]) {
      try {
        getCoinrayCache()?.unsubscribeCandles(this._subscribers[listenerGuid].channel, this._subscribers[listenerGuid].callback)
        delete this._subscribers[listenerGuid]
      } catch (error) {
        console.error("UnsubscribeBars error: ", error)
      }
    }
    console.log("UnsubscribeBars", listenerGuid, new Date().toUTCString(), Object.keys(this._subscribers).join(", "))
  }

  calculateHistoryDepth(resolution, resolutionBack, intervalBack) {
    return undefined
  }

  getMarks(symbolInfo, from, to, onDataCallback, resolution) {
    if (this._onGetMarksCallback) {
      return this._onGetMarksCallback(symbolInfo, from, to, onDataCallback, resolution)
    }
  }

  getTimescaleMarks(symbolInfo, from, to, onDataCallback, resolution) {
    return undefined
  }

  getServerTime(callback) {
    callback(new Date().getTime() / 1000)
  }
}