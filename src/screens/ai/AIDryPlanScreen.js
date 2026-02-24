import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PremiumGate } from '../../components/PremiumGate';
import { useTranslation } from '../../i18n';
import { useAuthStore, useDiaryStore, useProgressStore, useChatStore, useDryPlanStore } from '../../store';

// ─── Activity coefficients ───────────────────────────────────────
const ACTIVITY_LEVELS = [
  { key: '1', coeff: 1.2 },
  { key: '2', coeff: 1.38 },
  { key: '3', coeff: 1.46 },
  { key: '4', coeff: 1.55 },
  { key: '5', coeff: 1.64 },
  { key: '6', coeff: 1.73 },
  { key: '7', coeff: 1.9 },
];

// ─── Data‑collection steps ───────────────────────────────────────
const STEP_SELECT_FIELD = -2; // Choose which field to update
const STEP_CONFIRM_PROFILE = -1; // Confirm or re-enter auto-filled profile data
const STEP_GENDER = 0;
const STEP_AGE = 1;
const STEP_HEIGHT = 2;
const STEP_WEIGHT = 3;
const STEP_ACTIVITY = 4;
const STEP_GOAL = 5;
const STEP_TARGET_W = 6;
const STEP_SAVE_PROFILE = 7; // Offer to save new data to profile
const STEP_DONE = 8;

// ═══════════════════════════════════════════════════════════════════
// ─── CONTENT CENSORSHIP ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const BANNED_WORDS = [
  // ── 1. Drugs / narcotics / controlled substances (US CSA + EU) ──
  'наркотик', 'марихуан', 'кокаїн', 'героїн', 'амфетамін', 'метамфетамін',
  'гашиш', 'екстазі', 'lsd', 'мдма', 'канабіс', 'опіат', 'опіоїд',
  'фентаніл', 'кодеїн', 'морфін', 'трамадол', 'барбітурат', 'бензодіазепін',
  'мефедрон', 'спайс', 'снаф', 'крек', 'мескалін', 'псилоциб', 'гхб', 'кетамін',
  'наркоман', 'нарколаб', 'закладк', 'наркодилер', 'нарколог',
  'cocaine', 'heroin', 'marijuana', 'amphetamine', 'methamphetamine', 'ecstasy',
  'cannabis', 'opiate', 'opioid', 'narcotic', 'drug abuse', 'fentanyl',
  'codeine', 'morphine', 'tramadol', 'barbiturate', 'benzodiazepine',
  'mephedrone', 'spice drug', 'crack', 'mescaline', 'psilocybin', 'ghb',
  'ketamine', 'drug dealer', 'drug lab',
  // ── 2. Alcohol ─────────────────────────────────────────────────
  'алкогол', 'горілк', 'пиво', 'вино', 'коньяк', 'віскі', 'абсент',
  'самогон', 'спиртн', 'похміл', 'бухл', 'запій', 'алкозалежн',
  'alcohol', 'vodka', 'whiskey', 'beer', 'wine', 'liquor', 'hangover',
  'drinking', 'binge drink', 'moonshine', 'booze',
  // ── 3. Pornography / sexual content / sexual services ──────────
  'порно', 'порнограф', 'xxx', 'хентай', 'hentai', 'еротик', 'еротичн',
  'стрип', 'стриптиз', 'секс', 'сексуальн', 'секс-послуг', 'інтим-послуг',
  'ескорт', 'проституц', 'проститутк', 'повії', 'борделі', 'бордел',
  'сутенер', 'масаж еротич', 'інтим', 'збочен', 'педофіл', 'зоофіл',
  'інцест', 'грумінг', 'сексуалізац', 'онліфанс', 'вебкам',
  'porn', 'pornograph', 'erotic', 'stripper', 'striptease', 'sexual',
  'sex service', 'escort service', 'prostitut', 'brothel', 'pimp',
  'erotic massage', 'intimat', 'perver', 'pedophil', 'zoophil',
  'incest', 'grooming', 'sexuali', 'onlyfans', 'webcam model',
  // ── 4. BDSM / fetish / kink ───────────────────────────────────
  'бдсм', 'bdsm', 'садомазохіз', 'sadomasoch', 'фетиш', 'fetish',
  'бондаж', 'bondage', 'домінац', 'домінатрикс', 'dominatrix',
  'сабміс', 'submissi',
  // ── 5. Tobacco & smoking ───────────────────────────────────────
  'сигарет', 'тютюн', 'вейп', 'кальян', 'нікотин', 'куріння', 'снюс',
  'cigarette', 'tobacco', 'vape', 'hookah', 'nicotine', 'smoking', 'snus',
  'e-cigarette', 'juul',
  // ── 6. Anabolic / performance-enhancing drugs ──────────────────
  'стероїд', 'анабол', 'тестостерон ін\'єкц', 'еритропоетин',
  'соматотропін', 'гормон росту ін\'єкц', 'тренболон', 'нандролон',
  'кленбутерол', 'днп', 'сибутрамін', 'ефедрин',
  'steroid', 'anabolic', 'erythropoietin', 'somatotropin', 'hgh injection',
  'trenbolone', 'nandrolone', 'clenbuterol', 'dnp', 'sibutramine', 'ephedrine',
  'допінг', 'doping',
  // ── 7. Self-harm / suicide ─────────────────────────────────────
  'суїцид', 'самогубств', 'самоушкодж', 'самокалічен', 'різати вени',
  'повісит', 'стрибнути з', 'отруїт себ', 'хочу померти', 'не хочу жити',
  'suicide', 'self-harm', 'self-injury', 'cut myself', 'kill myself',
  'want to die', 'end my life',
  // ── 8. Eating disorders (NEDA / EU clinical guidelines) ────────
  'анорексі', 'анорекси', 'булімі', 'булими', 'блювот', 'очищен',
  'проносн', 'проміван', 'як блювати', 'як не їсти', 'голодуван',
  'дієта 500 ккал', 'дієта 300', 'нульова дієта', 'водна дієта',
  'сушка небезпечн', 'як стати худ', 'худий ідеал', 'thinspo', 'тінспо',
  'прозак для схуд', 'діуретик для схуд',
  'anorexi', 'bulimi', 'purging', 'binge purge', 'pro-ana', 'pro-mia',
  'thinspo', 'bonespo', 'how to starve', 'water fast extreme',
  'zero calorie diet', 'laxative diet', 'how to vomit',
  // ── 9. Weapons / violence / terrorism ──────────────────────────
  'зброя', 'вибухівк', 'вибухов', 'бомб', 'терорис', 'терорист',
  'теракт', 'як зробити бомб', 'як вбити', 'насильств', 'катуванн',
  'weapon', 'explosive', 'bomb', 'terrorist', 'terrorism', 'how to kill',
  'violence', 'torture', 'firearm', 'gun', 'assault rifle',
  // ── 10. Gambling ───────────────────────────────────────────────
  'азартн', 'казино', 'ставк', 'букмекер', 'лотере', 'покер',
  'рулетк', 'слот машин', 'онлайн казино',
  'gambling', 'casino', 'betting', 'bookmaker', 'lottery', 'poker',
  'slot machine', 'online casino',
  // ── 11. Hate speech / discrimination ───────────────────────────
  'расизм', 'расист', 'нацизм', 'нацист', 'фашизм', 'фашист',
  'ксенофоб', 'гомофоб', 'антисеміт', 'шовініз', 'білий супремас',
  'racism', 'racist', 'nazism', 'nazi', 'fascism', 'fascist',
  'xenophob', 'homophob', 'antisemit', 'white supremac', 'hate speech',
  // ── 12. Dangerous medical misinformation ───────────────────────
  'відбілювач лікує', 'перекис пити', 'сечотерапі', 'уринотерапі',
  'антиваксер', 'антивакцин', 'чіп у вакцин', 'п\'яти джі',
  'bleach cure', 'drink peroxide', 'urine therapy', 'anti-vax',
  'antivaccin', 'chip in vaccine', '5g cause',
  // ── 13. Organ trafficking / black market ───────────────────────
  'продаж орган', 'купівля орган', 'купити орган', 'продати орган',
  'торгівля орган', 'чорний ринок', 'чорний ринок орган', 'нирк на продаж',
  'печінка на продаж', 'донор за гроші', 'нелегальна трансплантац',
  'контрабанд', 'торгівля людьм', 'трафікінг',
  'organ traffick', 'organ sale', 'sell organ', 'buy organ', 'organ trade',
  'black market organ', 'kidney for sale', 'liver for sale',
  'illegal transplant', 'human trafficking', 'black market', 'contraband',
  'organ harvest', 'organ broker',
  // ── 14. Money laundering / fraud / illegal finance ─────────────
  'відмиванн', 'відмивання грош', 'обмиванн', 'обмивання грош',
  'легалізація доход', 'легалізація кошт', 'тіньова економік',
  'тіньовий бізнес', 'незаконний обмін', 'обмін валют нелегал',
  'фальшив', 'фальшивомонетн', 'підробка грош', 'підробка документ',
  'шахрайств', 'афер', 'фінансова пірамід', 'понці схем',
  'ухилення від податк', 'офшор', 'криптовалютна схем',
  'хабар', 'корупц', 'розкрадан', 'крадіжк', 'розбій', 'вимаганн',
  'рекет', 'кіберзлочин', 'хакерств', 'фішинг', 'кардинг',
  'money launder', 'launder money', 'wash money', 'illegal exchange',
  'counterfeit', 'forgery', 'forged document', 'fraud', 'scam',
  'ponzi scheme', 'pyramid scheme', 'tax evasion', 'offshore scheme',
  'crypto scam', 'bribery', 'bribe', 'corruption', 'embezzlement',
  'extortion', 'racketeering', 'cybercrime', 'hacking', 'phishing',
  'carding', 'identity theft', 'dark web', 'darknet',
  // ── 15. Smuggling / illegal transportation ─────────────────────
  'контрабанд', 'незаконне перевезенн', 'нелегальне перевезенн',
  'нелегальний переті', 'перетин кордон нелегал', 'перевезення наркотик',
  'перевезення зброї', 'нелегальна міграц', 'переправлення людей',
  'каналі перевезенн', 'тунелі контрабанд',
  'smuggling', 'smuggle', 'illegal transport', 'illegal shipment',
  'illegal border crossing', 'drug trafficking', 'arms trafficking',
  'illegal immigration', 'people smuggling', 'smuggling tunnel',
  'illicit trade', 'illegal cargo',
  // ── 16. Bypass variants: Russian equivalents / slang / euphemisms ──
  // drugs (ru)
  'наркота', 'дурь', 'травка', 'косяк', 'ширка', 'план', 'кайф',
  'торчать', 'торчок', 'дунуть', 'вмазать', 'нюхать', 'колоться',
  'ширяться', 'баян', 'дозняк', 'приход', 'кумар', 'обдолбан',
  'обкурен', 'спидозн', 'нарик', 'вещества', 'хімія', 'хімка',
  'солі для ванн', 'bath salt',
  // alcohol (ru slang)
  'бухать', 'бухой', 'бухло', 'нажрать', 'квасит', 'синяк',
  'водяра', 'палёнк', 'спирт', 'настойк',
  // sexual (ru + euphemisms)
  'путан', 'шлюх', 'блядь', 'блять', 'шалав', 'давалк',
  'минет', 'отсос', 'трах', 'порнух', 'порнуш', 'порево',
  'разврат', 'извращен', 'содомі', 'содоми', 'оргі', 'оргия',
  'хуй', 'хуя', 'хуе', 'хуі', 'пизд', 'пізд', 'їбат', 'ебат',
  'єбан', 'їбан', 'ёбан', 'ебан', 'пиздец', 'піздець',
  'blowjob', 'handjob', 'orgy', 'orgasm', 'dildo', 'vibrator',
  'hookup', 'booty call', 'sugar daddy', 'sugar baby', 'nude',
  'nudes', 'dick pic', 'sexting', 'camgirl', 'chaturbate',
  // self-harm (ru + euphemisms)
  'суицид', 'покончить с собой', 'повеситься', 'вскрыть вены',
  'прыгнуть с крыш', 'отравиться', 'хочу умереть',
  'не хочу жить', 'порезать себ', 'нанести себе',
  // eating disorders (ru + euphemisms)
  'анорексия', 'булимия', 'блевать', 'как не есть', 'голодовка',
  'нулевая диета', 'диета 500', 'как стать худой', 'как похудеть быстро',
  'слабительн', 'мочегонн', 'рвотн',
  // weapons (ru)
  'оружие', 'пистолет', 'автомат', 'взрывчатк', 'как сделать бомб',
  'как убить', 'ножевое', 'холодное оружи',
  // hate (ru)
  'расизм', 'нацизм', 'фашизм', 'расист', 'нацист', 'фашист',
  'хохол', 'кацап', 'жид', 'нигер', 'негр', 'чурк', 'чучмек',
  'nigger', 'nigga', 'faggot', 'kike', 'spic', 'chink', 'slur',
  // abbrevations & coded
  'mdma', 'мдма', 'lsd', 'лсд', 'thc', 'тгк', 'cbd',
  'cp ', ' cp', 'csam', 'nsfw', 'r34', 'rule34', 'gore',
];

