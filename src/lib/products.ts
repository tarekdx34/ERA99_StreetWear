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
    id: "qutb-white-boxy",
    slug: "qutb-boxy-tee-white",
    name: "QUTB Boxy Tee",
    color: "White",
    price: 450,
    images: [
      "/images/1.jpeg",
      "/images/2.jpeg",
      "/images/3.jpeg",
      "/images/11.jpeg",
    ],
    description: {
      fabric: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
      fit: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
      care: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
    },
    stockBySize: { S: true, M: true, L: true, XL: true, XXL: false },
  },
  {
    id: "qutb-black-boxy",
    slug: "qutb-boxy-tee-black",
    name: "QUTB Boxy Tee",
    color: "Black",
    price: 450,
    images: [
      "/images/4.png",
      "/images/5.jpeg",
      "/images/6.jpeg",
      "/images/7.jpeg",
    ],
    description: {
      fabric: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
      fit: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
      care: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
    },
    stockBySize: { S: false, M: true, L: true, XL: true, XXL: true },
  },
  {
    id: "qutb-gray-boxy",
    slug: "qutb-boxy-tee-gray",
    name: "QUTB Boxy Tee",
    color: "Gray",
    price: 450,
    images: [
      "/images/10.jpeg",
      "/images/8.jpeg",
      "/images/9.jpeg",
      "/images/2.jpeg",
    ],
    description: {
      fabric: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
      fit: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
      care: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
    },
    stockBySize: { S: true, M: true, L: false, XL: true, XXL: true },
  },
  {
    id: "qutb-raw-white",
    slug: "qutb-raw-tee-white",
    name: "QUTB Raw Tee",
    color: "White",
    price: 520,
    images: [
      "/images/3.jpeg",
      "/images/1.jpeg",
      "/images/11.jpeg",
      "/images/2.jpeg",
    ],
    description: {
      fabric: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
      fit: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
      care: "220 GSM. Boxy. Built in Alexandria. This is QUTB.",
    },
    stockBySize: { S: true, M: true, L: true, XL: false, XXL: false },
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
