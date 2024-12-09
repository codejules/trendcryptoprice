import { getTrendingCryptos } from './crypto';

class PriceUpdater {
  private static instance: PriceUpdater;
  private prices: any = null;
  private lastUpdate: number = 0;
  private readonly UPDATE_INTERVAL = 4 * 60 * 60 * 1000; // update prices each 4 horas, 24 hours in milliseconds
  private readonly CACHE_TTL = 4 * 60 * 60 * 1000; // Cache Time-to-Live (4 hours)

  private constructor() {
    this.initializeUpdates();
  }

  public static getInstance(): PriceUpdater {
    if (!PriceUpdater.instance) {
      PriceUpdater.instance = new PriceUpdater();
    }
    return PriceUpdater.instance;
  }

  private async initializeUpdates() {
    await this.updatePrices();
    setInterval(() => this.updatePrices(), this.UPDATE_INTERVAL);
  }

  private async updatePrices() {
    // Check if cache is still valid (TTL has not expired)
    if (this.isCacheValid()) {
      console.log('Using cached prices');
      return; // Skip updating if cache is still valid
    }

    const maxRetries = 3;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        this.prices = await getTrendingCryptos();
        this.lastUpdate = Date.now();
        console.log('Crypto prices updated:', new Date(this.lastUpdate).toLocaleString());
        return;
      } catch (error) {
        attempts++;
        console.error(`Attempt ${attempts} failed to update prices:`, error);
        if (attempts < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempts * 1000)); // Retry with delay
        }
      }
    }

    console.error('Failed to update prices after maximum retries.');
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastUpdate < this.CACHE_TTL;
  }

  public async getPrices() {
    // Only fetch new prices if cache is invalid or expired
    if (this.isCacheValid()) {
      console.log('Returning cached prices');
      return this.prices; // Return cached prices if they are still valid
    }

    // Otherwise, update the prices
    await this.updatePrices();
    return this.prices;
  }

  public getLastUpdateTime() {
    return this.lastUpdate;
  }
}

export const priceUpdater = PriceUpdater.getInstance();