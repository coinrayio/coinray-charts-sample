// import moment from "moment-timezone"
// import tinycolor from "tinycolor2"
// import i18n from "../../../../../../../i18n"
// import util from "../../../../../../../util/util"
// import {clamp, sortBy, mean} from "lodash"
// import {getVisiblePriceRange, getVisibleTimeRange} from "../price-time-select"

// const defaultShapeOptions = {
//   "text": "",
//   "lock": true,
//   "disableSelection": true,
//   "disableSave": true,
//   "disableUndo": true,
//   "showInObjectsTree": false,
// }

// const defaultShapeOverrides = {
//   extendLeft: false,
//   extendRight: false,
//   leftEnd: 0,
//   rightEnd: 0,
//   showAngle: false,
// }

// const priceLineToName = {
//   "bidPrice": "Bid price",
//   "askPrice": "Ask price",
//   "breakEvenPoint": "Break even",
// }

// const timeLineToName = {
//   "timeAlert": "Trigger At",
//   "entryExpiration": "Expire At",
//   "entryCondition": "Start At",
//   "replayStartTime": "Start At",
//   "replayEndTime": "End At",
//   "replayCurrentTime": "Now At",
// }

// const chartFont = "bold 10px Roboto, sans-serif"

// const lineTypeToShape = {
//   "LineToolRay": "ray",
//   "LineToolTrendLine": "trend_line",
// }

// const iconNameToCode = {
//   "arrow": {
//     buy: 0xf062,
//     sell: 0xf063,
//   },
//   "triangle": {
//     buy: 0xf0d8,
//     sell: 0xf0d7,
//   },
// }

// let selectionCallbacks = {}
// let deleteCallbacks = {}

// export class ChartFunctions {
//   constructor(tvWidget, chart, theme, chartSettings, currentMarket) {
//     this.refresh({tvWidget, chart, theme, chartSettings, currentMarket})
//   }

//   static destroy = () => {
//     selectionCallbacks = {}
//     deleteCallbacks = {}
//   }

//   static new = ({tvWidget, chart, theme, chartSettings, currentMarket}) => {
//     return new ChartFunctions(tvWidget, chart, theme, chartSettings, currentMarket)
//   }

//   refresh = ({tvWidget, chart, theme, chartSettings, currentMarket}) => {
//     this.chart = chart
//     this.tvWidget = tvWidget
//     this.chartColors = {...theme.chart, ...chartSettings.chartColors[theme._name]}
//     this.chartSettings = chartSettings
//     this.currentMarket = currentMarket
//     this.selectionCallbacks = {}
//     this.deleteCallbacks = {}
//     this.precisionPrice = currentMarket?.getMarket()?.precisionPrice || 12
//   }

//   destructor() {

//   }

//   get contentDocument() {
//     return this.tvWidget._iFrame.contentDocument
//   }

//   getPrecisePrice = (price) => parseFloat(util.correctNumberPrecision(this.precisionPrice, price))
//   getMainPane = () => this.chart.getPanes().find((pane) => pane.hasMainSeries())
//   getToolBar = () => this.contentDocument?.querySelectorAll("[data-name='drawing-toolbar'] .floating-toolbar-react-widgets")[0]
//   hasButton = (id) => !!this.contentDocument?.getElementById(id)
//   currentResolution = () => {
//     if (this.chart) {
//       return this.chart?.resolution()
//     }
//   }
//   currentTimezone = () => {
//     return this.chart?.getTimezone()
//   }

//   getShapesByName = (name) => {
//     return this.chart.getAllShapes().filter((shape) => shape.name === name)
//   }

//   parseBar = (bar) => {
//     if (!bar) return
//     const {index, value} = bar
//     return {
//       index,
//       time: value[0],
//       open: value[1],
//       high: value[2],
//       low: value[3],
//       close: value[4],
//     }

//   }

//   getCandleByTime = (time) => {
//     const bars = this.chart.chartModel().mainSeries().bars()
//     const bar = bars.searchByTime(time)
//     return this.parseBar(bar)
//   }

