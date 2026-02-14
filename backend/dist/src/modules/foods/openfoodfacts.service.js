"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OpenFoodFactsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenFoodFactsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let OpenFoodFactsService = OpenFoodFactsService_1 = class OpenFoodFactsService {
    constructor() {
        this.logger = new common_1.Logger(OpenFoodFactsService_1.name);
        this.worldUrl = 'https://world.openfoodfacts.org/api/v2';
        this.uaUrl = 'https://ua.openfoodfacts.org/api/v2';
        this.userAgent = 'Body&Dry App/1.0 (contact@bodyndry.app)';
    }
    async getProductByBarcode(barcode) {
        try {
            const response = await axios_1.default.get(`${this.worldUrl}/product/${barcode}.json`, {
                headers: {
                    'User-Agent': this.userAgent,
                },
                timeout: 10000,
            });
            if (response.data.status !== 1 || !response.data.product) {
                this.logger.log(`Product not found in Open Food Facts: ${barcode}`);
                return null;
            }
            const product = response.data.product;
            return this.normalizeProduct(product, barcode);
        }
        catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            this.logger.error(`Open Food Facts API error for barcode ${barcode}:`, error.message);
            throw new Error('Failed to fetch product from Open Food Facts');
        }
    }
    async searchProducts(query, limit = 20) {
        const searchOne = async (baseUrl) => {
            try {
                const response = await axios_1.default.get(`${baseUrl}/search`, {
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
                if (!response.data.products?.length)
                    return [];
                return response.data.products
                    .map((product) => this.normalizeProduct(product, product.code))
                    .filter((p) => p !== null);
            }
            catch (error) {
                this.logger.warn(`OFF search error (${baseUrl}): ${error.message}`);
                return [];
            }
        };
        const [uaResults, worldResults] = await Promise.all([
            searchOne(this.uaUrl),
            searchOne(this.worldUrl),
        ]);
        const seen = new Set();
        const combined = [];
        for (const item of [...uaResults, ...worldResults]) {
            if (item.barcode && seen.has(item.barcode))
                continue;
            if (item.barcode)
                seen.add(item.barcode);
            combined.push(item);
        }
        return combined.slice(0, limit);
    }
    normalizeProduct(product, barcode) {
        if (!product.product_name) {
            return null;
        }
        const nutriments = product.nutriments || {};
        let calories = nutriments['energy-kcal_100g'] || 0;
        if (!calories && nutriments['energy_100g']) {
            calories = Math.round(nutriments['energy_100g'] / 4.184);
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
};
exports.OpenFoodFactsService = OpenFoodFactsService;
exports.OpenFoodFactsService = OpenFoodFactsService = OpenFoodFactsService_1 = __decorate([
    (0, common_1.Injectable)()
], OpenFoodFactsService);
//# sourceMappingURL=openfoodfacts.service.js.map