export type Category = "Seating" | "Lighting" | "Tables" | "Textiles" | "Ceramics";
export type Tone = "sage" | "butter" | "sky" | "sand" | "stone" | "blush";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  price: number;
  rating: number;
  reviews: number;
  tone: Tone;
  badge?: "Bestseller" | "New" | "Low stock";
  image: string;
  /** intrinsic image size, used to reserve space */
  w: number;
  h: number;
  /** how much of the tile the object should fill (0–1) */
  fit: number;
  /** pendant-style objects hang from the top of the tile */
  hang?: boolean;
  blurb: string;
  finishes: { name: string; color: string }[];
  details: string[];
  dimensions: string[];
  care: string[];
};

export const toneBg: Record<Tone, string> = {
  sage: "bg-sage",
  butter: "bg-butter",
  sky: "bg-sky",
  sand: "bg-sand",
  stone: "bg-stone",
  blush: "bg-blush",
};

export const seedCategories: { name: Category; tone: Tone; cover: string }[] = [
  { name: "Seating", tone: "sage", cover: "bolle-lounge-chair" },
  { name: "Lighting", tone: "butter", cover: "moln-pendant" },
  { name: "Tables", tone: "sand", cover: "pelare-side-table" },
  { name: "Textiles", tone: "blush", cover: "rand-wool-throw" },
  { name: "Ceramics", tone: "sky", cover: "dyn-vase" },
];


const img = (slug: string) => `/products/${slug}.webp`;

