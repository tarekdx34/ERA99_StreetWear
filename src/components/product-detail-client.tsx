"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { makeItemKey, useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/products";
import { sizes } from "@/lib/products";
import { formatEGP } from "@/lib/utils";
import {
  MinusIcon,
  PlusIcon,
  ShieldIcon,
  TruckIcon,
  WeightIcon,
  CloseIcon,
} from "@/components/icons";
import { ProductCard } from "@/components/product-card";

function Accordion({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#F0EDE8]/15">
      <button
        className="flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-[0.14em]"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pb-4 text-sm text-[#F0EDE8]/72"
          >
            {content}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SizeGuideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            className="fixed inset-0 z-[90] bg-black/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-[100] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-[#F0EDE8]/30 bg-[#111111] p-5"
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#F0EDE8]/15 pb-3">
              <h4 className="text-sm uppercase tracking-[0.14em]">
                SIZE GUIDE (CM)
              </h4>
              <button
                className="border border-[#F0EDE8]/25 p-2"
                onClick={onClose}
              >
                <CloseIcon />
              </button>
            </div>
            <table className="w-full text-left text-xs uppercase tracking-[0.1em]">
              <thead>
                <tr className="border-b border-[#F0EDE8]/15 text-[#F0EDE8]/60">
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest</th>
                  <th className="py-2">Length</th>
                  <th className="py-2">Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {["S", "M", "L", "XL", "XXL"].map((size, i) => (
                  <tr key={size} className="border-b border-[#F0EDE8]/10">
                    <td className="py-2">{size}</td>
                    <td className="py-2">{56 + i * 2}</td>
                    <td className="py-2">{64 + i * 1.5}</td>
                    <td className="py-2">{55 + i * 1.5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts?: Product[];
}) {
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [openGuide, setOpenGuide] = useState(false);
  const [fly, setFly] = useState(false);
  const { addItem, openCart } = useCart();
  const router = useRouter();

  const related = useMemo(
    () => (relatedProducts || []).filter((p) => p.id !== product.id).slice(0, 4),
    [product.id, relatedProducts],
  );

  const canAdd = !!selectedSize;

  const handleAdd = () => {
    if (!selectedSize) return;
    setFly(true);
    const out = product.stockBySize[selectedSize];
    if (!out) return;
    window.setTimeout(() => {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        color: product.color,
        size: selectedSize,
        qty,
        unitPrice: product.price,
        image: product.images[0],
      });
      setFly(false);
    }, 230);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      color: product.color,
      size: selectedSize,
      qty,
      unitPrice: product.price,
      image: product.images[0],
    });
    router.push("/checkout?mode=buynow");
  };

  return (
    <main className="bg-[#080808] px-6 pb-20 pt-28 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[60%_40%]">
        <section>
          <div className="lg:sticky lg:top-28">
            <div className="overflow-hidden border border-[#F0EDE8]/15">
              <img
                src={mainImage}
                alt={product.name}
                className="h-[68vh] w-full object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {product.images.map((image) => (
                <button
                  key={image}
                  onClick={() => setMainImage(image)}
                  className={`overflow-hidden border ${mainImage === image ? "border-[#F0EDE8]" : "border-[#F0EDE8]/20"}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumb`}
                    className="h-24 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#F0EDE8]/45">
            HOME / SHOP / {product.name} {product.color}
          </p>
          <h1 className="mt-4 text-[32px] font-medium">
            {product.name} — {product.color}
          </h1>
          <p className="mt-2 text-[28px] font-bold">
              {product.compareAtPrice ? (
                <>
                  <span className="mr-2 line-through text-[#F0EDE8]/45">{formatEGP(product.compareAtPrice)}</span>
                  <span>{formatEGP(product.price)}</span>
                </>
              ) : (
                <span>{formatEGP(product.price)}</span>
              )}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#8B0000]">
            <motion.span
              className="h-2 w-2 bg-[#8B0000]"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            99 — LIMITED
          </div>

          <div className="my-6 border-b-[0.5px] border-[#F0EDE8]/15" />

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Select size
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const inStock = product.stockBySize[size];
                return (
                  <button
                    key={size}
                    disabled={!inStock}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 w-11 border text-xs uppercase tracking-[0.1em] ${
                      selectedSize === size
                        ? "border-[#F0EDE8] bg-[#F0EDE8] text-black"
                        : "border-[#F0EDE8]/30"
                    } ${!inStock ? "cursor-not-allowed text-[#F0EDE8]/30 line-through" : "hover:border-[#F0EDE8]"}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {!selectedSize ? (
              <p className="mt-2 text-xs text-[#8B0000]">
                Please select a size.
              </p>
            ) : null}
            <button
              onClick={() => setOpenGuide(true)}
              className="mt-3 text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/75 hover:underline"
            >
              SIZE GUIDE →
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
              Qty
            </span>
            <div className="inline-flex items-center border border-[#F0EDE8]/30">
              <button
                className="h-11 w-11 border-r border-[#F0EDE8]/30"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <MinusIcon />
              </button>
              <span className="w-12 text-center text-sm">{qty}</span>
              <button
                className="h-11 w-11 border-l border-[#F0EDE8]/30"
                onClick={() => setQty((q) => q + 1)}
              >
                <PlusIcon />
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              disabled={!canAdd}
              onClick={handleAdd}
              className="w-full bg-[#F0EDE8] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-black disabled:opacity-50"
            >
              ADD TO CART
            </button>
            <button
              disabled={!canAdd}
              onClick={handleBuyNow}
              className="w-full border border-[#F0EDE8]/40 px-4 py-3 text-sm uppercase tracking-[0.14em] disabled:opacity-50"
            >
              BUY NOW
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2 text-xs text-[#F0EDE8]/72 sm:grid-cols-3">
            <div className="flex items-center gap-2 border border-[#F0EDE8]/12 px-3 py-2">
              <TruckIcon />
              Free Alex Delivery
            </div>
            <div className="flex items-center gap-2 border border-[#F0EDE8]/12 px-3 py-2">
              <ShieldIcon />
              QUTB 99
            </div>
            <div className="flex items-center gap-2 border border-[#F0EDE8]/12 px-3 py-2">
              <WeightIcon />
              220GSM Heavyweight
            </div>
          </div>

          <div className="mt-8">
            <Accordion
              title="Fabric Details"
              content={product.description.fabric}
            />
            <Accordion title="Size & Fit" content={product.description.fit} />
            <Accordion
              title="Care Instructions"
              content={product.description.care}
            />
          </div>
        </section>
      </div>

      <section className="mx-auto mt-16 max-w-7xl">
        <h2 className="mb-8 text-2xl uppercase tracking-[0.14em]">
          YOU MIGHT ALSO LIKE
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <SizeGuideModal open={openGuide} onClose={() => setOpenGuide(false)} />

      <AnimatePresence>
        {fly ? (
          <motion.div
            className="fixed left-1/2 top-[50%] z-[120] h-8 w-8 border border-[#F0EDE8] bg-[#F0EDE8]"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: "42vw", y: "-44vh", opacity: 0.2, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            onAnimationComplete={() => {
              setFly(false);
              openCart();
            }}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
