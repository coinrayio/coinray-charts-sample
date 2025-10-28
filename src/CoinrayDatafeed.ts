import type { Datafeed, DatafeedSubscribeCallback, Period, SymbolInfo } from "@klinecharts/pro";
import Coinray, { CoinrayCache } from "coinrayjs";
import type { Candle } from "coinrayjs/dist/types";
import type { KLineData } from "klinecharts";
import type { SubscribeCandlesData } from "./types/CoinrayFeedTypes";

export class CoinrayDatafeed implements Datafeed
{
    private api: Coinray;
    private cache: CoinrayCache;
    private firstLoad: boolean;
    // private lastBarTime: number;
    private lastCandle: Candle | null;
    public firstData: KLineData[] = [];

    constructor() {
        let token = (import.meta.env.VITE_COINRAY_API_KEY || '') as string
        this.api = new Coinray(token)
        this.cache = new CoinrayCache(token, {
        apiEndpoint: "https://api-staging.coinray.eu",
        orderEndpoint: "http://localhost:3000",
        websocketEndpoint: "wss://ws.coinray.eu/v1"
        }, 30 * 1000)

        this.cache.onTokenExpired(async () => {
            console.log("TOKEN EXPIRED ------")
            return token
        })
        this.firstLoad = true;
        // this.lastBarTime = 0;
        this.lastCandle = null;
    }

    async searchSymbols(search?: string): Promise<SymbolInfo[]> { 
        console.info("searchSymbols", search);  
        return await Promise.resolve([]);
    }

    async getHistoryKLineData(symbol: SymbolInfo, period: Period, from: number, to: number): Promise<KLineData[]> {
        from /= 1000;
        to /= 1000;
        if (!this.firstLoad) {
            to = to + (period.span * this.timespanToMinutes(period.type) * 60);
        }
        console.info('getHistoryKLineData called with:' ,{ symbol, period, from, to })
        const candles = await this.api.fetchCandles({ coinraySymbol: `${symbol.exchange}_${symbol.ticker ?? symbol.shortName}`, resolution: `${period.span * this.timespanToMinutes(period.type)}`, start: from, end: to, useWebSocket: false });
        // console.info(candles)

        if (this.firstLoad && candles.length > 0) {
            this.lastCandle = candles[candles.length - 1] || null;    
        }

        const data: KLineData[] = candles.map(c => ({
            ...c,
            volume: c.baseVolume,
            timestamp: c.time.valueOf()
        }));

        console.info(data);
        if (this.firstLoad) {
            this.firstData = data;
        }
        this.firstLoad = false;
        return data;
    }

    subscribe(symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void {
        this.api.subscribeCandles({ coinraySymbol: `${symbol.exchange}_${symbol.ticker ?? symbol.shortName}`, resolution: `${period.span * this.timespanToMinutes(period.type)}`, lastCandle: this.lastCandle || undefined }, (data: SubscribeCandlesData) => {
            const candle = {
                ...data.candle,
                volume: data.candle.baseVolume,
                timestamp: data.candle.time.valueOf()
            }
            return callback(candle);
        });
    }

    unsubscribe(symbol: SymbolInfo, period: Period): void {
        this.api.unsubscribeCandles({ coinraySymbol: `${symbol.exchange}_${symbol.ticker ?? symbol.shortName}`, resolution: `${period.span * this.timespanToMinutes(period.type)}` });
    }

    private timespanToMinutes(timespan: string): number {
        switch (timespan) {
            case 'minute': return 1;
            case 'hour': return 60;
            case 'day': return 1440;
            case 'week': return 10080;
            case 'month': return 43200;
            case 'year': return 525600;
            default: return 1;
        }
    }
}