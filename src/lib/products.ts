export type Product = {
  id: string;
  slug: string;
  name: string;
  color: string;
  price: number;
  compareAtPrice?: number;
  shortDescription?: string;
  weightGsm: number;
  qVariant: string;
  fabricStory: string;
  images: string[];
  description: {
    fabric: string;
    fit: string;
    care: string;
  };
  stockBySize: Record<string, boolean>;
};

export const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const coreFabricStory =
  "100% COTTON cotton holds the shape. Garment dye and enzyme wash give the surface its lived weight. Science you can feel.";

export const products: Product[] = [
  {
    id: "qutb-white-boxy",
    slug: "qutb-boxy-tee-white",
    name: "QUTB Boxy Tee",
    color: "White",
    price: 450,
    weightGsm: 220,
    qVariant: "Q-01 Industrial Block",
    fabricStory: coreFabricStory,
    images: [
      "/images/1.avif",
      "/images/2.webp",
      "/images/3.webp",
      "/images/11.avif",
    ],
    description: {
      fabric: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
      fit: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
      care: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
    },
    stockBySize: { XS: true, S: true, M: true, L: true, XL: true, XXL: false },
  },
  {
    id: "qutb-black-boxy",
    slug: "qutb-boxy-tee-black",
    name: "QUTB Boxy Tee",
    color: "Black",
    price: 450,
    weightGsm: 220,
    qVariant: "Q-01 Industrial Block",
    fabricStory: coreFabricStory,
    images: [
      "/images/4.webp",
      "/images/5.webp",
      "/images/6.webp",
      "/images/7.webp",
    ],
    description: {
      fabric: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
      fit: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
      care: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
    },
    stockBySize: { XS: true, S: false, M: true, L: true, XL: true, XXL: true },
  },
  {
    id: "qutb-gray-boxy",
    slug: "qutb-boxy-tee-gray",
    name: "QUTB Boxy Tee",
    color: "Gray",
    price: 450,
    weightGsm: 220,
    qVariant: "Q-01 Industrial Block",
    fabricStory: coreFabricStory,
    images: [
      "/images/10.jpeg",
      "/images/8.jpeg",
      "/images/9.jpeg",
      "/images/2.webp",
    ],
    description: {
      fabric: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
      fit: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
      care: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
    },
    stockBySize: { XS: true, S: true, M: true, L: false, XL: true, XXL: true },
  },
  {
    id: "qutb-raw-white",
    slug: "qutb-raw-tee-white",
    name: "QUTB Raw Tee",
    color: "White",
    price: 520,
    weightGsm: 220,
    qVariant: "Q-01 Industrial Block",
    fabricStory: coreFabricStory,
    images: [
      "/images/3.webp",
      "/images/1.avif",
      "/images/11.avif",
      "/images/2.webp",
    ],
    description: {
      fabric: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
      fit: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
      care: "100% COTTON. Boxy. Built in Alexandria. This is QUTB.",
    },
    stockBySize: { XS: true, S: true, M: true, L: true, XL: false, XXL: false },
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