// ═══════════════════════════════════════════════════════════════════
// ─── TEXT NORMALIZATION (anti-bypass) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════

// Map of visually similar characters → canonical letter
const HOMOGLYPH_MAP = {
  // Cyrillic ↔ Latin lookalikes
  'а': 'a', 'о': 'o', 'е': 'e', 'і': 'i', 'у': 'y', 'р': 'p',
  'с': 'c', 'х': 'x', 'к': 'k', 'н': 'h', 'в': 'b', 'м': 'm',
  'т': 't',
  // Leetspeak numbers → letters
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't',
  '8': 'b', '9': 'g', '@': 'a',
  // Common symbol substitutions
  '$': 's', '!': 'i', '|': 'l', '+': 't',
};

const normalizeText = (text) => {
  let s = text.toLowerCase();

  // 1. Remove zero-width chars, invisible Unicode, diacritics combiner
  s = s.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/g, '');

  // 2. Replace common separators used to break words: dots, dashes,
  //    underscores, asterisks between letters  (п*о*р*н*о → порно)
  s = s.replace(/([a-zа-яіїєґ])[.\-_*•·~]+(?=[a-zа-яіїєґ])/gi, '$1');

  // 3. Collapse repeated spaces / whitespace between single chars
  //    (п о р н о → порно)
  s = s.replace(/(?<=^|[^a-zа-яіїєґ])([a-zа-яіїєґ])\s+(?=[a-zа-яіїєґ](?:\s|$|[^a-zа-яіїєґ]))/gi, '$1');
  // Simpler fallback: collapse all runs of 1–2 spaces inside letter sequences
  s = s.replace(/\s+/g, ' ');

  // 4. Apply homoglyph mapping (but only to produce a secondary check string)
  let normalized = '';
  for (const ch of s) {
    normalized += HOMOGLYPH_MAP[ch] || ch;
  }

  return { cleaned: s, normalized };
};

const containsBannedContent = (text) => {
  const { cleaned, normalized } = normalizeText(text);

  // Check both the cleaned original and the homoglyph-normalized version
  for (const variant of [cleaned, normalized]) {
    // Also check with all spaces removed (catches п о р н о, p o r n)
    const noSpaces = variant.replace(/\s/g, '');
    for (const w of BANNED_WORDS) {
      if (variant.includes(w) || noSpaces.includes(w)) return true;
    }
  }
  return false;
};

// ═══════════════════════════════════════════════════════════════════
// ─── WEEKLY MEAL PLAN GENERATOR ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Meal templates keyed by goal (each item: [nameKey, protein‑g, fat‑g, carb‑g, kcal])
const BREAKFAST_POOL = {
  loss: [
    ['oatmealBerries', 25, 8, 40, 330],
    ['eggWhiteOmelette', 30, 6, 10, 214],
    ['cottageCheeseFruit', 28, 5, 25, 257],
    ['buckwheatEgg', 22, 10, 35, 322],
    ['smoothieBowl', 20, 8, 45, 332],
    ['ryeBreadAvocado', 15, 14, 30, 306],
    ['yogurtGranola', 18, 7, 38, 287],
  ],
  gain: [
    ['oatmealBananaNuts', 22, 18, 60, 486],
    ['scrambledEggsBread', 30, 22, 35, 458],
    ['pancakesCottage', 28, 12, 55, 440],
    ['ricePuddingFruit', 18, 10, 65, 422],
    ['peanutButterToast', 24, 20, 45, 452],
    ['granolaYogurtHoney', 20, 15, 55, 435],
    ['cheeseOmeletteBread', 32, 24, 30, 464],
  ],
  dry: [
    ['eggWhiteVegetables', 32, 5, 8, 205],
    ['cottageCheeseLow', 35, 3, 10, 207],
    ['chickenBreastBuckwheat', 35, 6, 30, 318],
    ['tunaRiceCakes', 30, 4, 25, 260],
    ['proteinOatmeal', 35, 7, 30, 323],
    ['turkeyEggWhites', 38, 5, 8, 229],
    ['shrimpAvocado', 28, 12, 5, 244],
  ],
};

const LUNCH_POOL = {
  loss: [
    ['chickenRiceSalad', 35, 10, 45, 410],
    ['fishVegetables', 32, 12, 20, 316],
    ['turkeyBuckwheat', 38, 8, 35, 364],
    ['lentilSoup', 22, 6, 42, 310],
    ['shrimpPasta', 28, 10, 48, 394],
    ['beefStirFry', 35, 14, 30, 386],
    ['chickenWrap', 30, 12, 35, 368],
  ],
  gain: [
    ['chickenRiceBroccoli', 42, 14, 65, 554],
    ['beefPastaVeg', 40, 18, 60, 564],
    ['salmonPotatoSalad', 38, 22, 50, 546],
    ['turkeyRiceVeg', 45, 12, 60, 532],
    ['meatballsPasta', 38, 20, 58, 564],
    ['chickenCurryRice', 40, 18, 62, 574],
    ['porkLoinPotato', 42, 16, 55, 532],
  ],
  dry: [
    ['chickenBreastVeg', 42, 6, 12, 270],
    ['fishSteamBroccoli', 38, 8, 10, 264],
    ['turkeyZucchini', 40, 7, 15, 283],
    ['shrimpSalad', 35, 8, 8, 244],
    ['codAsparagus', 36, 5, 10, 229],
    ['chickenStirFryVeg', 40, 8, 14, 288],
    ['tunaSalad', 38, 6, 8, 238],
  ],
};

