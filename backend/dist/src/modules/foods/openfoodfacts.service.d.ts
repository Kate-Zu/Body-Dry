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
export declare class OpenFoodFactsService {
    private readonly logger;
    private readonly worldUrl;
    private readonly uaUrl;
    private readonly userAgent;
    getProductByBarcode(barcode: string): Promise<NormalizedFood | null>;
    searchProducts(query: string, limit?: number): Promise<NormalizedFood[]>;
    private normalizeProduct;
}