//   getCandleByBarsIndex = (index) => {
//     const bars = this.chart.chartModel().mainSeries().bars()
//     const bar = bars.search(index)
//     return this.parseBar(bar)
//   }

//   onDelete = (id, callback) => {
//     deleteCallbacks[id] ||= []
//     deleteCallbacks[id].push(callback)
//   }
//   clickDelete = (event, selectedId) => {
//     if (deleteCallbacks[selectedId]) {
//       deleteCallbacks[selectedId].map((callback) => callback(event, selectedId))
//     }
//   }
//   onSelect = (id, callback) => {
//     if (this.getEntity(id)) {
//       selectionCallbacks[id] ||= []
//       selectionCallbacks[id].push(callback)
//     }
//   }
//   onSelectionChanged = (selectedId) => {
//     if (selectionCallbacks[selectedId]) {
//       selectionCallbacks[selectedId].map((callback) => callback(selectedId))
//     }
//   }
//   getSelectedEntities = () => {
//     return this.getMainPane()._pane.model()._selection._items.reduce((result, entity) => {
//       try {
//         result[entity._id] = this.chart.getShapeById(entity._id)
//       } catch (e) {
//         console.log("Entity not found", entity._id)
//       }
//       return result
//     }, {})
//   }
//   getEntity = (entityId) => {
//     try {
//       return this.chart.getShapeById(entityId)
//     } catch (error) {
//       // assume shape removed
//     }
//   }
//   removeEntity = (entityId) => {
//     delete selectionCallbacks[entityId]
//     try {
//       this.chart.removeEntity(entityId, {disableUndo: true})
//     } catch (error) {
//       // assume shape removed
//     }
//   }
//   getStudyStyles = (studyName) => {
//     let studyId = this.chart.getAllStudies().find(({name}) => name === studyName)?.id
//     if (studyId) {
//       return this.chart.getStudyById(studyId).getStyleValues()
//     }
//   }
//   createToolbarPlaceholder = (id, front) => {
//     if (this.hasButton(id)) {
//       return this.contentDocument.getElementById(id)
//     }
//     let toolbar = this.getToolBar()
//     if (toolbar) {
//       const newElement = document.createElement("div")
//       newElement.id = id
//       toolbar.insertBefore(newElement, front ? toolbar.childNodes[0] : toolbar.childNodes[toolbar.childNodes.length - 1])
//       return newElement
//     }
//   }
//   createToolbarButton = (id, title, className, label, icon, onClick) => {
//     if (this.hasButton(id)) {
//       return
//     }

//     let toolbar = this.getToolBar()
//     if (toolbar) {
//       const newElement = document.createElement("div")
//       newElement.id = id
//       let img = document.createElement("img")
//       img.src = icon
//       newElement.appendChild(img)
//       newElement.className = className
//       newElement.onclick = onClick
//       toolbar.insertBefore(newElement, toolbar.childNodes[toolbar.childNodes.length - 1])
//       return newElement
//     }
//   }
//   createButton = (title, className, label, icon, onClick) => {
//     const button = this.tvWidget.createButton()
//     button.setAttribute("title", title)
//     button.classList.add("tradingViewButtonWrapper")
//     button.onclick = onClick
//     button.insertAdjacentHTML("beforeend",
//       `<button class="${className}">` +
//       `<img style="width: 12px; ${label ? "margin-right: 6px;" : ""}" src="${icon}"/>${label ? `<span>${label}</span>` : ""}` +
//       `</button>`)
//     return button
//   }

//   toggleButton = (className, enabled = true) => {
//     const button = this.contentDocument.querySelector(`.${className}`)
//     if (button) {
//       button.style.opacity = enabled ? 1 : 0.2
//       button.parentElement.parentElement.parentElement.style.pointerEvents = enabled ? "auto" : "none"
//     }
//   }

//   highlightButtonText = (className, active = true) => {
//     const button = this.contentDocument.querySelector(`.${className}`)
//     if (button) {
//       button.style.color = active ? "#2563EB" : ""

