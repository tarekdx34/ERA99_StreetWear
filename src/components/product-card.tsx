"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatEGP } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const front = product.images[0] || "/images/1.avif";
  const back = product.images[1] || front;

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#EDE8DF]">
          <motion.img
            src={front}
            alt={`${product.name} in ${product.color}`}
            width={720}
            height={960}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ opacity: hovered ? 0 : 1, scale: hovered ? 1.03 : 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          <motion.img
            src={back}
            alt={`${product.name} detail`}
            width={720}
            height={960}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1.03 : 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
        <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-[#111111]/35">
          {product.weightGsm} GSM - {product.qVariant}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h3 className="font-brand-serif text-[18px] leading-tight text-[#111111]">
            {product.name}
          </h3>
          <p className="whitespace-nowrap text-sm text-[#111111]">
            {product.compareAtPrice ? (
              <>
                <span className="mr-2 text-[#7C7C75] line-through">
                  {formatEGP(product.compareAtPrice)}
                </span>
                {formatEGP(product.price)}
              </>
            ) : (
              formatEGP(product.price)
            )}
          </p>
        </div>
        <p className="mt-1 text-sm font-light text-[#7C7C75]">
          {product.color}
        </p>
      </Link>
    </motion.article>
  );
}