const DINNER_POOL = {
  loss: [
    ['fishSteamVeg', 30, 8, 15, 252],
    ['cottageCheeseSalad', 25, 6, 12, 202],
    ['chickenSoupLight', 28, 7, 18, 247],
    ['turkeyVegetable', 32, 8, 14, 256],
    ['omeletteVeg', 22, 12, 8, 228],
    ['shrimpZucchini', 28, 6, 10, 206],
    ['bakedCodSalad', 30, 5, 12, 213],
  ],
  gain: [
    ['salmonRiceVeg', 38, 20, 45, 508],
    ['beefBuckwheatSalad', 40, 16, 40, 464],
    ['chickenPastaVeg', 35, 14, 50, 470],
    ['porkStewPotato', 35, 18, 42, 470],
    ['fishRiceSpinach', 36, 14, 48, 462],
    ['turkeyQuinoaVeg', 38, 12, 44, 436],
    ['meatLoafPotato', 36, 18, 45, 486],
  ],
  dry: [
    ['fishSteamGreens', 35, 5, 6, 209],
    ['chickenBroccoli', 38, 6, 8, 238],
    ['turkeySpinach', 36, 5, 7, 217],
    ['eggWhiteSalad', 30, 4, 5, 176],
    ['shrimpCucumber', 32, 4, 5, 184],
    ['codGreenBeans', 34, 4, 8, 204],
    ['turkeyAsparagus', 36, 5, 6, 213],
  ],
};

const SNACK_POOL = {
  loss: [
    ['apple', 0, 0, 25, 100],
    ['greekYogurt', 15, 3, 8, 119],
    ['almonds20', 5, 10, 4, 126],
    ['proteinBar', 20, 6, 18, 206],
  ],
  gain: [
    ['bananaProtein', 25, 5, 35, 285],
    ['nutsTrailMix', 8, 18, 20, 274],
    ['proteinShake', 30, 5, 15, 225],
    ['peanutButterBanana', 12, 16, 30, 308],
  ],
  dry: [
    ['proteinShakeLow', 28, 2, 3, 142],
    ['celeryAlmond', 4, 8, 3, 100],
    ['eggWhiteSnack', 18, 1, 0, 81],
    ['cucumberCottage', 12, 2, 4, 82],
  ],
};

// ─── Minimum daily kcal floor ────────────────────────────────────
const MIN_DAILY_KCAL = 1200;

// Calorie distribution across meal slots (must sum to 1.0)
const SLOT_RATIO = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 };

// Scale a meal template [name, p, f, c, k] to a target kcal budget
const scaleMealToSlot = (template, targetKcal) => {
  const [nameKey, baseP, baseF, baseC, baseK] = template;
  if (baseK <= 0) return { nameKey, p: 0, f: 0, c: 0, k: 0 };
  const factor = targetKcal / baseK;
  const p = Math.round(baseP * factor);
  const f = Math.round(baseF * factor);
  const c = Math.round(baseC * factor);
  const k = p * 4 + f * 9 + c * 4; // recalc from rounded macros
  return { nameKey, p, f, c, k };
};

// ─── Progressive drying restriction helpers ──────────────────────
// Each week tightens calories & shifts macros (more protein, less carbs/fats)
const getDryCoefficient = (weekNumber = 1) => {
  // Week 1: 0.8462 (-15.38%), Week 2: -16.9%, Week 3: -18.4%, … floor at 0.75 (-25%)
  const base = 0.8462;
  const step = 0.015;
  const floor = 0.75;
  return Math.max(base - step * Math.max((weekNumber || 1) - 1, 0), floor);
};

const getDryMacroRatios = (weekNumber = 1) => {
  // Week 1: P40/F30/C30 → progressively: more protein, less carbs & fats
  const w = Math.max((weekNumber || 1) - 1, 0);
  const pRatio = Math.min(0.40 + 0.025 * w, 0.50); // max 50% protein
  const fRatio = Math.max(0.30 - 0.015 * w, 0.20); // min 20% fat
  const cRatio = 1.0 - pRatio - fRatio;              // remainder to carbs (min ~30%)
  return { pRatio, fRatio, cRatio: Math.max(cRatio, 0.15) };
};

// Meals considered "sugary" / high-carb — excluded progressively
const HIGH_CARB_MEAL_KEYS = [
  'oatmealBerries', 'oatmealBananaNuts', 'smoothieBowl', 'yogurtGranola',
  'granolaYogurtHoney', 'ricePuddingFruit', 'pancakesCottage',
  'peanutButterToast', 'peanutButterBanana', 'bananaProtein',
  'ryeBreadAvocado', 'scrambledEggsBread', 'cheeseOmeletteBread',
  'shrimpPasta', 'chickenCurryRice', 'meatballsPasta',
];

// Filter out high-carb meals based on week (week 1 = no filter, week 2+ progressive)
const filterPoolByWeek = (pool, weekNumber) => {
  if (!weekNumber || weekNumber <= 1) return pool;
  // Each week eliminates more meals: week 2 = first 4, week 3 = first 8, etc.
  const eliminateCount = Math.min((weekNumber - 1) * 4, HIGH_CARB_MEAL_KEYS.length);
  const banned = new Set(HIGH_CARB_MEAL_KEYS.slice(0, eliminateCount));
  const filtered = pool.filter(item => !banned.has(item[0]));
  // Always keep at least 2 items
  return filtered.length >= 2 ? filtered : pool.slice(0, 2);
};

// Shared calorie goal (with 1200 floor)
const calcGoalKcal = (maintenance, goal, weekNumber) => {
  let raw = maintenance;
  if (goal === 'loss')      raw = Math.round(maintenance * 0.825);
  else if (goal === 'gain') raw = Math.round(maintenance * 1.185);
  else                      raw = Math.round(maintenance * getDryCoefficient(weekNumber));
  return { raw, floored: Math.max(raw, MIN_DAILY_KCAL) };
};

// Shared macro targets from goalKcal
const calcMacroTargets = (goalKcal, goal, weekNumber) => {
  if (goal === 'gain') {
    return {
      p: Math.round((goalKcal * 0.30) / 4),
      f: Math.round((goalKcal * 0.25) / 9),
      c: Math.round((goalKcal * 0.45) / 4),
    };
  }
  if (goal === 'dry' && weekNumber && weekNumber > 1) {
    const { pRatio, fRatio, cRatio } = getDryMacroRatios(weekNumber);
    return {
      p: Math.round((goalKcal * pRatio) / 4),
      f: Math.round((goalKcal * fRatio) / 9),
      c: Math.round((goalKcal * cRatio) / 4),
    };
  }
  return {
    p: Math.round((goalKcal * 0.40) / 4),
    f: Math.round((goalKcal * 0.30) / 9),
    c: Math.round((goalKcal * 0.30) / 4),
  };
};

const generateWeeklyMealPlan = (data, t, weekNumber) => {
  const { gender, age, height, weight, activityCoeff, goal } = data;
  const isFemale = gender === 'female';

  // ── Calculate precise KBJU targets ─────────────────────────
  const maintenance = calcMaintenanceKcal(weight, height, age, isFemale, activityCoeff);
  const { floored: goalKcal } = calcGoalKcal(maintenance, goal, weekNumber);
  const targets = calcMacroTargets(goalKcal, goal, weekNumber);

  const goalKey = goal === 'loss' ? 'loss' : goal === 'gain' ? 'gain' : 'dry';

  // Apply progressive filtering for dry goal
  const breakfasts = filterPoolByWeek([...BREAKFAST_POOL[goalKey]], weekNumber);
  const lunches    = filterPoolByWeek([...LUNCH_POOL[goalKey]], weekNumber);
  const dinners    = filterPoolByWeek([...DINNER_POOL[goalKey]], weekNumber);
  const snacks     = filterPoolByWeek([...SNACK_POOL[goalKey]], weekNumber);

  // Kcal budget per slot
  const bfKcal = Math.round(goalKcal * SLOT_RATIO.breakfast);
  const luKcal = Math.round(goalKcal * SLOT_RATIO.lunch);
  const dnKcal = Math.round(goalKcal * SLOT_RATIO.dinner);
  const snKcal = goalKcal - bfKcal - luKcal - dnKcal; // remainder → exact total

  const days = WEEKDAYS.map((wd, i) => {
    const bfMeal = scaleMealToSlot(breakfasts[i % breakfasts.length], bfKcal);
    const luMeal = scaleMealToSlot(lunches[i % lunches.length],       luKcal);
    const dnMeal = scaleMealToSlot(dinners[i % dinners.length],       dnKcal);
    const snMeal = scaleMealToSlot(snacks[i % snacks.length],         snKcal);

    const totalP = bfMeal.p + luMeal.p + dnMeal.p + snMeal.p;
    const totalF = bfMeal.f + luMeal.f + dnMeal.f + snMeal.f;
    const totalC = bfMeal.c + luMeal.c + dnMeal.c + snMeal.c;
    const totalK = bfMeal.k + luMeal.k + dnMeal.k + snMeal.k;

    return {
      dayKey: wd,
      meals: [
        { type: 'breakfast', ...bfMeal },
        { type: 'lunch',     ...luMeal },
        { type: 'dinner',    ...dnMeal },
        { type: 'snack',     ...snMeal },
      ],
      totals: { k: totalK, p: totalP, f: totalF, c: totalC },
    };
  });

  return days;
};

// ═══════════════════════════════════════════════════════════════════
// ─── SMART Q&A ENGINE (health / nutrition topics) ────────────────
// ═══════════════════════════════════════════════════════════════════

