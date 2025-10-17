import type { Candle } from "coinrayjs/dist/types"

export type SubscribeCandlesData = {
    candle: Candle
    coinraySymbol: string
    resolution: number
    previousCandles: Candle[]
}