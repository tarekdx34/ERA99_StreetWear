"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatEGP } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border border-[#EDE9E0]/20 bg-[#080808] p-3"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden border border-[#EDE9E0]/15">
          <motion.img
            src={product.images[0]}
            alt={`QUTB ${product.name} in ${product.color} — 100% COTTON garment dyed tee, ${product.price} EGP`}
            width={600}
            height={800}
            loading="lazy"
            srcSet={`${product.images[0]} 400w, ${product.images[0]} 800w, ${product.images[0]} 1200w`}
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ opacity: hovered ? 0 : 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <motion.img
            src={product.images[1] ?? product.images[0]}
            alt={`QUTB ${product.name} in ${product.color} — 100% COTTON garment dyed tee, ${product.price} EGP`}
            width={600}
            height={800}
            loading="lazy"
            srcSet={`${product.images[1] ?? product.images[0]} 400w, ${product.images[1] ?? product.images[0]} 800w, ${product.images[1] ?? product.images[0]} 1200w`}
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <h3 className="mt-4 text-sm font-medium uppercase tracking-[0.1em]">
          {product.name} — {product.color}
        </h3>
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#EDE9E0]/65">
          {product.compareAtPrice ? (
            <>
              <span className="mr-2 line-through text-[#EDE9E0]/45">
                {formatEGP(product.compareAtPrice)}
              </span>
              <span>{formatEGP(product.price)}</span>
            </>
          ) : (
            formatEGP(product.price)
          )}
        </p>
      </Link>
    </motion.article>
  );
}