const HEALTH_QA_RULES = [
  // ─── БАДи / supplements ─────────────────────────────────────
  {
    match: ['бад', 'добавк', 'supplement', 'вітамін', 'vitamin', 'мультивітамін'],
    answerKey: 'qaSupplements',
  },
  // ─── БЖУ ratio ──────────────────────────────────────────────
  {
    match: ['бжу', 'білк', 'жир', 'вуглевод', 'protein', 'fat', 'carb', 'макронутрієнт', 'макро', 'macronutrient', 'macro'],
    answerKey: 'qaMacros',
  },
  // ─── Micro‑nutrients ────────────────────────────────────────
  {
    match: ['мікро', 'мінерал', 'кальцій', 'магній', 'залізо', 'цинк', 'калій', 'натрій', 'micro', 'mineral', 'calcium', 'magnesium', 'iron', 'zinc', 'potassium', 'sodium'],
    answerKey: 'qaMicro',
  },
  // ─── Water ──────────────────────────────────────────────────
  {
    match: ['вод', 'водн', 'water', 'питн', 'гідрат'],
    answerKey: 'qaWater',
  },
  // ─── Protein specifics ─────────────────────────────────────
  {
    match: ['протеїн', 'whey', 'казеїн', 'casein', 'ізолят', 'isolate'],
    answerKey: 'qaProteinSupp',
  },
  // ─── Omega / fish oil ──────────────────────────────────────
  {
    match: ['омега', 'omega', 'риб\'яч', 'fish oil'],
    answerKey: 'qaOmega',
  },
  // ─── Creatine ──────────────────────────────────────────────
  {
    match: ['креатин', 'creatine'],
    answerKey: 'qaCreatine',
  },
  // ─── Meal timing / frequency ───────────────────────────────
  {
    match: ['скільки раз', 'частот', 'часто їсти', 'інтервальн', 'meal timing', 'how often', 'intermittent'],
    answerKey: 'qaMealTiming',
  },
  // ─── Calorie questions ─────────────────────────────────────
  {
    match: ['калорі', 'ккал', 'calorie', 'kcal', 'дефіцит', 'профіцит', 'deficit', 'surplus'],
    answerKey: 'qaCalories',
  },
  // ─── Plateau ───────────────────────────────────────────────
  {
    match: ['плато', 'plateau', 'застій', 'не худну', 'вага стоїть'],
    answerKey: 'qaPlateau',
  },
  // ─── Sleep & recovery ──────────────────────────────────────
  {
    match: ['сон', 'sleep', 'відновлен', 'recovery', 'недосипан'],
    answerKey: 'qaSleep',
  },
  // ─── Menu correction intent ────────────────────────────────
  {
    match: ['замін', 'змін', 'не хочу', 'не їм', 'алерг', 'непереносим', 'вегетар', 'веган',
            'без молок', 'без глютен', 'без м\'яса', 'без риби', 'без яєць',
            'replace', 'change', 'swap', 'allergy', 'intolerance', 'vegetarian', 'vegan',
            'dairy-free', 'gluten-free', 'корект', 'коригуват', 'підлаштуват', 'перезроби', 'інше меню'],
    answerKey: '__CORRECTION__',   // special token — handled in code
  },
];

const findQAAnswer = (text) => {
  const lower = text.toLowerCase();
  for (const rule of HEALTH_QA_RULES) {
    if (rule.match.some(kw => lower.includes(kw))) {
      return rule.answerKey;
    }
  }
  return null;
};

// ═══════════════════════════════════════════════════════════════════
// ─── MENU CORRECTION ENGINE ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

// Replacement pools for correcting specific meals
const REPLACEMENT_MAP = {
  // If user doesn't eat fish → chicken
  fish: 'chicken',
  // If user doesn't eat meat → fish or legumes
  meat: 'fishOrLegumes',
  // If user doesn't eat dairy → plant-based
  dairy: 'plantBased',
  // If user doesn't eat eggs → other protein
  eggs: 'otherProtein',
};

const FISH_KEYWORDS = ['риб', 'лосось', 'тун', 'форель', 'тріск', 'креветк', 'cod', 'fish', 'salmon', 'tuna', 'shrimp'];
const MEAT_KEYWORDS = ['м\'яс', 'курк', 'куряч', 'індич', 'яловичин', 'свинин', 'beef', 'pork', 'chicken', 'turkey', 'meat'];
const DAIRY_KEYWORDS = ['молок', 'сир', 'творог', 'йогурт', 'вершк', 'кефір', 'dairy', 'cheese', 'yogurt', 'milk', 'cottage'];
const EGG_KEYWORDS = ['яйц', 'яєц', 'омлет', 'egg', 'omelette'];

const detectExclusion = (text) => {
  const lower = text.toLowerCase();
  const exclusions = [];
  if (FISH_KEYWORDS.some(k => lower.includes(k)))  exclusions.push('fish');
  if (MEAT_KEYWORDS.some(k => lower.includes(k)))   exclusions.push('meat');
  if (DAIRY_KEYWORDS.some(k => lower.includes(k)))  exclusions.push('dairy');
  if (EGG_KEYWORDS.some(k => lower.includes(k)))    exclusions.push('eggs');
  return exclusions;
};

// Alternative meals for replacements
const ALTERNATIVES = {
  fish: {
    breakfast: ['chickenBreastBuckwheat', 35, 6, 30, 318],
    lunch: ['turkeyZucchini', 40, 7, 15, 283],
    dinner: ['chickenBroccoli', 38, 6, 8, 238],
    snack: ['proteinShakeLow', 28, 2, 3, 142],
  },
  meat: {
    breakfast: ['cottageCheeseFruit', 28, 5, 25, 257],
    lunch: ['lentilSoup', 22, 6, 42, 310],
    dinner: ['fishSteamVeg', 30, 8, 15, 252],
    snack: ['greekYogurt', 15, 3, 8, 119],
  },
  dairy: {
    breakfast: ['oatmealBerries', 25, 8, 40, 330],
    lunch: ['chickenRiceSalad', 35, 10, 45, 410],
    dinner: ['fishSteamGreens', 35, 5, 6, 209],
    snack: ['almonds20', 5, 10, 4, 126],
  },
  eggs: {
    breakfast: ['oatmealBerries', 25, 8, 40, 330],
    lunch: ['chickenRiceSalad', 35, 10, 45, 410],
    dinner: ['fishSteamVeg', 30, 8, 15, 252],
    snack: ['proteinBar', 20, 6, 18, 206],
  },
};

const applyCorrections = (currentPlan, exclusions, t) => {
  if (!currentPlan || exclusions.length === 0) return currentPlan;

  const mealContainsExcluded = (nameKey, excl) => {
    const lower = t(`meals.${nameKey}`).toLowerCase();
    const keywords = excl === 'fish' ? FISH_KEYWORDS
      : excl === 'meat' ? MEAT_KEYWORDS
      : excl === 'dairy' ? DAIRY_KEYWORDS
      : EGG_KEYWORDS;
    return keywords.some(k => lower.includes(k));
  };

  return currentPlan.map(day => {
    const newMeals = day.meals.map(meal => {
      for (const excl of exclusions) {
        if (mealContainsExcluded(meal.nameKey, excl)) {
          const alt = ALTERNATIVES[excl]?.[meal.type];
          if (alt) {
            // Scale replacement to same kcal budget the slot had
            const scaled = scaleMealToSlot(alt, meal.k);
            return { ...meal, ...scaled };
          }
        }
      }
      return meal;
    });

    const totals = newMeals.reduce((acc, m) => ({
      k: acc.k + m.k, p: acc.p + m.p, f: acc.f + m.f, c: acc.c + m.c,
    }), { k: 0, p: 0, f: 0, c: 0 });

    return { ...day, meals: newMeals, totals };
  });
};

// ─── BMI helpers ─────────────────────────────────────────────────
const calcBMI = (weightKg, heightCm) => weightKg / ((heightCm / 100) ** 2);
const bmiCategory = (bmi, t) => {
  if (bmi < 16)   return t('aiDryPlan.bmiSevereThin');
  if (bmi < 17)   return t('aiDryPlan.bmiModerateThin');
  if (bmi < 17.59) return t('aiDryPlan.bmiMildThin');
  if (bmi < 25)   return t('aiDryPlan.bmiNormal');
  if (bmi < 30)   return t('aiDryPlan.bmiOverweight');
  if (bmi < 35)   return t('aiDryPlan.bmiObese1');
  if (bmi < 40)   return t('aiDryPlan.bmiObese2');
  return t('aiDryPlan.bmiObese3');
};

const normalWeightRange = (heightCm) => {
  const hm = heightCm / 100;
  return { min: Math.round(17.59 * hm * hm * 10) / 10, max: Math.round(24.9 * hm * hm * 10) / 10 };
};

const calcMaintenanceKcal = (weightKg, heightCm, ageYears, isFemale, activityCoeff) => {
  const base = (weightKg * 10) + (heightCm * 6.25) - (ageYears * 5) + (isFemale ? -161 : 5);
  return Math.round(base * activityCoeff);
};