//       //https://angel-rs.github.io/css-color-filter-generator/
//       // toggle color of svg src or img to #2563EB
//       button.firstChild.style.filter = !active ? "" :
//         "brightness(0) saturate(100%) invert(29%) sepia(32%) saturate(5180%) hue-rotate(214deg) brightness(96%) contrast(92%)"
//     }
//   }
//   createShape = (points, style, shape) => {
//     try {
//       return this.chart.createShape(points, {
//         ...defaultShapeOptions, ...{
//           shape,
//           "overrides": {
//             ...defaultShapeOverrides,
//             ...style,
//           },
//         },
//       })
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   createCallout = (time, text) => {
//     try {
//       const candle = this.getCandleByTime(time / 1000)

//       if (!candle) return

//       const neighborsDistance = 1
//       const neighborsIndexes = Array.from({length: neighborsDistance * 2 + 1}, (_, i) => candle.index - neighborsDistance + i)

//       const highLowDiffs = neighborsIndexes.map(i => {
//         const candle = this.getCandleByBarsIndex(i)
//         if (!candle) return
//         return candle.high - candle.low
//       }).filter(Boolean)

//       const meanNeighborsHighLowDiff = mean(highLowDiffs)
//       const calloutHeight = meanNeighborsHighLowDiff * 3

//       const points = [
//         {price: candle.high, time: time / 1000},
//         {price: candle.high + calloutHeight, time: time / 1000},
//       ]

//       return this.createMultipointShape(points, "callout", {text})
//     } catch (e) {
//       console.error(e)
//     }
//   }

//   createTimeArrow = (time) => {
//     const candle = this.getCandleByTime(time / 1000)
//     if (!candle) return

//     const neighborsDistance = 3
//     const neighborsIndexes = Array.from({length: neighborsDistance * 2 + 1}, (_, i) => candle.index - neighborsDistance + i)

//     const highDiffs = neighborsIndexes
//       .filter(i => i !== candle.index)
//       .map(i => {
//         const neighbor = this.getCandleByBarsIndex(i)
//         if (!neighbor) return
//         return neighbor.high - candle.high
//       }).filter(Boolean)

//     const lowDiffs = neighborsIndexes
//       .filter(i => i !== candle.index)
//       .map(i => {
//         const neighbor = this.getCandleByBarsIndex(i)
//         if (!neighbor) return
//         return candle.low - neighbor.low
//       }).filter(Boolean)

//     const avgHighDiff = mean(highDiffs)
//     const avgLowDiff = mean(lowDiffs)

//     const arrowAbovePrice = avgHighDiff < avgLowDiff
//     const highLowDiffs = neighborsIndexes.map(i => {
//       const candle = this.getCandleByBarsIndex(i)
//       if (!candle) return
//       return candle.high - candle.low
//     }).filter(Boolean)

//     const arrowLength = Math.abs(mean(highLowDiffs))
//     const arrowOffset = arrowLength / 3
//     const arrowHeadPrice = arrowAbovePrice ? candle.high + arrowOffset : candle.low - arrowOffset

//     const fromPoint = {
//       time: candle.time,
//       price: arrowAbovePrice ? arrowHeadPrice + arrowLength : arrowHeadPrice - arrowLength,
//     }

//     const toPoint = {
//       time: candle.time,
//       price: arrowHeadPrice,
//     }

//     const style = {
//       linecolor: this.chartColors.priceLine,
//       leftEnd: 0,
//       rightEnd: 1,
//     }

//     return this.createMultipointShape([fromPoint, toPoint], "arrow", style)
//   }

//   createMultipointShape = (points, shape, style = {}, shapeOptions = {}) => {
//     try {
//       let options = {
//         ...defaultShapeOptions,
//         ...shapeOptions,
//         ...{
//           shape,
//           "overrides": {
//             ...defaultShapeOverrides,
//             backgroundColor: style.color,
//             ...style,
//           },
//         },
//       }

//       return this.chart.createMultipointShape(points, options)
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   drawClosedAlert = (alert) => {
//     const {closedOrdersShowTop} = this.chartSettings
//     const shapeSettings = {
//       shape: "icon",
//       overrides: {
//         icon: 0xf0f3,
//         color: this.chartColors.closedAlert,
//         size: 14,
//       },
//     }

//     try {
//       if (alert.updatedAt) {
//         let orderShape = {
//           points: [{time: moment.utc(alert.updatedAt).unix(), price: parseFloat(alert.price)}],
//           options: {
//             ...defaultShapeOptions, ...shapeSettings,
//           },
//         }
//         orderShape.options.zOrder = closedOrdersShowTop ? "top" : "bottom"
//         return this.chart.createMultipointShape(orderShape.points, orderShape.options)
//       }
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   drawTrade = (trade, inPosition) => {
//     const {closedOrdersShowPrices, closedOrdersShowQuantities, closedOrdersShowTop} = this.chartSettings
//     const shapes = []

//     const color = trade.side === "sell" ?
//       inPosition ? this.chartColors.closedSellOrderPosition : this.chartColors.closedSellOrder :
//       inPosition ? this.chartColors.closedBuyOrderPosition : this.chartColors.closedBuyOrder

//     const shapeSettings = {
//       shape: this.chartColors.closedOrderIcon ? "icon" : trade.side === "sell" ? "arrow_down" : "arrow_up",
//       overrides: this.chartColors.closedOrderIcon ? {
//         icon: iconNameToCode[this.chartColors.closedOrderIcon][trade.side],
//         color,
//         size: 12,
//       } : {},
//     }

//     try {
//       if (trade.time) {
//         let orderShape = {
//           points: [{time: trade.time, price: parseFloat(trade.price)}],
//           options: {
//             ...defaultShapeOptions, ...shapeSettings,
//           },
//         }

//         orderShape.options.zOrder = closedOrdersShowTop ? "top" : "bottom"

//         let shape = this.chart.createMultipointShape(orderShape.points, orderShape.options)
//         if (shape) {
//           shapes.push(shape)
//           if (shapeSettings.shape !== "icon") {
//             this.chart.getShapeById(shape)
//               .setProperties({arrowColor: color})
//           }
//         }

//         if (shape && (closedOrdersShowPrices || closedOrdersShowQuantities)) {
//           const priceText = closedOrdersShowPrices ? `${trade.price}` : undefined
//           const amountText = closedOrdersShowQuantities ? `${trade.amount}` : undefined

//           try {
//             const shape = this.chart.createExecutionShape({disableUndo: true})
//               .setText([amountText, priceText].filter(Boolean).join(", @"))
//               .setTextColor(this.chartColors.closedOrderText)
//               .setArrowColor("rgba(0,0,0,0)")
//               .setDirection(trade.side)
//               .setTime(trade.time)
//               .setPrice(parseFloat(trade.price))

//             if (shape) {
//               shapes.push(shape)
//             }
//           } catch (error) {
//             console.log(error)
//           }
//         }
//       }
//     } catch (error) {
//       console.error(error)
//     }
//     return shapes
//   }
//   drawCurrentBase = (base, medianDrop) => {
//     const shapes = []
//     try {
//       const {price, time, formedAt, crackedAt, respectedAt} = base
//       const {basesShowBox} = this.chartSettings
//       let start = (formedAt || time).unix()
//       let stop = respectedAt ? respectedAt.unix() : moment().unix()
//       const color = respectedAt ? this.chartColors.respectedLine2 : crackedAt ? this.chartColors.crackedLine2 : this.chartColors.notCrackedLine2
//       start = util.roundTimeToCandle(start * 1000, this.currentResolution()).getTime() / 1000
//       stop = util.roundTimeToCandle(stop * 1000, this.currentResolution()).getTime() / 1000

//       let floatPrice = parseFloat(price)

//       const line = {
//         "points": [{"time": start, "price": floatPrice}, {"time": stop, "price": floatPrice}],
//         "options": {
//           ...defaultShapeOptions, ...{
//             ...defaultShapeOverrides,
//             "shape": "trend_line",
//             "overrides": {...defaultShapeOverrides, "fillBackground": false, "linecolor": color, "linewidth": 2, "linestyle": 0},
//           },
//         },
//       }

//       const box = {
//         "points": [{"time": start, "price": floatPrice}, {"time": stop, "price": floatPrice}, {"time": stop, "price": floatPrice * (100 + medianDrop) / 100}],
//         "options": {
//           ...defaultShapeOptions, ...{
//             "shape": "parallel_channel",
//             "overrides": {
//               ...defaultShapeOverrides,
//               "fillBackground": true,
//               "linecolor": color,
//               "midlinecolor": color,
//               "linewidth": 0,
//               "linestyle": 0,
//               "backgroundColor": util.rgba2hex(color).substr(0, 7),
//               transparency: 80,
//             },
//           },
//         },
//       }

//       if (basesShowBox) {
//         shapes.push(this.chart.createMultipointShape(box.points, box.options))
//       }
//       shapes.push(this.chart.createMultipointShape(line.points, line.options))
//     } catch (error) {
//       console.error(error)
//     }
//     return shapes
//   }
//   drawBaseLine = ({price, formedAt, time, crackedAt, respectedAt}, nextTime) => {
//     const shapes = []
//     try {
//       let floatPrice = parseFloat(price)

//       const start = formedAt || time
//       const stop = nextTime
//       const color = respectedAt ? this.chartColors.respectedLine2 : crackedAt ? this.chartColors.crackedLine2 : this.chartColors.notCrackedLine2

//       const line = {
//         "points": [{"time": start.unix(), "price": floatPrice}, {
//           "time": crackedAt ? crackedAt.unix() : stop,
//           "price": floatPrice,
//         }],
//         "options": {
//           ...defaultShapeOptions, ...{
//             "shape": "trend_line",
//             "overrides": {...defaultShapeOverrides, "fillBackground": false, "linecolor": color, "linewidth": 2, "linestyle": 0},
//           },
//         },
//       }

//       shapes.push(this.chart.createMultipointShape(line.points, line.options))

//       if (respectedAt) {
//         const crackedTime = {
//           "points": [{"time": crackedAt.unix(), "price": floatPrice}, {
//             "time": respectedAt.unix(),
//             "price": floatPrice,
//           }],
//           "options": {
//             ...defaultShapeOptions, ...{
//               "shape": "trend_line",
//               "overrides": {...defaultShapeOverrides, "fillBackground": false, "linecolor": this.chartColors.notCrackedLine2, "linewidth": 1, "linestyle": 0},
//             },
//           },
//         }
//         shapes.push(this.chart.createMultipointShape(crackedTime.points, crackedTime.options))
//       }
//     } catch (error) {
//       console.error(error)
//     }
//     return shapes
//   }
//   removePriceLine = (entityId) => {
//     if (this.getEntity(entityId)) {
//       try {
//         this.chart.removeEntity(entityId, {disableUndo: true})
//       } catch (error) {
//         // assume shape removed
//       }
//     }
//   }
//   updatePriceLine = (entityId, price) => {
//     try {
//       let shape = this.chart.getShapeById(entityId)
//       if (shape) {
//         shape.setPoints([{time: moment().unix(), price: parseFloat(price)}])
//       }
//     } catch (error) {
//       // assume shape removed
//     }
//   }

//   roundTimeToResolution = (time) => {
//     return !isNaN(this.currentResolution()) ? time - (time % (Number(this.currentResolution()) * 60)) : time
//   }

//   drawTimeLine = (name, time, {color, timeFormat, rounded = true, label = "", withText = true, text = undefined, allowMove = false} = {}) => {
//     if (parseFloat(time) > 0) {
//       const timezone = this.currentTimezone()
//       text = !withText ? "" :
//         text || [`${timeLineToName[name]} ${moment(time * 1000).tz(timezone).format(timeFormat || "DD MMM 'YY HH:mm (UTCZ)")}`, label].filter(Boolean).join(" - ")

//       // The drawn point needs to be rounded to the current resolution, otherwise TV rounds it to the current time
//       const roundedTime = new Date((rounded ? this.roundTimeToResolution(time) : time) * 1000)

//       let orderShape = {
//         point: {time: roundedTime.valueOf() / 1000},
//         options: {
//           ...defaultShapeOptions,
//           lock: !allowMove,
//           disableSelection: !allowMove,
//           "shape": "vertical_line",
//           "overrides": {
//             ...defaultShapeOverrides,
//             "linecolor": color || this.chartColors[name],
//             "linewidth": 1,
//             "linestyle": 0,
//             "textcolor": color || this.chartColors[name],
//             "showTime": false,
//             "showLabel": true,
//             "text": text,
//           },
//         },
//       }

//       try {
//         return this.chart.createShape(orderShape.point, orderShape.options)
//       } catch (error) {
//         console.error(error, orderShape.point, orderShape.options)
//       }
//     }
//   }

//   drawPriceLine = (name, price, {color, showLabel, showPrice} = {}) => {
//     if (parseFloat(price) > 0) {
//       let orderShape = {
//         point: {time: 0, price: this.getPrecisePrice(price)},
//         options: {
//           ...defaultShapeOptions, ...{
//             "shape": "horizontal_line",
//             "zOrder": "bottom",
//             "overrides": {
//               ...defaultShapeOverrides,
//               "showPrice": showPrice,
//               "showLabel": showLabel,
//               "linecolor": color || this.chartColors[name],
//               "linewidth": 1,
//               "linestyle": 0,
//               "horzLabelsAlign": "right",
//               "textcolor": this.chartColors[name],
//             },
//           },
//         },
//       }

//       if (showLabel) {
//         orderShape.options["text"] = priceLineToName[name]
//       }

//       try {
//         return this.chart.createShape(orderShape.point, orderShape.options)
//       } catch (error) {
//         console.error(error, orderShape.point, orderShape.options)
//       }
//     }
//   }
//   createTriggerPriceHandle = ({price, color, isValid, left, right, onCancel, ...options}) => {
//     const quantityBackgroundColor = util.hex2rgba(color, isValid ? 1 : 0.4)

//     options = {
//       price: price,
//       color,
//       textColor: color,
//       quantityBackgroundColor,
//       showLine: true,
//       onCancel,
//       text: left || "",
//       quantity: right || "",
//       ...options,
//     }

//     return this.createOrderLine(options)
//   }
//   createPositionLine = ({showLine, price, text, color, textColor, onModify, onClose, closeButtonBackgroundColor, closeButtonIconColor, quantityText, lineLength, bodyBackgroundColor}) => {
//     let positionLine
//     try {
//       positionLine = this.chart.createOrderLine({disableUndo: true})
//     } catch (error) {
//       return false
//     }
//     const positionText = text || ""
//     const quantityTextSafe = quantityText || ""

//     positionLine
//       .setPrice(this.getPrecisePrice(price))
//       .setExtendLeft(showLine)
//       .setText(positionText.toUpperCase())
//       .setBodyBackgroundColor(color)
//       .setBodyBorderColor(color)
//       .setBodyTextColor(textColor)
//       .setTooltip("Change price")
//       .setQuantity(quantityTextSafe.toUpperCase())
//       .setQuantityFont(chartFont)
//       .setQuantityBackgroundColor(color)
//       .setQuantityBorderColor(color)
//       .setModifyTooltip(i18n.t("common.edit"))
//       .setCancelButtonIconColor(closeButtonIconColor || textColor)
//       .setCancelButtonBorderColor(tinycolor(color).darken(10).toString())
//       .setCancelButtonBackgroundColor(closeButtonBackgroundColor || color)
//       .setLineColor(color)
//       .onCancel(onClose)
//       .setLineStyle(2)
//       .onModify(onModify)

//     if (lineLength) {
//       positionLine.setLineLength(lineLength)
//     }

//     if (bodyBackgroundColor) {
//       positionLine.setBodyBackgroundColor(bodyBackgroundColor)
//     }

//     return positionLine
//   }
//   createOrderLine = ({showLine, text, price, quantity, textColor, color, bodyBackgroundColor, cancelButtonBackgroundColor, quantityBackgroundColor, onModify, onMove, onCancel, lineLength}) => {
//     let orderLine
//     try {
//       orderLine = this.chart.createOrderLine({disableUndo: true})
//     } catch (error) {
//       return false
//     }

//     const orderText = text || ""
//     const quantityTextSafe = quantity || ""
//     orderLine
//       .setPrice(this.getPrecisePrice(price))
//       .setQuantity(quantityTextSafe.toUpperCase())
//       .setText(orderText.toUpperCase())
//       .setLineColor(color)
//       .setBodyFont(chartFont)
//       .setBodyBorderColor(color)
//       .setBodyTextColor(textColor || color)
//       .setModifyTooltip(i18n.t("common.confirm"))
//       .setBodyBackgroundColor(bodyBackgroundColor || "#f5f5f5")
//       .setQuantityFont(chartFont)
//       .setQuantityBackgroundColor(quantityBackgroundColor || color)
//       .setQuantityBorderColor(color)
//       .setCancelButtonIconColor(color)
//       .setCancelButtonBorderColor(color)
//       .setCancelButtonBackgroundColor(cancelButtonBackgroundColor || "#f5f5f5")
//       .onModify({}, onModify)
//       .onMove({}, onMove)
//       .onCancel({}, onCancel)
//       .setExtendLeft(showLine)

//     if (lineLength) {
//       orderLine.setLineLength(lineLength)
//     }

//     return orderLine
//   }
//   drawTrendLine = (points, {lock = false, disableSelection = false, lineType = "LineToolTrendLine", lineProperties, label, color} = {}) => {
//     const {from: startTime, to: endTime} = getVisibleTimeRange()

//     if (points.length === 0) {
//       const {from: startPrice, to: endPrice} = getVisiblePriceRange()

//       const priceDiff = (endPrice - startPrice) * 0.40
//       const timeDiff = (endTime - startTime)

//       points = [
//         {"time": startTime + timeDiff * 0.7, "price": startPrice + priceDiff},
//         {"time": endTime - timeDiff * 0.1, "price": endPrice - priceDiff},
//       ]
//     }

//     points = sortBy(points, "time")

//     let roundedTimes = [
//       util.roundTimeToCandle(points[0].time * 1000, this.currentResolution()).getTime() / 1000,
//       util.roundTimeToCandle(points[1].time * 1000, this.currentResolution()).getTime() / 1000,
//     ]

//     roundedTimes[0] = Math.min(roundedTimes[0], endTime)
//     roundedTimes[1] = clamp(roundedTimes[1], startTime, endTime)

//     let newPoints = [
//       {time: roundedTimes[0], price: util.priceAtTime(points, roundedTimes[0])},
//       {time: roundedTimes[1], price: util.priceAtTime(points, roundedTimes[1])},
//     ]

//     const line = {
//       "points": newPoints,
//       "options": {
//         ...defaultShapeOptions, ...{
//           shape: lineTypeToShape[lineType] || "trend_line",
//           lock: false,
//           text: label,
//           disableSelection,
//           disableErasing: true,
//           overrides: {
//             ...defaultShapeOverrides,
//             vertLabelsAlign: "top",
//             horzLabelsAlign: "right",
//             fillBackground: false,
//             linecolor: color,
//             extendLeft: false,
//             extendRight: false,
//             linewidth: 2,
//             linestyle: 0,
//             leftEnd: 0,
//             rightEnd: 0,
//             fontsize: 14,
//             bold: false,
//             italic: false,
//             showMiddlePoint: false,
//             showPriceLabels: false,
//             showPriceRange: false,
//             showBarsRange: false,
//             showDateTimeRange: false,
//             showDistance: false,
//             showAngle: false,
//             statsPosition: 2,
//             frozen: false,
//             visible: true,
//             ...lineProperties,
//             showLabel: true,
//             textcolor: color,
//             text: label,
//             title: "",
//           },
//         },
//       },
//     }

//     return this.chart.createMultipointShape(line.points, line.options)
//   }
// }

// export const chartFunctions = (tvWidget, chart, theme, chartSettings, currentMarket) => {
//   return new ChartFunctions(tvWidget, chart, theme, chartSettings, currentMarket)
// }
