import axios from 'axios';
import type { CoinData, MarketData, Coin } from '@/types/crypto';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export async function getTrendingCryptos() {
  try {
    // Get trending coins
    const trendingResponse = await axios.get(`${COINGECKO_API}/search/trending`);
    const trendingCoins: CoinData[] = trendingResponse.data.coins;

    // Get market data for all coins to get actual market cap ranks
    const marketDataResponse = await axios.get(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&sparkline=false`
    );
    const marketData: MarketData[] = marketDataResponse.data;

    // Get detailed price data for trending coins
    const coinIds = trendingCoins.map(coin => coin.item.id).join(',');
    const priceData = await axios.get(
      `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd,eur,btc&include_24hr_change=true`
    );

    // Create a map of market cap ranks
    const marketCapRanks = new Map(
      marketData.map(coin => [coin.id, coin.market_cap_rank])
    );

    // Calculate trending position (1-7 for trending coins)
    const trendingPosition = new Map(
      trendingCoins.map((coin, index) => [coin.item.id, index + 1])
    );

    // Enhance coin data with market cap ranks and trending positions
    return trendingCoins.map(coin => ({
      ...coin,
      item: {
        ...coin.item,
        price_usd: priceData.data[coin.item.id]?.usd || 0,
        price_eur: priceData.data[coin.item.id]?.eur || 0,
        price_btc: priceData.data[coin.item.id]?.btc || 0,
        price_change_percentage_24h: priceData.data[coin.item.id]?.usd_24h_change || 0,
        market_cap_rank: marketCapRanks.get(coin.item.id) || null,
        trending_position: trendingPosition.get(coin.item.id) || null,
        last_updated: Date.now()
      }
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
}

export async function searchCryptos(query: string): Promise<Coin[]> {
  try {
    const response = await axios.get(`${COINGECKO_API}/search?query=${encodeURIComponent(query)}`);
    return response.data.coins.slice(0, 5).map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      thumb: coin.thumb,
      market_cap_rank: coin.market_cap_rank
    }));
  } catch (error) {
    console.error('Error searching cryptocurrencies:', error);
    return [];
  }
}