// ─── Risk analysis generator ─────────────────────────────────────
const generateAnalysis = (data, t, weekNumber) => {
  const { gender, age, height, weight, activityCoeff, goal, targetWeight } = data;
  const isFemale = gender === 'female';
  const bmi = calcBMI(weight, height);
  const bmiCat = bmiCategory(bmi, t);
  const { min: normMin, max: normMax } = normalWeightRange(height);
  const maintenance = calcMaintenanceKcal(weight, height, age, isFemale, activityCoeff);

  // ── Goal kcal with 1200‑floor ──────────────────────────────
  const { raw: rawKcal, floored: goalKcal } = calcGoalKcal(maintenance, goal, weekNumber);
  const wasFloored = rawKcal < MIN_DAILY_KCAL;
  const goalLabel = goal === 'loss' ? t('aiDryPlan.goalLoss')
    : goal === 'gain' ? t('aiDryPlan.goalGain')
    : t('aiDryPlan.goalDry');

  // ── Macro targets (calculated from floored goalKcal) ───────
  const { p: proteinG, f: fatG, c: carbG } = calcMacroTargets(goalKcal, goal, weekNumber);

  // ── Sections ──────────────────────────────────────────────────
  const sections = [];

  // 1. Current status
  sections.push({
    icon: '📊',
    title: t('aiDryPlan.sectionStatus'),
    lines: [
      `${t('aiDryPlan.yourBMI')}: ${bmi.toFixed(1)} — ${bmiCat}`,
      `${t('aiDryPlan.normalRange')}: ${normMin} – ${normMax} ${t('units.kg')}`,
      weight < normMin
        ? `⚠️ ${t('aiDryPlan.underweight')}`
        : weight > normMax
          ? `⚠️ ${t('aiDryPlan.overweight')}`
          : `✅ ${t('aiDryPlan.weightOk')}`,
    ],
  });

  // 2. Calorie plan
  const calLines = [
    `${t('aiDryPlan.maintenanceKcal')}: ${maintenance} ${t('diary.kcal')}`,
    `${goalLabel}: ${goalKcal} ${t('diary.kcal')}`,
    `${t('aiDryPlan.proteinShort')}: ${proteinG}${t('units.g')} | ${t('aiDryPlan.fatsShort')}: ${fatG}${t('units.g')} | ${t('aiDryPlan.carbsShort')}: ${carbG}${t('units.g')}`,
  ];
  if (wasFloored) {
    calLines.push(`⚠️ ${t('aiDryPlan.kcalFloorWarning')} (${rawKcal} → ${MIN_DAILY_KCAL} ${t('diary.kcal')})`);
  }
  sections.push({
    icon: '🔥',
    title: t('aiDryPlan.sectionCalories'),
    lines: calLines,
  });

  // 3. Target weight validation
  if (targetWeight) {
    const tw = parseFloat(targetWeight);
    const lines = [];
    if (tw < normMin) {
      lines.push(`⛔ ${t('aiDryPlan.targetBelowNorm')} (${normMin} ${t('units.kg')})`);
      lines.push(t('aiDryPlan.targetBelowWarn'));
    } else if (tw > normMax) {
      lines.push(`⛔ ${t('aiDryPlan.targetAboveNorm')} (${normMax} ${t('units.kg')})`);
    } else {
      lines.push(`✅ ${t('aiDryPlan.targetOk')} (${tw} ${t('units.kg')})`);
      const diff = weight - tw;
      if (diff > 0) {
        const weeks = Math.round(diff / 0.5);
        lines.push(`${t('aiDryPlan.estimatedTime')}: ~${weeks} ${t('aiDryPlan.weeks')}`);
      } else if (diff < 0) {
        const weeks = Math.round(Math.abs(diff) / 0.3);
        lines.push(`${t('aiDryPlan.estimatedTime')}: ~${weeks} ${t('aiDryPlan.weeks')}`);
      }
    }
    sections.push({ icon: '🎯', title: t('aiDryPlan.sectionTarget'), lines });
  }

  // 4. Risks
  const risks = [];

  // Plateau
  if (goal !== 'gain') {
    risks.push(`⚠️ ${t('aiDryPlan.riskPlateau')}`);
    if (bmi >= 25) risks.push(`   ${t('aiDryPlan.riskPlateauHigh')}`);
    else if (bmi < 20) risks.push(`   ${t('aiDryPlan.riskPlateauLow')}`);
  }

  // Avitaminosis
  if (goal === 'dry' || goal === 'loss') {
    risks.push(`⚠️ ${t('aiDryPlan.riskAvitaminosis')}`);
  }

  // Acetonemic tendency
  if (goal === 'dry') {
    risks.push(`⚠️ ${t('aiDryPlan.riskAcetonemia')}`);
  }

  // Exhaustion (use raw kcal before floor for risk detection)
  if (rawKcal < 1200 && isFemale) {
    risks.push(`🔴 ${t('aiDryPlan.riskExhaustionF')}`);
  } else if (rawKcal < 1500 && !isFemale) {
    risks.push(`🔴 ${t('aiDryPlan.riskExhaustionM')}`);
  }

  // Joint fragility
  if (goal === 'dry' && bmi < 20) {
    risks.push(`⚠️ ${t('aiDryPlan.riskJoints')}`);
  }

  // Macro / micro deficiency
  if (goalKcal < 1600) {
    risks.push(`⚠️ ${t('aiDryPlan.riskMicroDef')}`);
  }

  // Protein
  if (proteinG < 0.8 * weight) {
    risks.push(`⚠️ ${t('aiDryPlan.riskProteinLow')}`);
  }
  if (proteinG > 2.5 * weight) {
    risks.push(`⚠️ ${t('aiDryPlan.riskProteinHigh')}`);
  }

  // Women‑only: menstrual cycle loss
  if (isFemale) {
    const minSafeWeight = Math.round(17.59 * ((height / 100) ** 2) * 10) / 10;
    const criticalBf = 17; // ~17 % body fat threshold
    risks.push(`🔴 ${t('aiDryPlan.riskMenstrual')}`);
    risks.push(`   ${t('aiDryPlan.riskMenstrualMin')}: ${minSafeWeight} ${t('units.kg')} (BMI 17.59)`);
    risks.push(`   ${t('aiDryPlan.riskMenstrualBf')}: ~${criticalBf}%`);
  }

  if (risks.length > 0) {
    sections.push({ icon: '⚠️', title: t('aiDryPlan.sectionRisks'), lines: risks });
  }

  // 5. Recommendations
  const recs = [];
  recs.push(`💧 ${t('aiDryPlan.recWater')}`);
  recs.push(`🥗 ${t('aiDryPlan.recVegetables')}`);
  if (goal === 'dry' || goal === 'loss') {
    recs.push(`💊 ${t('aiDryPlan.recVitamins')}`);
    recs.push(`🧂 ${t('aiDryPlan.recElectrolytes')}`);
  }
  if (goal === 'dry') {
    recs.push(`🥩 ${t('aiDryPlan.recProtein')}`);
  }
  recs.push(`😴 ${t('aiDryPlan.recSleep')}`);
  recs.push(`📝 ${t('aiDryPlan.recTracking')}`);
  sections.push({ icon: '💡', title: t('aiDryPlan.sectionRecs'), lines: recs });

  return sections;
};

// ─── UI Components ───────────────────────────────────────────────

const Message = ({ isUser, text, children, t }) => (
  <View style={[styles.message, isUser && styles.messageUser]}>
    <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAI]}>
      <Text style={styles.avatarText}>{isUser ? t('aiDryPlan.me') : 'AI'}</Text>
    </View>
    <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAI]}>
      {text && <Text style={styles.messageText}>{text}</Text>}
      {children}
    </View>
  </View>
);

const AnalysisCard = ({ sections }) => (
  <View style={styles.analysisContainer}>
    {sections.map((sec, i) => (
      <View key={i} style={styles.analysisSection}>
        <Text style={styles.analysisSectionTitle}>{sec.icon} {sec.title}</Text>
        {sec.lines.map((line, j) => (
          <Text key={j} style={[
            styles.analysisLine,
            line.startsWith('🔴') && styles.analysisLineDanger,
            line.startsWith('⚠️') && styles.analysisLineWarning,
            line.startsWith('✅') && styles.analysisLineOk,
            line.startsWith('⛔') && styles.analysisLineDanger,
          ]}>{line}</Text>
        ))}
      </View>
    ))}
  </View>
);

const ApplyKBJUCard = ({ data, applied, applying, t, onApply }) => (
  <View style={styles.applyContainer}>
    <Text style={styles.applyQuestion}>{t('aiDryPlan.applyQuestion')}</Text>
    <Text style={styles.applyWarning}>{t('aiDryPlan.applyWarning')}</Text>
    <Text style={styles.applyValues}>
      {t('diary.kcal')}: {data.calories}  |  {t('aiDryPlan.proteinShort')}: {data.protein}{t('units.g')}  |  {t('aiDryPlan.fatsShort')}: {data.fats}{t('units.g')}  |  {t('aiDryPlan.carbsShort')}: {data.carbs}{t('units.g')}
    </Text>
    {applied ? (
      <View style={styles.applyDoneWrap}>
        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
        <Text style={styles.applyDoneText}>{t('aiDryPlan.applyDone')}</Text>
      </View>
    ) : (
      <TouchableOpacity
        style={[styles.applyButton, applying && styles.applyButtonDisabled]}
        onPress={onApply}
        disabled={applying}
        activeOpacity={0.7}
      >
        {applying
          ? <ActivityIndicator size="small" color={Colors.dark} />
          : <Text style={styles.applyButtonText}>{t('aiDryPlan.applyBtn')}</Text>
        }
      </TouchableOpacity>
    )}
  </View>
);

