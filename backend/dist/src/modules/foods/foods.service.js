"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FoodsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const openfoodfacts_service_1 = require("./openfoodfacts.service");
let FoodsService = FoodsService_1 = class FoodsService {
    constructor(prisma, openFoodFacts) {
        this.prisma = prisma;
        this.openFoodFacts = openFoodFacts;
        this.logger = new common_1.Logger(FoodsService_1.name);
        this.synonymMap = {
            'курка': ['куряч', 'курят', 'курин', 'курк', 'куроч'],
            'курятина': ['куряч', 'курят', 'курин', 'курк'],
            'куряча': ['курк', 'курят', 'курин', 'куряч'],
            'курячий': ['курк', 'курят', 'курин', 'куряч'],
            'свинина': ['свин', 'свиняч', 'свинн'],
            'свинячий': ['свин', 'свиняч'],
            'яловичина': ['яловичин', 'яловичий', 'ялович'],
            'яловичий': ['яловичин', 'ялович'],
            'телятина': ['теляч', 'телят'],
            'баранина': ['баран', 'бараняч'],
            'індичка': ['індич', 'індик', 'індюш'],
            'індичина': ['індич', 'індик', 'індюш'],
            'кролятина': ['кроляч', 'кроляти', 'кролик'],
            'качка': ['качач', 'качин'],
            'гусятина': ['гусяч', 'гусят'],
            'фарш': ['фарш'],
            'печінка': ['печінк', 'печіноч'],
            'серце': ['серц', 'сердеч'],
            'язик': ['язик', 'язиков'],
            'сало': ['сало', 'салов'],
            'бекон': ['бекон'],
            'шашлик': ['шашлик', 'шашлич'],
            'ковбаса': ['ковбас'],
            'сосиски': ['сосиск', 'сосис'],
            'сарделі': ['сардел'],
            'шинка': ['шинк'],
            'буженина': ['бужен'],
            'паштет': ['пашт'],
            'балик': ['балик'],
            'молоко': ['молоч', 'молок'],
            'молочний': ['молоко', 'молоч'],
            'сир': ['сир', 'сирн'],
            'сирний': ['сир', 'сирн'],
            'масло': ['масл', 'маслян'],
            'сметана': ['сметан'],
            'кефір': ['кефір', 'кефир'],
            'йогурт': ['йогурт'],
            'ряжанка': ['ряжанк'],
            'вершки': ['вершк', 'вершков'],
            'моцарела': ['моцарел'],
            'пармезан': ['пармезан'],
            'чеддер': ['чеддер'],
            'камамбер': ['камамбер'],
            'рікотта': ['рікотт'],
            'маскарпоне': ['маскарпон'],
            'бринза': ['бринз'],
            'фета': ['фета'],
            'сулугуні': ['сулугун'],
            'згущене': ['згущ', 'згущен'],
            'вівсянка': ['вівсян', 'вівс', 'овсян'],
            'вівсяний': ['вівсян', 'вівс', 'овсян'],
            'гречка': ['гречан', 'гречн', 'гречк'],
            'гречана': ['гречк', 'гречн'],
            'рис': ['рис', 'рисов'],
            'пшоно': ['пшон', 'пшенн'],
            'булгур': ['булгур'],
            'манка': ['манн', 'манк'],
            'кускус': ['кускус'],
            'кіноа': ['кіноа', 'кінва'],
            'полба': ['полб'],
            'перловка': ['перлов'],
            'ячна': ['ячн', 'ячмін'],
            'хліб': ['хліб', 'хлібн', 'хлебн'],
            'батон': ['батон'],
            'лаваш': ['лаваш'],
            'хлібці': ['хлібц'],
            'круасан': ['круасан'],
            'піта': ['піта'],
            'тортилья': ['тортіль', 'тортил'],
            'макарони': ['макарон'],
            'спагетті': ['спагет'],
            'пенне': ['пенне'],
            'фузіллі': ['фузіл'],
            'лазанья': ['лазань'],
            'локшина': ['локшин'],
            'риба': ['рибн', 'риб'],
            'рибний': ['риб', 'рибн'],
            'лосось': ['лосос'],
            'тунець': ['тунц', 'тунець'],
            'форель': ['форел'],
            'скумбрія': ['скумбрі'],
            'тріска': ['тріск'],
            'оселедець': ['оселед', 'селед'],
            'судак': ['судак'],
            'щука': ['щук'],
            'короп': ['короп'],
            'минтай': ['минтай', 'минта'],
            'хек': ['хек'],
            'тилапія': ['тилапі'],
            'дорадо': ['дорадо'],
            'сібас': ['сібас'],
            'креветки': ['кревет'],
            'кальмари': ['кальмар'],
            'мідії': ['мідій', 'мідії'],
            'ікра': ['ікр'],
            'картопля': ['картопл', 'картофел'],
            'батат': ['батат'],
            'капуста': ['капуст'],
            'броколі': ['бrokol', 'брокол'],
            'помідор': ['помідор', 'томат'],
            'томат': ['томат', 'помідор'],
            'огірок': ['огірк', 'огірок', 'огіроч'],
            'цибуля': ['цибул'],
            'часник': ['часник', 'часнич'],
            'кабачки': ['кабачк', 'кабач'],
            'цукіні': ['цукін'],
            'баклажан': ['баклажан'],
            'гарбуз': ['гарбуз'],
            'буряк': ['буряк', 'бурячк'],
            'морква': ['моркв', 'морквян'],
            'перець': ['переч', 'перц'],
            'шпинат': ['шпинат'],
            'гриби': ['гриб', 'грибн'],
            'печериці': ['печериц'],
            'шампіньйони': ['шампіньйон'],
            'спаржа': ['спарж'],
            'кукурудза': ['кукурудз'],
            'горошок': ['горошк', 'горошок'],
            'квашена': ['квашен'],
            'яблуко': ['яблуч', 'яблук'],
            'яблучний': ['яблук', 'яблуч'],
            'банан': ['банан'],
            'апельсин': ['апельсин'],
            'мандарин': ['мандарин'],
            'грейпфрут': ['грейпфрут'],
            'лимон': ['лимон'],
            'виноград': ['виноград'],
            'груша': ['груш'],
            'персик': ['персик'],
            'абрикос': ['абрикос'],
            'слива': ['слив'],
            'вишня': ['вишн', 'вишнев'],
            'черешня': ['черешн'],
            'кавун': ['кавун'],
            'диня': ['дин'],
            'манго': ['манго'],
            'ананас': ['ананас'],
            'ківі': ['ківі'],
            'хурма': ['хурм'],
            'гранат': ['гранат'],
            'авокадо': ['авокадо'],
            'полуниця': ['полуниц', 'полуничн'],
            'малина': ['малин'],
            'чорниця': ['чорниц', 'чорничн'],
            'смородина': ['смородин'],
            'ожина': ['ожин'],
            'горіх': ['горіх', 'горіш'],
            'арахіс': ['арахіс'],
            'мигдаль': ['мигдал'],
            'фундук': ['фундук'],
            'кешʼю': ['кешʼю', 'кешю', 'кеш'],
            'фісташки': ['фісташк'],
            'насіння': ['насінн'],
            'кунжут': ['кунжут'],
            'яйце': ['яєч', 'яйц', 'яйко'],
            'яйця': ['яєч', 'яйц', 'яйко'],
            'квасоля': ['квасол', 'квасоль'],
            'сочевиця': ['сочевиц'],
            'нут': ['нут'],
            'горох': ['горох', 'горохов'],
            'соя': ['соя', 'соєв'],
            'тофу': ['тофу'],
            'едамаме': ['едамаме'],
            'олія': ['олі', 'олій'],
            'борошно': ['борошн'],
            'крохмаль': ['крохмал'],
            'кетчуп': ['кетчуп'],
            'майонез': ['майонез'],
            'гірчиця': ['гірчиц'],
            'хумус': ['хумус'],
            'песто': ['песто'],
            'соус': ['соус'],
            'кава': ['кав', 'кофе', 'кофей'],
            'чай': ['чай', 'чайн'],
            'сік': ['сік', 'сок', 'соков'],
            'какао': ['какао'],
            'смузі': ['смузі'],
            'лимонад': ['лимонад'],
            'компот': ['компот'],
            'квас': ['квас'],
            'цукор': ['цукор', 'цукров', 'сахар'],
            'мед': ['мед', 'медов'],
            'шоколад': ['шоколад'],
            'торт': ['торт', 'тортик'],
            'пиріг': ['пиріг', 'пиріж'],
            'зефір': ['зефір'],
            'мармелад': ['мармелад'],
            'халва': ['халв'],
            'морозиво': ['морозив'],
            'печиво': ['печив'],
            'вафлі': ['вафл'],
            'варення': ['варенн', 'варень'],
            'джем': ['джем'],
            'курага': ['кураг'],
            'чорнослив': ['чорнослив'],
            'родзинки': ['родзинк'],
            'фініки': ['фінік'],
            'борщ': ['борщ'],
            'суп': ['суп'],
            'вареники': ['вареник'],
            'пельмені': ['пельмен'],
            'голубці': ['голубц'],
            'котлета': ['котлет'],
            'омлет': ['омлет'],
            'сирники': ['сирник'],
            'млинці': ['млинц', 'млинч'],
            'деруни': ['дерун', 'деруні'],
            'драники': ['дранік', 'дранки'],
            'салат': ['салат'],
            'каша': ['каш'],
            'піца': ['піц', 'пица'],
            'бургер': ['бургер'],
            'шаурма': ['шаурм'],
            'наггетс': ['наггетс', 'нагетс'],
            'суші': ['суші', 'суш'],
            'плов': ['плов'],
            'чіпси': ['чіпс'],
            'попкорн': ['попкорн'],
            'гранола': ['гранол'],
            'протеїн': ['протеїн', 'протеін'],
            'гейнер': ['гейнер'],
            'казеїн': ['казеїн', 'казеін'],
            'bcaa': ['bcaa'],
        };
    }
    getSearchTerms(query) {
        const words = query.toLowerCase().replace(/[^а-яїієґa-z0-9\s]/gi, '').split(/\s+/).filter(Boolean);
        const terms = [];
        for (const word of words) {
            terms.push(word);
            const synonyms = this.synonymMap[word];
            if (synonyms) {
                terms.push(...synonyms);
            }
            for (const [key, vals] of Object.entries(this.synonymMap)) {
                if (key.startsWith(word) && key !== word) {
                    terms.push(...vals);
                }
            }
            if (word.length >= 4) {
                const stemLen = Math.max(3, Math.floor(word.length * 0.6));
                terms.push(word.slice(0, stemLen));
            }
        }
        return [...new Set(terms)];
    }
    trigramSimilarity(a, b) {
        const getTrigrams = (s) => {
            const padded = `  ${s.toLowerCase()} `;
            const trigrams = new Set();
            for (let i = 0; i < padded.length - 2; i++) {
                trigrams.add(padded.slice(i, i + 3));
            }
            return trigrams;
        };
        const triA = getTrigrams(a);
        const triB = getTrigrams(b);
        let intersection = 0;
        for (const t of triA) {
            if (triB.has(t))
                intersection++;
        }
        const union = triA.size + triB.size - intersection;
        return union === 0 ? 0 : intersection / union;
    }
    scoreFood(food, query) {
        const qLower = query.toLowerCase().trim();
        const name = (food.name || '').toLowerCase();
        const brand = (food.brand || '').toLowerCase();
        let score = 0;
        if (name === qLower)
            return 200;
        if (name.startsWith(qLower))
            score += 100;
        if (name.includes(qLower))
            score += 80;
        if (brand.includes(qLower))
            score += 40;
        const searchTerms = this.getSearchTerms(qLower);
        const nameWords = name.split(/\s+/);
        const allWords = `${name} ${brand}`.split(/\s+/);
        for (const term of searchTerms) {
            for (const word of allWords) {
                if (word === term) {
                    score += 30;
                }
                else if (word.startsWith(term)) {
                    score += 25;
                }
                else if (term.length >= 3 && word.includes(term)) {
                    score += 10;
                }
            }
        }
        if (score === 0) {
            const queryWords = qLower.split(/\s+/);
            for (const qw of queryWords) {
                for (const nw of nameWords) {
                    const sim = this.trigramSimilarity(qw, nw);
                    if (sim >= 0.35) {
                        score += Math.round(sim * 40);
                    }
                }
            }
        }
        return score;
    }
    async search(query, limit = 20) {
        if (!query.trim()) {
            return this.prisma.food.findMany({
                take: limit,
                orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
            });
        }
        const searchTerms = this.getSearchTerms(query);
        const orConditions = [
            { name: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
        ];
        for (const term of searchTerms) {
            if (term.length >= 3) {
                orConditions.push({ name: { contains: term, mode: 'insensitive' } });
            }
        }
        const [localCandidates, offResults] = await Promise.all([
            this.prisma.food.findMany({
                where: { OR: orConditions },
                take: limit * 3,
                orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
            }),
            this.openFoodFacts.searchProducts(query, limit).catch((err) => {
                this.logger.warn(`Open Food Facts search failed: ${err.message}`);
                return [];
            }),
        ]);
        const scoredLocal = localCandidates
            .map((food) => ({ food, score: this.scoreFood(food, query) }))
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        const relevantOff = offResults
            .map((off) => ({ off, score: this.scoreFood(off, query) }))
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score);
        const savedOffResults = await Promise.all(relevantOff.map(async ({ off, score }) => {
            try {
                if (off.barcode) {
                    const existing = await this.prisma.food.findUnique({
                        where: { barcode: off.barcode },
                    });
                    if (existing)
                        return { food: existing, score: this.scoreFood(existing, query) };
                }
                const created = await this.prisma.food.create({
                    data: {
                        name: off.name,
                        brand: off.brand,
                        barcode: off.barcode,
                        calories: off.calories,
                        protein: off.protein,
                        carbs: off.carbs,
                        fats: off.fats,
                        fiber: off.fiber,
                        imageUrl: off.imageUrl,
                        isVerified: true,
                        source: 'openfoodfacts',
                    },
                });
                return { food: created, score };
            }
            catch {
                return null;
            }
        }));
        const validOff = savedOffResults.filter((item) => item !== null);
        const allScored = [...scoredLocal, ...validOff];
        const seen = new Set();
        const unique = allScored.filter((item) => {
            if (seen.has(item.food.id))
                return false;
            seen.add(item.food.id);
            return true;
        });
        unique.sort((a, b) => b.score - a.score);
        return unique.slice(0, limit).map((item) => item.food);
    }
    async getById(id) {
        const food = await this.prisma.food.findUnique({
            where: { id },
        });
        if (!food) {
            throw new common_1.NotFoundException('Продукт не знайдено');
        }
        return food;
    }
    async getByBarcode(barcode) {
        const localFood = await this.prisma.food.findUnique({
            where: { barcode },
        });
        if (localFood) {
            return localFood;
        }
        this.logger.log(`Barcode ${barcode} not in local DB, searching Open Food Facts...`);
        const offProduct = await this.openFoodFacts.getProductByBarcode(barcode);
        if (!offProduct) {
            throw new common_1.NotFoundException('Продукт не знайдено');
        }
        const savedFood = await this.prisma.food.create({
            data: {
                name: offProduct.name,
                brand: offProduct.brand,
                barcode: offProduct.barcode,
                calories: offProduct.calories,
                protein: offProduct.protein,
                carbs: offProduct.carbs,
                fats: offProduct.fats,
                fiber: offProduct.fiber,
                imageUrl: offProduct.imageUrl,
                isVerified: true,
                source: 'openfoodfacts',
            },
        });
        this.logger.log(`Saved product from Open Food Facts: ${savedFood.name} (${barcode})`);
        return savedFood;
    }
    async create(userId, dto) {
        return this.prisma.food.create({
            data: {
                ...dto,
                source: 'manual',
                createdByUserId: userId,
                isVerified: false,
            },
        });
    }
    async getRecent(userId, limit = 10) {
        const recentMealFoods = await this.prisma.mealFood.findMany({
            where: {
                meal: { userId },
            },
            include: {
                food: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit * 2,
            distinct: ['foodId'],
        });
        return recentMealFoods.map(mf => mf.food).slice(0, limit);
    }
    async getFavorites(userId) {
        const favorites = await this.prisma.favoriteFood.findMany({
            where: { userId },
            include: { food: true },
            orderBy: { createdAt: 'desc' },
        });
        return favorites.map(f => f.food);
    }
    async addToFavorites(userId, foodId) {
        const food = await this.prisma.food.findUnique({ where: { id: foodId } });
        if (!food) {
            throw new common_1.NotFoundException('Продукт не знайдено');
        }
        const existing = await this.prisma.favoriteFood.findUnique({
            where: {
                userId_foodId: { userId, foodId },
            },
        });
        if (existing) {
            return { message: 'Вже в улюблених' };
        }
        await this.prisma.favoriteFood.create({
            data: { userId, foodId },
        });
        return { message: 'Додано в улюблені' };
    }
    async removeFromFavorites(userId, foodId) {
        await this.prisma.favoriteFood.deleteMany({
            where: { userId, foodId },
        });
        return { message: 'Видалено з улюблених' };
    }
};
exports.FoodsService = FoodsService;
exports.FoodsService = FoodsService = FoodsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        openfoodfacts_service_1.OpenFoodFactsService])
], FoodsService);
//# sourceMappingURL=foods.service.js.map