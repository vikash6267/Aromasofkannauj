
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1');

export const MONGODB_URL = "mongodb+srv://infoinextets:VWi8V6YTnxIgESpW@cluster0.3doac7y.mongodb.net/Perfume";
export const CLOUDINARY_CONFIG = {
  cloud_name: "dsvotvxhq",
  api_key: "886837389255772",
  api_secret: "aW_hpmUewFUAoQmLvfhaI7Aw12M",
  folder_name: "INEXT - PERFUME"
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "perfume-auth-token",
  CART: "perfume-cart",
  USER: "perfume-user"
};

export const PERFUME_NOTES = [
  "Floral",
  "Citrus",
  "Woody",
  "Oriental",
  "Fruity",
  "Green",
  "Aquatic",
  "Spicy",
  "Gourmand",
  "Musk"
];

export const GENDER_CATEGORIES = [
  "Men",
  "Women",
  "Unisex"
];

export const PERFUME_TYPES = [
  "Eau de Parfum",
  "Eau de Toilette",
  "Eau de Cologne",
  "Perfume Oil",
  "Body Mist"
];
