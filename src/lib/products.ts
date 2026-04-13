export type Product = {
  id: string;
  slug: string;
  name: string;
  color: string;
  price: number;
  compareAtPrice?: number;
  shortDescription?: string;
  images: string[];
  description: {
    fabric: string;
    fit: string;
    care: string;
  };
  stockBySize: Record<string, boolean>;
};

export const sizes = ["S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  {
    id: "era99-white-boxy",
    slug: "era99-boxy-tee-white",
    name: "ERA 99 Boxy Tee",
    color: "White",
    price: 450,
    images: [
      "/images/1.jpeg",
      "/images/2.jpeg",
      "/images/3.jpeg",
      "/images/11.jpeg",
    ],
    description: {
      fabric: "220 GSM. Boxy. Built in Alexandria. This is the era.",
      fit: "220 GSM. Boxy. Built in Alexandria. This is the era.",
      care: "220 GSM. Boxy. Built in Alexandria. This is the era.",
    },
    stockBySize: { S: true, M: true, L: true, XL: true, XXL: false },
  },
  {
    id: "era99-black-boxy",
    slug: "era99-boxy-tee-black",
    name: "ERA 99 Boxy Tee",
    color: "Black",
    price: 450,
    images: [
      "/images/4.png",
      "/images/5.jpeg",
      "/images/6.jpeg",
      "/images/7.jpeg",
    ],
    description: {
      fabric: "220 GSM. Boxy. Built in Alexandria. This is the era.",
      fit: "220 GSM. Boxy. Built in Alexandria. This is the era.",
      care: "220 GSM. Boxy. Built in Alexandria. This is the era.",
    },
    stockBySize: { S: false, M: true, L: true, XL: true, XXL: true },
  },
  {
    id: "era99-gray-boxy",
    slug: "era99-boxy-tee-gray",
    name: "ERA 99 Boxy Tee",
    color: "Gray",
    price: 450,
    images: [
      "/images/10.jpeg",
      "/images/8.jpeg",
      "/images/9.jpeg",
      "/images/2.jpeg",
    ],
    description: {
      fabric: "220 GSM. Boxy. Built in Alexandria. This is the era.",
      fit: "220 GSM. Boxy. Built in Alexandria. This is the era.",
      care: "220 GSM. Boxy. Built in Alexandria. This is the era.",
    },
    stockBySize: { S: true, M: true, L: false, XL: true, XXL: true },
  },
  {
    id: "era99-raw-white",
    slug: "era99-raw-tee-white",
    name: "ERA 99 Raw Tee",
    color: "White",
    price: 520,
    images: [
      "/images/3.jpeg",
      "/images/1.jpeg",
      "/images/11.jpeg",
      "/images/2.jpeg",
    ],
    description: {
      fabric: "220 GSM. Boxy. Built in Alexandria. This is the era.",
      fit: "220 GSM. Boxy. Built in Alexandria. This is the era.",
      care: "220 GSM. Boxy. Built in Alexandria. This is the era.",
    },
    stockBySize: { S: true, M: true, L: true, XL: false, XXL: false },
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
