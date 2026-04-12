"use client";

import { Search, ShoppingBag, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/products";
import Link from "next/link";

const tickerText =
  "QUTB — 99 — ALEXANDRIA — THE AXIS — NINETY NINE — EVERYTHING REVOLVES — 99 — FREE DELIVERY IN ALEX — QUTB — 99 — LIMITED DROP";

const heroImage = "/images/1.jpeg";

const bannerPanels = [
  { title: "BOXY FIT", image: "/images/2.jpeg" },
  { title: "HEAVYWEIGHT", image: "/images/4.png" },
  { title: "FIRST DROP", image: "/images/7.jpeg" },
];

const instagramTiles = [
  "/images/1.jpeg",
  "/images/2.jpeg",
  "/images/3.jpeg",
  "/images/4.png",
  "/images/5.jpeg",
  "/images/6.jpeg",
];

function Logo({ className = "" }) {
  return (
    <span className={className}>
      <span className="font-blackletter">Q</span>
      <span className="font-sans uppercase tracking-[0.14em]">UTB</span>
    </span>
  );
}

function AnnouncementStrip() {
  return (
    <div className="fixed left-0 top-0 z-50 h-8 w-full overflow-hidden border-b border-ash/20 bg-ink">
      <motion.div
        className="flex h-full min-w-max items-center gap-14 px-6 text-[10px] uppercase tracking-[0.2em] text-ash/95"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 55, ease: "linear", repeat: Infinity }}
      >
        <span>{tickerText}</span>
        <span>{tickerText}</span>
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </motion.div>
    </div>
  );
}

