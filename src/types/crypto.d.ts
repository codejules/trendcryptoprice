export interface CoinData {
    item: {
      id: string;
      name: string;
      symbol: string;
      thumb: string;
      price_btc: number;
      price_usd: number;
      price_eur: number;
      price_change_percentage_24h: number;
      market_cap_rank: number | null;
      trending_position: number | null;
      last_updated: number;
      data: {
        market_cap: string | null;
      };
    };
  }
  
  export interface MarketData {
    id: string;
    market_cap_rank: number;
  }

  export interface Coin {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    market_cap_rank?: number;
  }
