"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/brand";
import { QutbFooter } from "@/components/qutb-footer";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/products";
import { formatEGP } from "@/lib/utils";

const heroImage =
  "https://images.unsplash.com/photo-1761503347697-ade0eb2fc097?w=1920&h=1200&fit=crop&auto=format";

const storyPanels = [
  {
    label: "01 - The Uniform",
    title: "Three silhouettes. Built to stay.",
    body: "A permanent collection of cotton essentials refined through fabric, fit, and repetition.",
    href: "/shop",
    image: "/images/2.webp",
  },
  {
    label: "02 - Alexandria",
    title: "Made near the sea.",
    body: "The city gives QUTB its pace: salt air, soft light, and the quiet confidence of everyday work.",
    href: "/story#alexandria",
    image: "/images/1.avif",
  },
  {
    label: "03 - Cotton",
    title: "Fabric before fashion.",
    body: "Weight, weave, yarn, and finish come first. The garment follows the material.",
    href: "/story#cotton",
    image: "/images/4.webp",
  },
];

function FeaturedProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const firstAvailable = Object.entries(product.stockBySize).find(
    ([, available]) => available,
  )?.[0];

  const handleQuickAdd = () => {
    if (!firstAvailable) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      color: product.color,
      size: firstAvailable,
      qty: 1,
      unitPrice: product.price,
      image: product.images[0],
    });
    openCart();
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-[#EDE8DF]"
      >
        <img
          src={product.images[0]}
          alt={`${product.name} in ${product.color}`}
          width={720}
          height={960}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] group-hover:opacity-0"
        />
        <img
          src={product.images[1] || product.images[0]}
          alt={`${product.name} fabric detail`}
          width={720}
          height={960}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
        />
      </Link>

      <div className="mt-5">
        <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#111111]/35">
          {product.weightGsm} GSM - {product.qVariant}
        </p>
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/product/${product.slug}`}
            className="font-brand-serif text-[19px] leading-tight text-[#111111] hover:opacity-70"
          >
            {product.name}
          </Link>
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
        <button
          type="button"
          disabled={!firstAvailable}
          onClick={handleQuickAdd}
          className="mt-4 border-b border-[#111111]/50 pb-1 text-[11px] uppercase tracking-[0.16em] text-[#111111] transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-35"
        >
          {firstAvailable ? `Quick Add - ${firstAvailable}` : "Sold Out"}
        </button>
      </div>
    </motion.article>
  );
}

export function QutbLanding({ products }: { products: Product[] }) {
  const featured = products.slice(0, 3);

  return (
    <div className="overflow-x-hidden bg-[#FAF8F4] text-[#111111]">
      <main>
        <section
          className="relative flex min-h-[600px] w-full items-center justify-center overflow-hidden text-center"
          style={{ height: "100svh", backgroundColor: "#1D2635" }}
        >
          <img
            src={heroImage}
            alt="Clear turquoise Mediterranean water with rocky shoreline"
            width={1920}
            height={1200}
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 60%" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(17,17,17,0.35)_0%,rgba(17,17,17,0.1)_40%,rgba(17,17,17,0.65)_100%)]" />

          <div className="relative z-10 flex flex-col items-center px-6 pt-16">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="qutb-eyebrow mb-8 text-[#FAF8F4]/70"
            >
              Alexandria, Egypt
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              className="text-[#FAF8F4]"
            >
              <BrandLogo className="text-[clamp(5rem,16vw,11rem)] tracking-[0.18em]" />
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
              className="mt-8 max-w-[400px] text-[13px] font-light uppercase leading-[1.9] tracking-[0.18em] text-[#FAF8F4]/85 md:text-[15px]"
            >
              Modern Mediterranean Essentials.
              <br />
              Born from the sea. Built to last.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.45 }}
              className="mt-12"
            >
              <Link
                href="/shop"
                className="qutb-link-underline text-[12px] uppercase tracking-[0.2em] text-[#FAF8F4] transition-opacity hover:opacity-70"
              >
                Shop The Uniform
              </Link>
            </motion.div>
          </div>

          <ChevronDown
            size={17}
            strokeWidth={1.5}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-[#FAF8F4]/50"
          />
        </section>

        <section className="bg-[#FAF8F4] px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="qutb-eyebrow text-[#7C7C75]">01 - The Premise</p>
              <h2 className="mt-8 font-brand-serif text-[clamp(2.7rem,6vw,6.6rem)] font-medium leading-none tracking-[-0.01em]">
                The everyday uniform, refined by the coast.
              </h2>
            </div>
            <div className="flex items-end md:col-span-4 md:col-start-8">
              <p className="max-w-md text-[16px] font-light leading-[1.85] text-[#7C7C75]">
                QUTB is a wardrobe of cotton essentials shaped by Alexandria:
                clean silhouettes, quiet materials, and a sense of permanence
                that feels lived in from the first wear.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3">
          {storyPanels.map((panel) => (
            <Link
              key={panel.title}
              href={panel.href}
              className="group relative aspect-[4/5] overflow-hidden bg-[#1D2635]"
            >
              <img
                src={panel.image}
                alt={panel.title}
                width={900}
                height={1125}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,17,17,0.65),rgba(17,17,17,0.06))]" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-[#FAF8F4] md:p-10">
                <p className="qutb-eyebrow text-[#FAF8F4]/55">
                  {panel.label}
                </p>
                <h3 className="mt-4 font-brand-serif text-3xl leading-tight md:text-4xl">
                  {panel.title}
                </h3>
                <p className="mt-4 max-w-sm text-sm font-light leading-[1.7] text-[#FAF8F4]/70">
                  {panel.body}
                </p>
              </div>
            </Link>
          ))}
        </section>

        <section className="bg-[#FAF8F4] px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-14 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="qutb-eyebrow text-[#7C7C75]">The Uniform</p>
                <h2 className="mt-4 font-brand-serif text-[clamp(2.3rem,5vw,4.6rem)] font-medium leading-none tracking-[-0.01em]">
                  New essentials.
                </h2>
              </div>
              <Link
                href="/shop"
                className="qutb-link-underline text-[12px] uppercase tracking-[0.16em] text-[#111111] transition-opacity hover:opacity-60"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <FeaturedProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section
          id="salt-journal"
          className="bg-[#111111] px-6 py-24 text-[#FAF8F4] md:px-12 md:py-32"
        >
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="qutb-eyebrow text-[#FAF8F4]/35">
                Salt Journal
              </p>
              <h2 className="mt-6 font-brand-serif text-[clamp(2.6rem,5vw,4.8rem)] font-medium leading-[1.05]">
                Fabric first.
                <br />
                Logo second.
                <br />
                Always.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <p className="text-[16px] font-light leading-[1.9] text-[#FAF8F4]/60">
                Every QUTB piece starts with the cotton: GSM, hand feel, dye
                depth, shrink behavior, and the way it holds shape after real
                wear. The journal documents the standards behind the quiet.
              </p>
              <Link
                href="/story#fabric"
                className="qutb-link-underline mt-8 inline-block text-[12px] uppercase tracking-[0.18em] text-[#FAF8F4]"
              >
                Read The Notes
              </Link>
            </div>
          </div>
        </section>
      </main>
      <QutbFooter />
    </div>
  );
}
