import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { OpenFoodFactsService } from './openfoodfacts.service';

@Injectable()
export class FoodsService {
  private readonly logger = new Logger(FoodsService.name);

  /**
   * Ukrainian food synonym map — maps common search terms to all their morphological forms.
   * This handles cases like "курка" → "куряча грудка", "молоко" → "молочний" etc.
   */
  private readonly synonymMap: Record<string, string[]> = {
    // М'ясо та птиця
    'курка': ['куряч', 'курят', 'курин', 'курк', 'куроч'],
    'курятина': ['куряч', 'курят', 'курин', 'курк'],
    // М'ясо та птиця
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
    // Ковбаси
    'ковбаса': ['ковбас'],
    'сосиски': ['сосиск', 'сосис'],
    'сарделі': ['сардел'],
    'шинка': ['шинк'],
    'буженина': ['бужен'],
    'паштет': ['пашт'],
    'балик': ['балик'],
    // Молочне
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
    // Крупи та зернові
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
    // Хліб
    'хліб': ['хліб', 'хлібн', 'хлебн'],
    'батон': ['батон'],
    'лаваш': ['лаваш'],
    'хлібці': ['хлібц'],
    'круасан': ['круасан'],
    'піта': ['піта'],
    'тортилья': ['тортіль', 'тортил'],
    // Макарони
    'макарони': ['макарон'],
    'спагетті': ['спагет'],
    'пенне': ['пенне'],
    'фузіллі': ['фузіл'],
    'лазанья': ['лазань'],
    'локшина': ['локшин'],
    // Риба
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
    // Овочі
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
    // Фрукти
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
    // Горіхи та насіння
    'горіх': ['горіх', 'горіш'],
    'арахіс': ['арахіс'],
    'мигдаль': ['мигдал'],
    'фундук': ['фундук'],
    'кешʼю': ['кешʼю', 'кешю', 'кеш'],
    'фісташки': ['фісташк'],
    'насіння': ['насінн'],
    'кунжут': ['кунжут'],
    // Яйця
    'яйце': ['яєч', 'яйц', 'яйко'],
    'яйця': ['яєч', 'яйц', 'яйко'],
    // Бобові
    'квасоля': ['квасол', 'квасоль'],
    'сочевиця': ['сочевиц'],
    'нут': ['нут'],
    'горох': ['горох', 'горохов'],
    'соя': ['соя', 'соєв'],
    'тофу': ['тофу'],
    'едамаме': ['едамаме'],
    // Олії
    'олія': ['олі', 'олій'],
    // Борошно
    'борошно': ['борошн'],
    'крохмаль': ['крохмал'],
    // Соуси
    'кетчуп': ['кетчуп'],
    'майонез': ['майонез'],
    'гірчиця': ['гірчиц'],
    'хумус': ['хумус'],
    'песто': ['песто'],
    'соус': ['соус'],
    // Напої
    'кава': ['кав', 'кофе', 'кофей'],
    'чай': ['чай', 'чайн'],
    'сік': ['сік', 'сок', 'соков'],
    'какао': ['какао'],
    'смузі': ['смузі'],
    'лимонад': ['лимонад'],
    'компот': ['компот'],
    'квас': ['квас'],
    // Солодощі та кондитерка
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
    // Сухофрукти
    'курага': ['кураг'],
    'чорнослив': ['чорнослив'],
    'родзинки': ['родзинк'],
    'фініки': ['фінік'],
    // Готові страви
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
    // Снеки
    'чіпси': ['чіпс'],
    'попкорн': ['попкорн'],
    'гранола': ['гранол'],
    // Спортхарч
    'протеїн': ['протеїн', 'протеін'],
    'гейнер': ['гейнер'],
    'казеїн': ['казеїн', 'казеін'],
    'bcaa': ['bcaa'],
  };

  constructor(
    private prisma: PrismaService,
    private openFoodFacts: OpenFoodFactsService,
  ) {}

  /**
   * Get all search variants for a query — synonyms + stems.
   * "курка" → ["курка", "куряч", "курят", "курин", "курк", "куроч"]
   */
  private getSearchTerms(query: string): string[] {
    const words = query.toLowerCase().replace(/[^а-яїієґa-z0-9\s]/gi, '').split(/\s+/).filter(Boolean);
    const terms: string[] = [];

    for (const word of words) {
      terms.push(word);

      // Check synonym map
      const synonyms = this.synonymMap[word];
      if (synonyms) {
        terms.push(...synonyms);
      }

      // Also check if any synonym map KEY starts with this word (partial match)
      for (const [key, vals] of Object.entries(this.synonymMap)) {
        if (key.startsWith(word) && key !== word) {
          terms.push(...vals);
        }
      }

      // Simple stem: 60-70% of word, min 3 chars
      if (word.length >= 4) {
        const stemLen = Math.max(3, Math.floor(word.length * 0.6));
        terms.push(word.slice(0, stemLen));
      }
    }

    return [...new Set(terms)];
  }