const MealPlanCard = ({ plan, t }) => (
  <View style={styles.mealPlanContainer}>
    {plan.map((day, di) => (
      <View key={di} style={styles.dayCard}>
        <Text style={styles.dayCardTitle}>{t(`weekdays.${day.dayKey}`).toUpperCase()}</Text>
        {day.meals.map((meal, mi) => (
          <View key={mi} style={styles.mealRow}>
            <Text style={styles.mealType}>{t(`mealTypes.${meal.type}`)}</Text>
            <Text style={styles.mealName}>{t(`meals.${meal.nameKey}`)}</Text>
            <Text style={styles.mealMacro}>
              {meal.k} {t('diary.kcal')} | {t('aiDryPlan.proteinShort')}{meal.p} | {t('aiDryPlan.fatsShort')}{meal.f} | {t('aiDryPlan.carbsShort')}{meal.c}
            </Text>
          </View>
        ))}
        <View style={styles.dayTotalRow}>
          <Text style={styles.dayTotalText}>
            Σ {day.totals.k} {t('diary.kcal')} | {t('aiDryPlan.proteinShort')}: {day.totals.p}{t('units.g')} | {t('aiDryPlan.fatsShort')}: {day.totals.f}{t('units.g')} | {t('aiDryPlan.carbsShort')}: {day.totals.c}{t('units.g')}
          </Text>
        </View>
      </View>
    ))}
  </View>
);