function NavBar() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 top-8 z-50 w-full border-b-[0.5px] border-[rgba(240,237,232,0.15)] ${
        solid ? "bg-ink" : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10">
        <a href="#" className="justify-self-start text-[28px] text-ash">
          <Logo />
        </a>
        <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.15em] text-ash md:flex">
          <a href="#drop" className="hover:text-[#8B0000]">
            SHOP
          </a>
          <a href="#statement" className="hover:text-[#8B0000]">
            STORY
          </a>
          <a href="#footer" className="hover:text-[#8B0000]">
            ALEX
          </a>
        </div>
        <div className="flex items-center justify-self-end gap-3 text-ash">
          <button
            aria-label="Search"
            className="border border-ash/30 p-2 hover:border-ash"
          >
            <Search size={16} strokeWidth={1.7} />
          </button>
          <button
            aria-label="Cart"
            className="border border-ash/30 p-2 hover:border-ash"
          >
            <ShoppingBag size={16} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroBanner() {
  return (
    <section className="relative h-screen w-screen overflow-hidden">
      <img
        src={heroImage}
        alt="QUTB campaign"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="text-[72px] leading-none text-ash drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)] md:text-[120px]"
          >
            <Logo className="inline-flex items-end gap-1" />
          </motion.h1>
          <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.4em] text-ash/65 md:text-[13px]">
            99
          </p>
          <p className="mt-5 text-[13px] uppercase tracking-[0.3em] text-ash/95 md:text-[16px]">
            99 — ALEXANDRIA
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.a
              href="#drop"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-[190px] border border-ash bg-ash px-8 py-3 text-xs font-medium uppercase tracking-[0.16em] text-black"
            >
              SHOP NOW
            </motion.a>
            <motion.a
              href="#statement"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-[190px] border border-ash bg-transparent px-8 py-3 text-xs font-medium uppercase tracking-[0.16em] text-ash"
            >
              OUR STORY
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThreeColumnBanners() {
  return (
    <section className="grid w-full grid-cols-1 md:grid-cols-3">
      {bannerPanels.map((panel) => (
        <motion.article
          key={panel.title}
          whileHover={{ scale: 1.01 }}
          className="relative aspect-[3/4] overflow-hidden"
        >
          <img
            src={panel.image}
            alt={panel.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h3 className="font-sans text-3xl font-medium uppercase tracking-[0.16em] text-ash">
              {panel.title}
            </h3>
            <a
              href="#drop"
              className="mt-3 text-xs uppercase tracking-[0.2em] text-ash hover:text-[#8B0000]"
            >
              SHOP NOW →
            </a>
          </div>
        </motion.article>
      ))}
    </section>
  );
}

interface CartProduct {
  productId: string;
  slug: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
  image: string;
}

function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem, openCart } = useCart();

  const frontImage = product.images[0] || "/images/1.jpeg";
  const backImage = product.images[1] || "/images/2.jpeg";

  const handleAddToCart = () => {
    if (!selectedSize) {
      // Show size selection required notice
      alert("Please select a size");
      return;
    }

    const cartItem: CartProduct = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      color: product.color,
      size: selectedSize,
      qty: 1,
      unitPrice: product.price,
      image: frontImage,
    };

    addItem(cartItem as any);
    openCart();
  };

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border border-ash/20 bg-[#111111] p-3"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden border border-ash/15">
          <motion.img
            src={frontImage}
            alt={`${product.name} front`}
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ opacity: hovered ? 0 : 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <motion.img
            src={backImage}
            alt={`${product.name} back`}
            className="absolute inset-0 h-full w-full object-cover"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </Link>

      <h3 className="mt-4 font-sans text-sm font-medium uppercase tracking-[0.1em] text-ash">
        {product.name} - {product.color}
      </h3>
         <p className="mt-2 text-xs uppercase tracking-[0.15em] text-ash/72">
           {product.compareAtPrice ? (
             <>
               <span className="mr-2 line-through text-ash/45">{product.compareAtPrice} EGP</span>
               <span>{product.price} EGP</span>
             </>
           ) : (
             <span>{product.price} EGP</span>
           )}
      </p>

      <motion.div
        animate={{
          opacity: hovered ? 1 : 0,
          height: hovered ? "auto" : 0,
          y: hovered ? 0 : 8,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.13em] text-ash/85">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`border px-2 py-1 transition-colors ${
                selectedSize === size
                  ? "border-ash bg-ash text-black"
                  : "border-ash/25 hover:border-ash"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full bg-ash px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-black hover:bg-ash/90 transition-colors"
        >
          ADD TO CART
        </button>
      </motion.div>
    </motion.article>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section id="drop" className="bg-ink px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-sans text-5xl font-medium uppercase tracking-[0.08em] text-ash md:text-6xl">
          99 — THE FIRST DROP
        </h2>
        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-ash/55">
          99 — DROP 001
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandStatement() {
  return (
    <section
      id="statement"
      className="relative w-full overflow-hidden bg-ink px-6 py-24 md:px-10"
    >
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20vw] leading-none text-ash/[0.06] md:left-10">
        قطب
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2">
        <div />
        <div className="relative z-10 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.22em] text-ash/50">
            WHO WE ARE
          </p>
          <h3 className="mt-5 max-w-2xl text-3xl leading-[1.3] text-ash md:text-[32px]">
            We are the axis. The fixed point. Everything revolves - we stay
            still.
          </h3>
          <p className="mt-5 max-w-xl text-base text-ash/60">
            Born in Alexandria. Built for those who do not ask for permission.
          </p>
          <Link
            href="/story"
            className="mt-8 w-fit text-sm uppercase tracking-[0.16em] text-ash hover:underline"
          >
            READ THE STORY →
          </Link>
        </div>
      </div>
    </section>
  );
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(targetTimestamp: number): CountdownTime {
  const calculate = () => {
    const diff = Math.max(0, targetTimestamp - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  const [time, setTime] = useState<CountdownTime>(calculate);

  useEffect(() => {
    const id = window.setInterval(() => setTime(calculate()), 1000);
    return () => window.clearInterval(id);
  }, [targetTimestamp]);

  return time;
}

function UrgencyStrip() {
  const target = useMemo(() => Date.now() + 7 * 24 * 60 * 60 * 1000, []);
  const time = useCountdown(target);

  const format = (value: number) => String(value).padStart(2, "0");

  return (
    <section className="w-full bg-[#8B0000] px-6 py-6 text-ash md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-xs uppercase tracking-[0.2em] md:text-left">
          99 — DROP 001 — LIMITED QUANTITIES — ORDER NOW
        </p>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
          <div className="border border-ash/40 bg-black/20 px-2 py-1">
            {format(time.days)}D
          </div>
          <span>:</span>
          <div className="border border-ash/40 bg-black/20 px-2 py-1">
            {format(time.hours)}H
          </div>
          <span>:</span>
          <div className="border border-ash/40 bg-black/20 px-2 py-1">
            {format(time.minutes)}M
          </div>
          <span>:</span>
          <div className="border border-ash/40 bg-black/20 px-2 py-1">
            {format(time.seconds)}S
          </div>
        </div>
      </div>
    </section>
  );
}

function InstagramStrip() {
  return (
    <section className="bg-ink px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-blackletter text-5xl text-ash md:text-6xl">
          @QUTBCO
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {instagramTiles.map((image, index) => (
            <motion.article
              key={`${image}-${index}`}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="group relative aspect-square overflow-hidden border border-ash/15"
            >
              <img
                src={image}
                alt={`Instagram tile ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/55"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Camera size={20} />
              </motion.div>
            </motion.article>
          ))}
        </div>
        <a
          href="#"
          className="mt-8 inline-block text-sm uppercase tracking-[0.18em] text-ash hover:underline"
        >
          FOLLOW US ON INSTAGRAM →
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="footer" className="bg-ink px-6 pb-8 pt-16 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 border-t border-ash/20 pt-12 md:grid-cols-3">
        <div>
          <div className="text-[34px] text-ash">
            <Logo />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.3em] text-ash/60">
            99
          </p>
          <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.4em] text-ash/55">
            NINETY NINE
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ash/65">
            Alexandria, Egypt
          </p>
          <p className="mt-2 text-sm text-ash/55">قطب</p>
        </div>

        <div className="flex flex-col gap-3 text-xs uppercase tracking-[0.16em] text-ash/70 md:items-center">
          <a href="#drop" className="hover:text-ash">
            SHOP
          </a>
          <Link href="/story" className="hover:text-ash">
            STORY
          </Link>
          <a href="#" className="hover:text-ash">
            CONTACT
          </a>
          <a href="#" className="hover:text-ash">
            SIZE GUIDE
          </a>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ash/70">
            JOIN THE DROP
          </p>
          <form className="mt-4 flex w-full max-w-sm">
            <input
              type="email"
              required
              placeholder="EMAIL ADDRESS"
              className="w-full border border-ash/25 bg-transparent px-3 py-3 text-xs uppercase tracking-[0.12em] text-ash placeholder:text-ash/40 focus:border-ash focus:outline-none"
            />
            <button
              type="submit"
              className="border border-l-0 border-ash/25 bg-ash px-4 py-3 text-xs uppercase tracking-[0.12em] text-black"
            >
              JOIN
            </button>
          </form>
        </div>
      </div>
      <p className="mt-12 text-center text-[10px] uppercase tracking-[0.15em] text-ash/45">
        © 2025 QUTB 99 — All rights reserved
      </p>
    </footer>
  );
}

export function QutbLanding({ products }: { products: Product[] }) {
  return (
    <div className="bg-ink text-ash">
      {/* AnnouncementStrip and Nav are provided by SiteChrome in layout */}
      <main>
        <HeroBanner />
        <ThreeColumnBanners />
        <ProductGrid products={products} />
        <BrandStatement />
        <UrgencyStrip />
        <InstagramStrip />
      </main>
      <Footer />
    </div>
  );
}