  /**
   * Calculate trigram similarity between two strings (0-1).
   * Used as fallback for words not covered by synonym map.
   */
  private trigramSimilarity(a: string, b: string): number {
    const getTrigrams = (s: string): Set<string> => {
      const padded = `  ${s.toLowerCase()} `;
      const trigrams = new Set<string>();
      for (let i = 0; i < padded.length - 2; i++) {
        trigrams.add(padded.slice(i, i + 3));
      }
      return trigrams;
    };

    const triA = getTrigrams(a);
    const triB = getTrigrams(b);
    let intersection = 0;
    for (const t of triA) {
      if (triB.has(t)) intersection++;
    }
    const union = triA.size + triB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * Score how well a food matches the query. Higher = better match.
   * Returns 0 if not relevant at all.
   */
  private scoreFood(food: { name: string; brand?: string | null }, query: string): number {
    const qLower = query.toLowerCase().trim();
    const name = (food.name || '').toLowerCase();
    const brand = (food.brand || '').toLowerCase();
    let score = 0;

    // Exact name match → highest
    if (name === qLower) return 200;
    // Name starts with query
    if (name.startsWith(qLower)) score += 100;
    // Name contains full query
    if (name.includes(qLower)) score += 80;
    // Brand contains query
    if (brand.includes(qLower)) score += 40;

    // Get all search variants (synonyms + stems)
    const searchTerms = this.getSearchTerms(qLower);
    const nameWords = name.split(/\s+/);
    const allWords = `${name} ${brand}`.split(/\s+/);

    for (const term of searchTerms) {
      for (const word of allWords) {
        if (word === term) {
          score += 30;
        } else if (word.startsWith(term)) {
          score += 25;
        } else if (term.length >= 3 && word.includes(term)) {
          score += 10;
        }
      }
    }

    // Trigram similarity bonus (catches morphological variants not in synonym map)
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

  // Search foods — local DB + Open Food Facts in parallel, scored by relevance
  async search(query: string, limit: number = 20) {
    if (!query.trim()) {
      return this.prisma.food.findMany({
        take: limit,
        orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
      });
    }

    const searchTerms = this.getSearchTerms(query);

    // Build OR conditions — full query + all synonym/stem variants
    const orConditions: any[] = [
      { name: { contains: query, mode: 'insensitive' } },
      { brand: { contains: query, mode: 'insensitive' } },
    ];
    for (const term of searchTerms) {
      if (term.length >= 3) {
        orConditions.push({ name: { contains: term, mode: 'insensitive' } });
      }
    }

    // Run local DB and Open Food Facts in parallel
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

    // Score and filter local results
    const scoredLocal = localCandidates
      .map((food) => ({ food, score: this.scoreFood(food, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Score OFF results, keep only relevant, then save to DB
    const relevantOff = offResults
      .map((off) => ({ off, score: this.scoreFood(off, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const savedOffResults = await Promise.all(
      relevantOff.map(async ({ off, score }) => {
        try {
          if (off.barcode) {
            const existing = await this.prisma.food.findUnique({
              where: { barcode: off.barcode },
            });
            if (existing) return { food: existing, score: this.scoreFood(existing, query) };
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
        } catch {
          return null;
        }
      }),
    );

    // Combine, deduplicate, sort by score
    const validOff = savedOffResults.filter(
      (item): item is { food: any; score: number } => item !== null,
    );
    const allScored = [...scoredLocal, ...validOff];
    const seen = new Set<string>();
    const unique = allScored.filter((item) => {
      if (seen.has(item.food.id)) return false;
      seen.add(item.food.id);
      return true;
    });

    unique.sort((a, b) => b.score - a.score);
    return unique.slice(0, limit).map((item) => item.food);
  }

  // Get food by ID
  async getById(id: string) {
    const food = await this.prisma.food.findUnique({
      where: { id },
    });

    if (!food) {
      throw new NotFoundException('Продукт не знайдено');
    }

    return food;
  }

  // Get food by barcode - checks local DB first, then Open Food Facts
  async getByBarcode(barcode: string) {
    // First, check our local database
    const localFood = await this.prisma.food.findUnique({
      where: { barcode },
    });

    if (localFood) {
      return localFood;
    }

    // If not found locally, search Open Food Facts
    this.logger.log(`Barcode ${barcode} not in local DB, searching Open Food Facts...`);
    const offProduct = await this.openFoodFacts.getProductByBarcode(barcode);

    if (!offProduct) {
      throw new NotFoundException('Продукт не знайдено');
    }

    // Save the product to our database for future use
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
        isVerified: true, // Mark as verified since it comes from Open Food Facts
        source: 'openfoodfacts',
      },
    });

    this.logger.log(`Saved product from Open Food Facts: ${savedFood.name} (${barcode})`);
    return savedFood;
  }

  // Create custom food
  async create(userId: string, dto: CreateFoodDto) {
    return this.prisma.food.create({
      data: {
        ...dto,
        source: 'manual',
        createdByUserId: userId,
        isVerified: false,
      },
    });
  }

  // Get recent foods for user
  async getRecent(userId: string, limit: number = 10) {
    const recentMealFoods = await this.prisma.mealFood.findMany({
      where: {
        meal: { userId },
      },
      include: {
        food: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2, // Get more to dedupe
      distinct: ['foodId'],
    });

    return recentMealFoods.map(mf => mf.food).slice(0, limit);
  }

  // Get favorite foods
  async getFavorites(userId: string) {
    const favorites = await this.prisma.favoriteFood.findMany({
      where: { userId },
      include: { food: true },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map(f => f.food);
  }

  // Add to favorites
  async addToFavorites(userId: string, foodId: string) {
    // Check if food exists
    const food = await this.prisma.food.findUnique({ where: { id: foodId } });
    if (!food) {
      throw new NotFoundException('Продукт не знайдено');
    }

    // Check if already favorited
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

  // Remove from favorites
  async removeFromFavorites(userId: string, foodId: string) {
    await this.prisma.favoriteFood.deleteMany({
      where: { userId, foodId },
    });

    return { message: 'Видалено з улюблених' };
  }
}