export const seedProducts: Product[] = [
  {
    slug: "bolle-lounge-chair",
    name: "Bolle Lounge Chair",
    category: "Seating",
    price: 890,
    rating: 4.9,
    reviews: 312,
    tone: "sage",
    badge: "Bestseller",
    image: img("bolle-lounge-chair"),
    w: 1200,
    h: 1048,
    fit: 0.8,
    blurb: "A deep, rounded lounge chair in wool bouclé over solid oak feet. Made to be sunk into, and to look better for it.",
    finishes: [
      { name: "Oat bouclé", color: "#e9e4d8" },
      { name: "Moss bouclé", color: "#a9b29a" },
    ],
    details: ["Wool-blend bouclé upholstery", "Solid oak feet, oiled", "Kiln-dried hardwood frame", "Feather-wrapped foam seat"],
    dimensions: ["Width 86 cm", "Depth 84 cm", "Height 74 cm", "Seat height 40 cm"],
    care: ["Vacuum with a soft brush", "Blot spills, don't rub", "Re-oil feet once a year"],
  },
  {
    slug: "linne-table-lamp",
    name: "Linne Table Lamp",
    category: "Lighting",
    price: 189,
    rating: 4.8,
    reviews: 204,
    tone: "butter",
    badge: "New",
    image: img("linne-table-lamp"),
    w: 627,
    h: 1102,
    fit: 0.72,
    blurb: "Hand-stitched linen shade over a turned oak base. Throws a warm, low pool of light for evenings that start early.",
    finishes: [
      { name: "Natural linen", color: "#ece6d6" },
      { name: "Sand linen", color: "#d9c4a3" },
    ],
    details: ["Stitched linen shade", "Turned solid oak base", "Dimmable E27, 2700K bulb included", "2 m braided cord"],
    dimensions: ["Height 46 cm", "Shade ⌀ 30 cm", "Base ⌀ 13 cm", "Weight 1.4 kg"],
    care: ["Dust the shade with a dry brush", "Wipe the base with a soft cloth", "Keep away from direct steam"],
  },
  {
    slug: "moln-pendant",
    name: "Moln Pendant",
    category: "Lighting",
    price: 249,
    rating: 4.7,
    reviews: 158,
    tone: "sky",
    image: img("moln-pendant"),
    w: 317,
    h: 465,
    fit: 0.78,
    hang: true,
    blurb: "A cloud of hand-woven cane that softens any bulb into an even, room-filling glow.",
    finishes: [
      { name: "Chalk", color: "#f1eee6" },
      { name: "Natural cane", color: "#d6bf95" },
    ],
    details: ["Hand-woven cane shade", "Powder-coated ceiling cup", "E27, bulb not included", "1.5 m adjustable cord"],
    dimensions: ["Shade ⌀ 52 cm", "Shade height 22 cm", "Cord 150 cm", "Weight 0.9 kg"],
    care: ["Dust with a feather duster", "Avoid damp rooms", "Do not exceed 40 W"],
  },
  {
    slug: "stubbe-stool",
    name: "Stubbe Stool",
    category: "Seating",
    price: 210,
    rating: 4.8,
    reviews: 121,
    tone: "sand",
    image: img("stubbe-stool"),
    w: 471,
    h: 704,
    fit: 0.76,
    blurb: "A three-legged stool turned from a single oak board. Seat, side table, step — whatever the day needs.",
    finishes: [
      { name: "Oiled oak", color: "#d2a56b" },
      { name: "Smoked oak", color: "#7a5a3c" },
    ],
    details: ["Solid European oak", "Wedged through-tenon legs", "Hard-wax oil finish", "Holds up to 140 kg"],
    dimensions: ["Height 46 cm", "Seat ⌀ 32 cm", "Footprint ⌀ 38 cm", "Weight 3.2 kg"],
    care: ["Wipe with a damp cloth", "Re-oil when the surface looks dry", "Small cracks are natural"],
  },
  {
    slug: "rygg-dining-chair",
    name: "Rygg Dining Chair",
    category: "Seating",
    price: 340,
    rating: 4.6,
    reviews: 87,
    tone: "stone",
    badge: "Low stock",
    image: img("rygg-dining-chair"),
    w: 908,
    h: 1200,
    fit: 0.78,
    blurb: "A light oak dining chair with a curved back that holds you through long dinners.",
    finishes: [
      { name: "Oiled oak", color: "#d2a56b" },
      { name: "Black ash", color: "#2b2a27" },
    ],
    details: ["Solid oak frame", "Steam-bent backrest", "Mortise and tenon joinery", "Felt glides included"],
    dimensions: ["Width 48 cm", "Depth 50 cm", "Height 78 cm", "Seat height 45 cm"],
    care: ["Wipe with a damp cloth", "Tighten fittings yearly", "Keep out of direct sun"],
  },
  {
    slug: "rand-wool-throw",
    name: "Rand Wool Throw",
    category: "Textiles",
    price: 129,
    rating: 4.9,
    reviews: 266,
    tone: "blush",
    image: img("rand-wool-throw"),
    w: 904,
    h: 554,
    fit: 0.78,
    blurb: "A heavy lambswool throw with a woven stripe and hand-knotted fringe. Warm from the first evening.",
    finishes: [
      { name: "Oat stripe", color: "#e6dfd0" },
      { name: "Slate stripe", color: "#8b8f8a" },
    ],
    details: ["100% lambswool", "Woven in Lithuania", "Hand-knotted fringe", "OEKO-TEX® certified yarn"],
    dimensions: ["130 × 180 cm", "Fringe 8 cm", "Weight 1.1 kg"],
    care: ["Air out instead of washing", "Hand wash cold when needed", "Dry flat, away from heat"],
  },
  {
    slug: "dyn-vase",
    name: "Dyn Vase",
    category: "Ceramics",
    price: 96,
    rating: 4.7,
    reviews: 143,
    tone: "sky",
    image: img("dyn-vase"),
    w: 602,
    h: 648,
    fit: 0.7,
    blurb: "A hand-built stoneware vase with a raw, chalky surface. Works just as well empty.",
    finishes: [
      { name: "Chalk", color: "#ece7da" },
      { name: "Clay", color: "#c9a887" },
    ],
    details: ["Hand-built stoneware", "Unglazed outside, glazed inside", "Watertight", "Each piece is slightly different"],
    dimensions: ["Height 28 cm", "Width 26 cm", "Opening ⌀ 4 cm"],
    care: ["Rinse by hand", "Not dishwasher safe", "Use a mat on delicate surfaces"],
  },
  {
    slug: "kon-floor-lamp",
    name: "Kon Floor Lamp",
    category: "Lighting",
    price: 420,
    rating: 4.8,
    reviews: 74,
    tone: "butter",
    image: img("kon-floor-lamp"),
    w: 441,
    h: 1032,
    fit: 0.84,
    blurb: "A tall turned-oak cone under a pleated shade. Reading light without the office feel.",
    finishes: [
      { name: "Natural oak", color: "#cf9b5c" },
      { name: "Dark oak", color: "#6f5137" },
    ],
    details: ["Solid oak stem", "Pleated cotton shade", "Foot dimmer on cord", "E27, 2700K bulb included"],
    dimensions: ["Height 142 cm", "Shade ⌀ 44 cm", "Base ⌀ 24 cm"],
    care: ["Dust the shade with a dry brush", "Wipe the stem with a soft cloth"],
  },
  {
    slug: "pelare-side-table",
    name: "Pelare Side Table",
    category: "Tables",
    price: 289,
    rating: 4.7,
    reviews: 96,
    tone: "sand",
    image: img("pelare-side-table"),
    w: 934,
    h: 1090,
    fit: 0.74,
    blurb: "A pedestal side table in solid oak. Small enough for anywhere, heavy enough to stay put.",
    finishes: [
      { name: "Oiled oak", color: "#d8a878" },
      { name: "Smoked oak", color: "#7a5a3c" },
    ],
    details: ["Solid oak top, stem and foot", "Hard-wax oil finish", "Arrives assembled"],
    dimensions: ["Height 50 cm", "Top ⌀ 42 cm", "Foot ⌀ 30 cm"],
    care: ["Use coasters for hot cups", "Wipe with a damp cloth", "Re-oil yearly"],
  },
  {
    slug: "lin-cushion",
    name: "Lin Cushion",
    category: "Textiles",
    price: 64,
    rating: 4.6,
    reviews: 188,
    tone: "blush",
    image: img("lin-cushion"),
    w: 645,
    h: 348,
    fit: 0.74,
    blurb: "Stonewashed linen with a frayed edge and a feather insert that keeps its shape.",
    finishes: [
      { name: "Natural", color: "#d9d1c0" },
      { name: "Clay", color: "#c39f86" },
    ],
    details: ["Stonewashed European linen", "Feather and down insert", "Hidden zip"],
    dimensions: ["35 × 60 cm", "Weight 0.6 kg"],
    care: ["Machine wash cover at 30°", "Line dry", "Iron while damp if you must"],
  },
  {
    slug: "kopp-mug",
    name: "Kopp Mug",
    category: "Ceramics",
    price: 28,
    rating: 4.9,
    reviews: 402,
    tone: "sky",
    image: img("kopp-mug"),
    w: 627,
    h: 377,
    fit: 0.66,
    blurb: "A wide, hand-thrown mug with a dipped glaze. Holds a proper amount of coffee.",
    finishes: [
      { name: "Milk", color: "#f1efe9" },
      { name: "Oat", color: "#dccfb8" },
    ],
    details: ["Hand-thrown stoneware", "Dipped glaze, raw foot", "350 ml"],
    dimensions: ["Height 8 cm", "⌀ 11 cm"],
    care: ["Dishwasher safe", "Microwave safe"],
  },
  {
    slug: "skal-bowl",
    name: "Skål Bowl",
    category: "Ceramics",
    price: 48,
    rating: 4.7,
    reviews: 119,
    tone: "stone",
    image: img("skal-bowl"),
    w: 323,
    h: 145,
    fit: 0.68,
    blurb: "A footed serving bowl in iron-rich clay with a matte glaze.",
    finishes: [
      { name: "Umber", color: "#8d8273" },
      { name: "Chalk", color: "#ece7da" },
    ],
    details: ["Hand-thrown stoneware", "Matte food-safe glaze", "Footed base"],
    dimensions: ["Height 9 cm", "⌀ 24 cm"],
    care: ["Dishwasher safe", "Avoid sudden temperature changes"],
  },
];

