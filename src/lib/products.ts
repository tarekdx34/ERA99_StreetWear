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
      fabric:
        "220GSM heavyweight cotton jersey with enzyme wash for a broken-in feel.",
      fit: "Cropped oversized boxy silhouette with dropped shoulders and reinforced neck rib.",
      care: "Wash cold inside-out, no tumble dry, hang in shade, cool iron on reverse only.",
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
      fabric:
        "220GSM heavyweight combed cotton, low-shine finish, structured drape.",
      fit: "Wide body, cropped length, clean shoulder seam for sharp silhouette.",
      care: "Machine wash cold with dark colors, dry flat, avoid bleach.",
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
      fabric: "220GSM garment-dyed cotton with soft structured handfeel.",
      fit: "Oversized chest and sleeve block with cropped hemline.",
      care: "Cold wash, no direct sun drying, iron low heat.",
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
      fabric: "Dense loopback cotton knit with raw finish details.",
      fit: "Relaxed body with slightly shorter torso for layered looks.",
      care: "Hand wash preferred, reshape while damp, line dry.",
    },
    stockBySize: { S: true, M: true, L: true, XL: false, XXL: false },
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