const OptionButtons = ({ options, onSelect }) => (
  <View style={styles.optionsWrap}>
    {options.map((opt, i) => (
      <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => onSelect(opt.value, opt.label)}>
        <Text style={styles.optionBtnText}>{opt.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────

export const AIDryPlanScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  // Chat persistence
  const { createConversation, loadConversation, saveMessages: saveChat } = useChatStore();
  const conversationIdRef = useRef(route?.params?.conversationId || null);
  const saveTimerRef = useRef(null);

  // Collection state
  const [step, setStep] = useState(STEP_GENDER);
  const [userData, setUserData] = useState({
    gender: null, age: null, height: null, weight: null,
    activityCoeff: null, goal: null, targetWeight: null,
  });

  // Which single field is being edited (null = all fields / normal flow)
  const [editingField, setEditingField] = useState(null);
  // Track whether user manually changed profile data (for save prompt)
  const [dataChanged, setDataChanged] = useState(false);
  // Store original profile data for comparison
  const [originalProfileData, setOriginalProfileData] = useState(null);
  // Saving profile state
  const [savingProfile, setSavingProfile] = useState(false);

  // Current meal plan (can be corrected)
  const [currentMealPlan, setCurrentMealPlan] = useState(null);

  // Store for applying KBJU goals
  const { updateGoals, updateProfile, fetchProfile, error: storeError } = useAuthStore();
  const { fetchDay } = useDiaryStore();
  const { addWeight, fetchWeightHistory } = useProgressStore();
  const { markUpdated: markDryPlanUpdated, weekNumber: dryWeekNumber, activate: activateDryPlan } = useDryPlanStore();
  const [applyingGoals, setApplyingGoals] = useState(false);

  // Auto-update flag from navigation params (weekly reminder)
  const autoUpdate = route?.params?.autoUpdate || false;
  const autoUpdateWeek = route?.params?.autoUpdateWeek || null;

  // Auto-save messages (debounced)
  const debouncedSave = useCallback((msgs) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (conversationIdRef.current && msgs.length > 0) {
        const title = t('ai.dryPlanTitle');
        saveChat(conversationIdRef.current, msgs, title);
      }
    }, 1500);
  }, [saveChat, t]);

  // Save whenever messages change
  useEffect(() => {
    if (initialized && messages.length > 0) {
      debouncedSave(messages);
    }
  }, [messages, initialized, debouncedSave]);

  // Helper: push AI message after delay
  const pushAI = (content, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, ...(Array.isArray(content) ? content : [content])]);
    }, delay);
  };

  // ── Initialization ────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) {
      const init = async () => {
        // Load existing conversation if ID given
        if (conversationIdRef.current) {
          const loaded = await loadConversation(conversationIdRef.current);
          if (loaded && loaded.length > 0) {
            setMessages(loaded);
            setStep(STEP_DONE);
            setInitialized(true);
            return;
          }
        }

        // Create new conversation
        if (!conversationIdRef.current) {
          const newId = await createConversation('dry_plan');
          if (newId) conversationIdRef.current = newId;
        }

        // Try to load user profile data
        let profile = null;
        try {
          profile = await fetchProfile();
        } catch (e) {}

        const hasGender = profile?.gender;
        const hasBirth = profile?.birthDate;
        const hasHeight = profile?.height;
        const hasWeight = profile?.currentWeight;

        if (hasGender && hasBirth && hasHeight && hasWeight) {
          // Calculate age from birthDate
          const birth = new Date(profile.birthDate);
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

          const gender = profile.gender === 'MALE' ? 'male' : 'female';
          const genderLabel = gender === 'male' ? t('aiDryPlan.male') : t('aiDryPlan.female');
          const height = profile.height;
          const weight = profile.currentWeight;

          const fullUserData = { gender, age, height, weight, targetWeight: profile.targetWeight || null };
          setUserData(prev => ({ ...prev, ...fullUserData }));
          setOriginalProfileData({ gender, age, height, weight, targetWeight: profile.targetWeight || null, birthDate: profile.birthDate });

          // ── Auto-update from weekly reminder ──────────────
          if (autoUpdate) {
            const weekNum = autoUpdateWeek || (dryWeekNumber + 1) || 2;
            // Use default activity coefficient if not set (moderate activity)
            const actCoeff = profile.activityLevel
              ? (ACTIVITY_LEVELS.find(a => a.key === String(profile.activityLevel))?.coeff || 1.46)
              : 1.46;
            const autoData = {
              ...fullUserData,
              activityCoeff: actCoeff,
              goal: 'dry',
            };
            setUserData(autoData);

            setMessages([
              { isUser: false, text: `🔄 ${t('aiDryPlan.autoUpdateMessage')}` },
              { isUser: true, text: t('aiDryPlan.updatePlan') },
            ]);
            setInitialized(true);

            // Mark dry plan as updated in store
            markDryPlanUpdated();

            // Generate results with progressive restriction after a short delay
            setTimeout(() => {
              generateResults(autoData, weekNum);
            }, 500);
            return;
          }

          setStep(STEP_CONFIRM_PROFILE);

          setMessages([
            { isUser: false, text: t('aiDryPlan.greeting') },
            { isUser: false, text: `${t('aiDryPlan.profileAutoFill')}:\n• ${t('aiDryPlan.askGender')}: ${genderLabel}\n• ${t('aiDryPlan.askAge')}: ${age}\n• ${t('aiDryPlan.askHeight')}: ${height} ${t('units.cm')}\n• ${t('aiDryPlan.askWeight')}: ${weight} ${t('units.kg')}` },
            { isUser: false, text: t('aiDryPlan.confirmProfilePrompt'), options: [
                { label: t('aiDryPlan.confirmProfileYes'), value: 'confirm' },
                { label: t('aiDryPlan.confirmProfileNo'), value: 'update' },
              ]},
          ]);
        } else {
          // No profile data — ask all questions
          setMessages([
            { isUser: false, text: t('aiDryPlan.greeting') },
            { isUser: false, text: t('aiDryPlan.askGender'), options: [
                { label: t('aiDryPlan.male'), value: 'male' },
                { label: t('aiDryPlan.female'), value: 'female' },
              ]},
          ]);
        }
        setInitialized(true);
      };
      init();
    }
  }, [t, initialized]);

  // ── Scroll to bottom ─────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  // ── Activity level options ────────────────────────────────────
  const activityOptions = () => ACTIVITY_LEVELS.map(a => ({
    label: t(`aiDryPlan.activity_${a.key}`),
    value: a.coeff,
  }));

  const goalOptions = () => [
    { label: t('aiDryPlan.goalLoss'), value: 'loss' },
    { label: t('aiDryPlan.goalGain'), value: 'gain' },
    { label: t('aiDryPlan.goalDry'), value: 'dry' },
  ];

  // ── Handle STEP_DONE Q&A (with censorship + health topics + correction) ──
  const handleDoneMessage = (userText) => {
    // 1. Censorship check
    if (containsBannedContent(userText)) {
      pushAI({ isUser: false, text: t('aiDryPlan.censorWarning') });
      return;
    }

    // 2. Check if user wants to correct menu
    const qaKey = findQAAnswer(userText);
    if (qaKey === '__CORRECTION__') {
      const exclusions = detectExclusion(userText);
      if (exclusions.length > 0 && currentMealPlan) {
        const corrected = applyCorrections(currentMealPlan, exclusions, t);
        setCurrentMealPlan(corrected);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            { isUser: false, text: t('aiDryPlan.menuCorrected') },
            { isUser: false, mealPlan: corrected },
            { isUser: false, text: t('aiDryPlan.menuCorrectedFooter') },
          ]);
        }, 1500);
      } else {
        pushAI({ isUser: false, text: t('aiDryPlan.correctionHint') });
      }
      return;
    }

    // 3. Health / nutrition Q&A
    if (qaKey) {
      pushAI({ isUser: false, text: t(`aiDryPlan.${qaKey}`) }, 1200);
      return;
    }

    // 4. Generic on-topic response
    pushAI({ isUser: false, text: t('aiDryPlan.responseHint') });
  };

  // ── Process an answer from the user ───────────────────────────
  const processAnswer = async (value, displayText) => {
    setMessages(prev => [...prev, { isUser: true, text: displayText }]);

    // Censorship at every step (for free-text input)
    if (typeof value === 'string' && containsBannedContent(value)) {
      pushAI({ isUser: false, text: t('aiDryPlan.censorWarning') });
      return;
    }

    switch (step) {
      case STEP_CONFIRM_PROFILE:
        if (value === 'confirm') {
          // User confirmed profile data — proceed to activity
          setDataChanged(false);
          pushAI({ isUser: false, text: t('aiDryPlan.askActivity'), options: activityOptions() });
          setStep(STEP_ACTIVITY);
        } else {
          // Ask what exactly the user wants to change
          setDataChanged(true);
          pushAI({ isUser: false, text: t('aiDryPlan.selectFieldPrompt'), options: [
            { label: `⚖️ ${t('aiDryPlan.fieldWeight')}`, value: 'weight' },
            { label: `📏 ${t('aiDryPlan.fieldHeight')}`, value: 'height' },
            { label: `👤 ${t('aiDryPlan.fieldGender')}`, value: 'gender' },
            { label: `🎂 ${t('aiDryPlan.fieldAge')}`, value: 'age' },
            { label: `🔄 ${t('aiDryPlan.fieldAll')}`, value: 'all' },
          ]});
          setStep(STEP_SELECT_FIELD);
        }
        break;

      case STEP_SELECT_FIELD:
        if (value === 'all') {
          // Reset all and restart from gender
          setEditingField(null);
          setUserData({ gender: null, age: null, height: null, weight: null, activityCoeff: null, goal: null, targetWeight: null });
          pushAI({ isUser: false, text: t('aiDryPlan.askGender'), options: [
            { label: t('aiDryPlan.male'), value: 'male' },
            { label: t('aiDryPlan.female'), value: 'female' },
          ]});
          setStep(STEP_GENDER);
        } else if (value === 'gender') {
          setEditingField('gender');
          pushAI({ isUser: false, text: t('aiDryPlan.askGender'), options: [
            { label: t('aiDryPlan.male'), value: 'male' },
            { label: t('aiDryPlan.female'), value: 'female' },
          ]});
          setStep(STEP_GENDER);
        } else if (value === 'age') {
          setEditingField('age');
          pushAI({ isUser: false, text: t('aiDryPlan.askAge') });
          setStep(STEP_AGE);
        } else if (value === 'height') {
          setEditingField('height');
          pushAI({ isUser: false, text: t('aiDryPlan.askHeight') });
          setStep(STEP_HEIGHT);
        } else if (value === 'weight') {
          setEditingField('weight');
          pushAI({ isUser: false, text: t('aiDryPlan.askWeight') });
          setStep(STEP_WEIGHT);
        }
        break;

      case STEP_GENDER:
        setUserData(prev => ({ ...prev, gender: value }));
        if (editingField === 'gender') {
          setEditingField(null);
          pushAI({ isUser: false, text: t('aiDryPlan.askActivity'), options: activityOptions() });
          setStep(STEP_ACTIVITY);
        } else {
          pushAI({ isUser: false, text: t('aiDryPlan.askAge') });
          setStep(STEP_AGE);
        }
        break;

      case STEP_AGE: {
        const age = parseInt(value, 10);
        if (isNaN(age) || age < 14 || age > 100) {
          pushAI({ isUser: false, text: t('aiDryPlan.invalidAge') });
          return;
        }
        setUserData(prev => ({ ...prev, age }));
        if (editingField === 'age') {
          setEditingField(null);
          pushAI({ isUser: false, text: t('aiDryPlan.askActivity'), options: activityOptions() });
          setStep(STEP_ACTIVITY);
        } else {
          pushAI({ isUser: false, text: t('aiDryPlan.askHeight') });
          setStep(STEP_HEIGHT);
        }
        break;
      }

      case STEP_HEIGHT: {
        const h = parseFloat(value);
        if (isNaN(h) || h < 100 || h > 250) {
          pushAI({ isUser: false, text: t('aiDryPlan.invalidHeight') });
          return;
        }
        setUserData(prev => ({ ...prev, height: h }));
        if (editingField === 'height') {
          setEditingField(null);
          pushAI({ isUser: false, text: t('aiDryPlan.askActivity'), options: activityOptions() });
          setStep(STEP_ACTIVITY);
        } else {
          pushAI({ isUser: false, text: t('aiDryPlan.askWeight') });
          setStep(STEP_WEIGHT);
        }
        break;
      }

      case STEP_WEIGHT: {
        const w = parseFloat(value);
        if (isNaN(w) || w < 30 || w > 300) {
          pushAI({ isUser: false, text: t('aiDryPlan.invalidWeight') });
          return;
        }
        setUserData(prev => ({ ...prev, weight: w }));
        if (editingField === 'weight') {
          setEditingField(null);
        }
        pushAI({ isUser: false, text: t('aiDryPlan.askActivity'), options: activityOptions() });
        setStep(STEP_ACTIVITY);
        break;
      }

      case STEP_ACTIVITY:
        setUserData(prev => ({ ...prev, activityCoeff: value }));
        pushAI({ isUser: false, text: t('aiDryPlan.askGoal'), options: goalOptions() });
        setStep(STEP_GOAL);
        break;

      case STEP_GOAL:
        setUserData(prev => ({ ...prev, goal: value }));
        pushAI({ isUser: false, text: t('aiDryPlan.askTargetWeight'), options: [{ label: t('aiDryPlan.skipTarget'), value: 'skip' }] });
        setStep(STEP_TARGET_W);
        break;

      case STEP_TARGET_W: {
        const final = { ...userData };
        if (value !== 'skip') {
          const tw = parseFloat(value);
          if (isNaN(tw) || tw < 30 || tw > 300) {
            pushAI({ isUser: false, text: t('aiDryPlan.invalidWeight') });
            return;
          }
          const { min: normMin, max: normMax } = normalWeightRange(final.height || userData.height);
          if (tw < normMin || tw > normMax) {
            pushAI({ isUser: false, text: `${t('aiDryPlan.targetOutOfRange')} (${normMin} – ${normMax} ${t('units.kg')}). ${t('aiDryPlan.enterValidTarget')}` });
            return;
          }
          final.targetWeight = tw;
        }
        final.gender = final.gender || userData.gender;
        final.age = final.age || userData.age;
        final.height = final.height || userData.height;
        final.weight = final.weight || userData.weight;
        final.activityCoeff = final.activityCoeff || userData.activityCoeff;
        final.goal = final.goal || userData.goal;

        setUserData(final);

        // If user changed data from profile OR entered a new target weight → offer to save
        const targetChanged = final.targetWeight && originalProfileData && originalProfileData.targetWeight !== final.targetWeight;
        if ((dataChanged || targetChanged) && originalProfileData) {
          setStep(STEP_SAVE_PROFILE);
          const changes = [];
          if (originalProfileData.gender !== final.gender) {
            changes.push(`• ${t('aiDryPlan.askGender')}: ${originalProfileData.gender === 'male' ? t('aiDryPlan.male') : t('aiDryPlan.female')} → ${final.gender === 'male' ? t('aiDryPlan.male') : t('aiDryPlan.female')}`);
          }
          if (originalProfileData.age !== final.age) {
            changes.push(`• ${t('aiDryPlan.askAge')}: ${originalProfileData.age} → ${final.age}`);
          }
          if (originalProfileData.height !== final.height) {
            changes.push(`• ${t('aiDryPlan.askHeight')}: ${originalProfileData.height} → ${final.height} ${t('units.cm')}`);
          }
          if (originalProfileData.weight !== final.weight) {
            changes.push(`• ${t('aiDryPlan.askWeight')}: ${originalProfileData.weight} → ${final.weight} ${t('units.kg')}`);
          }
          if (final.targetWeight && originalProfileData.targetWeight !== final.targetWeight) {
            changes.push(`• ${t('profile.targetWeight')}: ${originalProfileData.targetWeight || '-'} → ${final.targetWeight} ${t('units.kg')}`);
          }
          const changesList = changes.length > 0 ? `\n${changes.join('\n')}` : '';
          pushAI([
            { isUser: false, text: `${t('aiDryPlan.saveProfilePrompt')}${changesList}` },
            { isUser: false, text: t('aiDryPlan.saveProfileWarning'), options: [
              { label: t('aiDryPlan.saveProfileYes'), value: 'save' },
              { label: t('aiDryPlan.saveProfileNo'), value: 'skip' },
            ]},
          ]);
        } else {
          // No changes — generate results immediately
          if (final.goal === 'dry') activateDryPlan();
          generateResults(final);
        }
        break;
      }

      case STEP_SAVE_PROFILE: {
        if (value === 'save') {
          // Save new data to profile
          setSavingProfile(true);
          setIsTyping(true);
          try {
            // Always send all current user data to ensure profile gets updated
            const profileUpdate = {
              gender: userData.gender === 'male' ? 'MALE' : 'FEMALE',
              height: userData.height,
              currentWeight: userData.weight,
            };
            // Calculate birthDate from age
            if (userData.age) {
              const today = new Date();
              const birthYear = today.getFullYear() - userData.age;
              const newBirthDate = new Date(birthYear, today.getMonth(), today.getDate());
              profileUpdate.birthDate = newBirthDate.toISOString();
            }
            // Include target weight if entered
            if (userData.targetWeight) {
              profileUpdate.targetWeight = userData.targetWeight;
            }
            const ok = await updateProfile(profileUpdate);
            // If weight changed, also add a weight entry so charts update
            if (ok && profileUpdate.currentWeight) {
              try {
                await addWeight(profileUpdate.currentWeight);
              } catch (_) { /* best-effort */ }
            }
            setSavingProfile(false);
            setIsTyping(false);
            if (ok) {
              setMessages(prev => [...prev, { isUser: false, text: `✅ ${t('aiDryPlan.saveProfileDone')}` }]);
            } else {
              setMessages(prev => [...prev, { isUser: false, text: `⚠️ ${t('aiDryPlan.saveProfileError')}` }]);
            }
          } catch (e) {
            setSavingProfile(false);
            setIsTyping(false);
            setMessages(prev => [...prev, { isUser: false, text: `⚠️ ${t('aiDryPlan.saveProfileError')}` }]);
          }
        } else {
          // User declined saving — just inform
          pushAI({ isUser: false, text: t('aiDryPlan.saveProfileSkipped') }, 400);
        }
        // Generate results after save prompt (with delay to let save message show)
        setTimeout(() => {
          if (userData.goal === 'dry') activateDryPlan();
          generateResults(userData);
        }, value === 'save' ? 600 : 1200);
        break;
      }

      case STEP_DONE:
        handleDoneMessage(displayText);
        break;

      default: break;
    }
  };

  // ── Generate analysis + meal plan results ─────────────────────
  const generateResults = (finalData, weekNum) => {
    const wn = weekNum || 1;
    setStep(STEP_DONE);
    setIsTyping(true);
    setTimeout(() => {
      const sections = generateAnalysis(finalData, t, wn);
      const mealPlan = generateWeeklyMealPlan(finalData, t, wn);
      setCurrentMealPlan(mealPlan);

      // Calculate KBJU for the apply prompt
      const isFem = finalData.gender === 'female';
      const maint = calcMaintenanceKcal(finalData.weight, finalData.height, finalData.age, isFem, finalData.activityCoeff);
      const { floored: gKcal } = calcGoalKcal(maint, finalData.goal, wn);
      const { p, f, c } = calcMacroTargets(gKcal, finalData.goal, wn);

      // Build result messages
      const resultMessages = [];
      // If this is a weekly update (week 2+), show week info
      if (wn > 1) {
        resultMessages.push({ isUser: false, text: `📅 ${t('aiDryPlan.weeklyUpdateTitle')} — ${t('aiDryPlan.weekLabel')} ${wn}` });
        resultMessages.push({ isUser: false, text: t('aiDryPlan.weeklyUpdateDesc') });
      }
      resultMessages.push(
        { isUser: false, text: t('aiDryPlan.analysisIntro') },
        { isUser: false, analysis: sections },
        { isUser: false, text: t('aiDryPlan.mealPlanIntro') },
        { isUser: false, mealPlan },
        { isUser: false, applyKBJU: { calories: gKcal, protein: p, fats: f, carbs: c } },
        { isUser: false, text: t('aiDryPlan.analysisFooter') },
      );

      setIsTyping(false);
      setMessages(prev => [...prev, ...resultMessages]);
    }, 2000);
  };

  // ── Send from text input ──────────────────────────────────────
  const handleSend = () => {
    const txt = inputText.trim();
    if (!txt) return;
    setInputText('');
    processAnswer(txt, txt);
  };

  const showTextInput = [STEP_AGE, STEP_HEIGHT, STEP_WEIGHT, STEP_TARGET_W, STEP_DONE].includes(step);

  return (
    <PremiumGate feature={t('ai.dryPlan')}>
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('aiDryPlan.title')}</Text>
        <View style={{ width: 42 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContent}
          contentContainerStyle={styles.chatContentInner}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, idx) => (
            <React.Fragment key={idx}>
              <Message isUser={msg.isUser} text={msg.text} t={t}>
                {msg.analysis && <AnalysisCard sections={msg.analysis} />}
                {msg.mealPlan && <MealPlanCard plan={msg.mealPlan} t={t} />}
                {msg.applyKBJU && (
                  <ApplyKBJUCard
                    data={msg.applyKBJU}
                    applied={msg.applied}
                    applying={applyingGoals}
                    t={t}
                    onApply={async () => {
                      setApplyingGoals(true);
                      try {
                        const ok = await updateGoals({
                          calorieGoal: msg.applyKBJU.calories,
                          proteinGoal: msg.applyKBJU.protein,
                          fatsGoal: msg.applyKBJU.fats,
                          carbsGoal: msg.applyKBJU.carbs,
                        });
                        setApplyingGoals(false);
                        if (ok) {
                          setMessages(prev => prev.map((m, i) => i === idx ? { ...m, applied: true } : m));
                          // Refresh both stores so Goals page & Diary see new KBJU
                          fetchProfile();
                          fetchDay();
                        } else {
                          const errMsg = useAuthStore.getState().error;
                          Alert.alert(t('common.error'), errMsg || t('aiDryPlan.applyError'));
                        }
                      } catch (e) {
                        setApplyingGoals(false);
                        Alert.alert(t('common.error'), e?.message || t('aiDryPlan.applyError'));
                      }
                    }}
                  />
                )}
              </Message>
              {msg.options && !msg.isUser && (
                <OptionButtons
                  options={msg.options}
                  onSelect={(val, label) => {
                    setMessages(prev => prev.map((m, i) => i === idx ? { ...m, options: null } : m));
                    processAnswer(val, label);
                  }}
                />
              )}
            </React.Fragment>
          ))}

          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={[styles.avatar, styles.avatarAI]}>
                <Text style={styles.avatarText}>AI</Text>
              </View>
              <View style={styles.typingDots}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>{t('aiDryPlan.aiTyping')}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {showTextInput && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('aiDryPlan.messagePlaceholder')}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              keyboardType={step === STEP_DONE ? 'default' : 'numeric'}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color={inputText.trim() ? Colors.dark : 'rgba(0,0,0,0.3)'} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
    </PremiumGate>
  );
};

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 23, paddingVertical: 15,
  },
  backButton: {
    width: 42, height: 42, backgroundColor: 'rgba(244,244,244,0.1)',
    borderRadius: 21, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '500', color: Colors.white, textTransform: 'uppercase' },
  chatContainer: { flex: 1 },
  chatContent: { flex: 1, paddingHorizontal: 23 },
  chatContentInner: { paddingBottom: 20, gap: 15 },
  message: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  messageUser: { flexDirection: 'row-reverse' },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarUser: { backgroundColor: '#4A90E2' },
  avatarAI: { backgroundColor: 'rgba(187, 224, 255, 0.2)', borderWidth: 1, borderColor: '#BBE0FF' },
  avatarText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  messageBubbleUser: { backgroundColor: 'rgba(187, 224, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(187, 224, 255, 0.3)' },
  messageBubbleAI: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  messageText: { fontSize: 14, color: Colors.white, lineHeight: 20 },
  // Options
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 42, marginTop: -4 },
  optionBtn: {
    backgroundColor: 'rgba(187, 224, 255, 0.15)', borderWidth: 1,
    borderColor: Colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
  },
  optionBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  // Analysis card
  analysisContainer: { marginTop: 8, gap: 14 },
  analysisSection: { backgroundColor: 'rgba(187, 224, 255, 0.05)', borderRadius: 10, padding: 12 },
  analysisSectionTitle: { fontSize: 15, fontWeight: '600', color: '#BBE0FF', marginBottom: 6 },
  analysisLine: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginBottom: 2 },
  analysisLineDanger: { color: '#FF6B6B' },
  analysisLineWarning: { color: '#FFD93D' },
  analysisLineOk: { color: '#4CAF50' },
  // Meal plan card
  mealPlanContainer: { marginTop: 8, gap: 12 },
  dayCard: { backgroundColor: 'rgba(187, 224, 255, 0.05)', borderRadius: 10, padding: 12 },
  dayCardTitle: { fontSize: 14, fontWeight: '700', color: '#BBE0FF', marginBottom: 8 },
  mealRow: { marginBottom: 8, paddingLeft: 4 },
  mealType: { fontSize: 11, fontWeight: '600', color: 'rgba(187,224,255,0.6)', textTransform: 'uppercase', marginBottom: 1 },
  mealName: { fontSize: 13, color: Colors.white, fontWeight: '500' },
  mealMacro: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  dayTotalRow: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 6, marginTop: 4 },
  dayTotalText: { fontSize: 12, color: 'rgba(187,224,255,0.8)', fontWeight: '500' },
  // Typing
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  // Input
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 23,
    paddingVertical: 12, gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.white, maxHeight: 100,
  },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: 'rgba(187, 224, 255, 0.3)' },
  // Apply KBJU card
  applyContainer: { marginTop: 12, backgroundColor: 'rgba(187, 224, 255, 0.08)', borderRadius: 12, padding: 14, gap: 10 },
  applyQuestion: { fontSize: 14, fontWeight: '600', color: Colors.white, lineHeight: 20 },
  applyWarning: { fontSize: 12, color: '#FFD93D', lineHeight: 18 },
  applyValues: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
  applyButton: {
    backgroundColor: Colors.primary, borderRadius: 22, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  applyButtonDisabled: { opacity: 0.5 },
  applyButtonText: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  applyDoneWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  applyDoneText: { fontSize: 13, color: '#4CAF50', fontWeight: '500' },
});
