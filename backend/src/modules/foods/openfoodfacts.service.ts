import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
    'fiber_100g'?: number;
    'sugars_100g'?: number;
    'sodium_100g'?: number;
  };
  serving_size?: string;
  image_url?: string;
  image_front_url?: string;
  categories?: string;
  quantity?: string;
}

export interface NormalizedFood {
  barcode: string;
  name: string;
  brand: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number | null;
  servingSize: string | null;
  imageUrl: string | null;
  category: string | null;
  source: 'openfoodfacts';
}

@Injectable()
export class OpenFoodFactsService {
  private readonly logger = new Logger(OpenFoodFactsService.name);
  private readonly worldUrl = 'https://world.openfoodfacts.org/api/v2';
  private readonly uaUrl = 'https://ua.openfoodfacts.org/api/v2';
  private readonly userAgent = 'Body&Dry App/1.0 (contact@bodyndry.app)';

  /**
   * Fetch product by barcode from Open Food Facts API
   */
  async getProductByBarcode(barcode: string): Promise<NormalizedFood | null> {
    try {
      const response = await axios.get(`${this.worldUrl}/product/${barcode}.json`, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000, // 10 seconds timeout
      });

      if (response.data.status !== 1 || !response.data.product) {
        this.logger.log(`Product not found in Open Food Facts: ${barcode}`);
        return null;
      }

      const product: OpenFoodFactsProduct = response.data.product;
      return this.normalizeProduct(product, barcode);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Open Food Facts API error for barcode ${barcode}:`, error.message);
      throw new Error('Failed to fetch product from Open Food Facts');
    }
  }

  /**
   * Search products in both Ukrainian and world Open Food Facts databases in parallel
   */
  async searchProducts(query: string, limit: number = 20): Promise<NormalizedFood[]> {
    const searchOne = async (baseUrl: string): Promise<NormalizedFood[]> => {
      try {
        const response = await axios.get(`${baseUrl}/search`, {
          params: {
            search_terms: query,
            search_simple: 1,
            action: 'process',
            json: 1,
            page_size: Math.ceil(limit / 2),
            fields: 'code,product_name,brands,nutriments,serving_size,image_url,image_front_url,categories',
          },
          headers: { 'User-Agent': this.userAgent },
          timeout: 8000,
        });

        if (!response.data.products?.length) return [];

        return response.data.products
          .map((product: OpenFoodFactsProduct) => this.normalizeProduct(product, product.code))
          .filter((p: NormalizedFood | null) => p !== null) as NormalizedFood[];
      } catch (error: any) {
        this.logger.warn(`OFF search error (${baseUrl}): ${error.message}`);
        return [];
      }
    };

    const [uaResults, worldResults] = await Promise.all([
      searchOne(this.uaUrl),
      searchOne(this.worldUrl),
    ]);

    // Deduplicate by barcode, prefer UA results
    const seen = new Set<string>();
    const combined: NormalizedFood[] = [];
    for (const item of [...uaResults, ...worldResults]) {
      if (item.barcode && seen.has(item.barcode)) continue;
      if (item.barcode) seen.add(item.barcode);
      combined.push(item);
    }

    return combined.slice(0, limit);
  }

  /**
   * Normalize Open Food Facts product to our format
   */
  private normalizeProduct(product: OpenFoodFactsProduct, barcode: string): NormalizedFood | null {
    // Skip products without essential data
    if (!product.product_name) {
      return null;
    }

    const nutriments = product.nutriments || {};

    // Get calories - prefer kcal, fallback to kJ conversion
    let calories = nutriments['energy-kcal_100g'] || 0;
    if (!calories && nutriments['energy_100g']) {
      // Convert kJ to kcal (1 kcal ≈ 4.184 kJ)
      calories = Math.round((nutriments['energy_100g'] as number) / 4.184);
    }

    return {
      barcode,
      name: product.product_name,
      brand: product.brands || null,
      calories: Math.round(calories),
      protein: Math.round((nutriments['proteins_100g'] || 0) * 10) / 10,
      carbs: Math.round((nutriments['carbohydrates_100g'] || 0) * 10) / 10,
      fats: Math.round((nutriments['fat_100g'] || 0) * 10) / 10,
      fiber: nutriments['fiber_100g'] ? Math.round(nutriments['fiber_100g'] * 10) / 10 : null,
      servingSize: product.serving_size || null,
      imageUrl: product.image_front_url || product.image_url || null,
      category: product.categories?.split(',')[0]?.trim() || null,
      source: 'openfoodfacts',
    };
  }
}
