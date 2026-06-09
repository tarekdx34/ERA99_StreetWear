"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QutbFooter } from "@/components/qutb-footer";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/contexts/cart-context";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import type { Product } from "@/lib/products";
import { sizes } from "@/lib/products";
import { formatEGP } from "@/lib/utils";

function Accordion({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#111111]/10">
      <button
        className="flex w-full items-center justify-between py-5 text-left text-[12px] uppercase tracking-[0.16em] text-[#111111]"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <span>{open ? "-" : "+"}</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pb-5 text-[15px] font-light leading-[1.8] text-[#7C7C75]"
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
            aria-label="Close size guide"
            className="fixed inset-0 z-[90] bg-[#111111]/45 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-[100] w-[calc(100%-48px)] max-w-2xl -translate-x-1/2 -translate-y-1/2 bg-[#FAF8F4] p-8 text-[#111111] shadow-[0_24px_80px_rgba(17,17,17,0.2)] md:p-12"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-8 flex items-start justify-between border-b border-[#111111]/10 pb-6">
              <div>
                <p className="qutb-eyebrow text-[#7C7C75]">
                  Box Tee - Measurement Guide
                </p>
                <h3 className="mt-2 font-brand-serif text-3xl">
                  Size Guide
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-[#7C7C75] hover:text-[#111111]"
                aria-label="Close size guide"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.18em] text-[#7C7C75]">
                <tr>
                  <th className="border-b border-[#111111]/10 py-3">Size</th>
                  <th className="border-b border-[#111111]/10 py-3">Chest</th>
                  <th className="border-b border-[#111111]/10 py-3">Length</th>
                  <th className="border-b border-[#111111]/10 py-3">Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((size, index) => (
                  <tr key={size} className="border-b border-[#111111]/5">
                    <td className="py-4 text-[#111111]">{size}</td>
                    <td className="py-4 text-[#7C7C75]">{56 + index * 2} cm</td>
                    <td className="py-4 text-[#7C7C75]">
                      {64 + index * 1.5} cm
                    </td>
                    <td className="py-4 text-[#7C7C75]">
                      {55 + index * 1.5} cm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-7 bg-[#F5F0E8] p-5 text-sm font-light leading-[1.8] text-[#7C7C75]">
              Designed for structured ease. Choose your usual size for the
              intended drape, or size down for a closer fit.
            </p>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function PhotoViewerModal({
  open,
  images,
  currentIndex,
  onChangeIndex,
  alt,
  onClose,
}: {
  open: boolean;
  images: string[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
  alt: string;
  onClose: () => void;
}) {
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomX, setZoomX] = useState(50);
  const [zoomY, setZoomY] = useState(50);
  const touchStartXRef = useRef<number | null>(null);
  const totalImages = images.length;
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const activeImage = images[activeIndex] || images[0] || "/images/1.avif";

  const goPrev = () => {
    if (totalImages <= 1) return;
    onChangeIndex((activeIndex - 1 + totalImages) % totalImages);
    setZoomActive(false);
  };

  const goNext = () => {
    if (totalImages <= 1) return;
    onChangeIndex((activeIndex + 1) % totalImages);
    setZoomActive(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, activeIndex, totalImages, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close photo viewer"
            className="fixed inset-0 z-[130] bg-[#111111]/75"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-[140] w-[96vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 bg-[#FAF8F4] p-4 text-[#111111] md:p-5"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C7C75]">
                View Photo
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#7C7C75]">
                {activeIndex + 1} / {totalImages}
              </p>
              <button onClick={onClose} aria-label="Close photo viewer">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div
              className="relative overflow-hidden bg-[#EDE8DF]"
              onTouchStart={(event) => {
                touchStartXRef.current = event.touches[0].clientX;
              }}
              onTouchEnd={(event) => {
                const startX = touchStartXRef.current;
                if (startX === null) return;
                const deltaX = event.changedTouches[0].clientX - startX;
                if (Math.abs(deltaX) > 35) {
                  if (deltaX < 0) goNext();
                  else goPrev();
                }
                touchStartXRef.current = null;
              }}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setZoomX(((event.clientX - rect.left) / rect.width) * 100);
                setZoomY(((event.clientY - rect.top) / rect.height) * 100);
              }}
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
            >
              {totalImages > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous photo"
                    className="absolute left-2 top-1/2 z-[141] -translate-y-1/2 bg-[#FAF8F4]/85 px-3 py-2 text-sm"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next photo"
                    className="absolute right-2 top-1/2 z-[141] -translate-y-1/2 bg-[#FAF8F4]/85 px-3 py-2 text-sm"
                  >
                    →
                  </button>
                </>
              ) : null}

              <img
                src={activeImage}
                alt={alt}
                width={1200}
                height={1600}
                loading="lazy"
                className="max-h-[86vh] w-full object-contain"
                style={{
                  transform: zoomActive ? "scale(1.8)" : "scale(1)",
                  transformOrigin: `${zoomX}% ${zoomY}%`,
                  transition: zoomActive
                    ? "transform 40ms linear"
                    : "transform 220ms ease-out",
                }}
              />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function ProductStory({ product }: { product: Product }) {
  return (
    <>
      <section className="bg-[#FAF8F4] px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="qutb-eyebrow text-[#7C7C75]">Product Story</p>
            <h2 className="mt-6 font-brand-serif text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05]">
              Designed for daily repetition.
            </h2>
          </div>
          <div className="space-y-6 text-[16px] font-light leading-[1.9] text-[#7C7C75] lg:col-span-5 lg:col-start-8">
            <p>{product.fabricStory}</p>
            <p>
              Cut from cotton selected for structure and softened through wear,
              this piece is made to become part of the day rather than a moment
              in a season.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#111111] px-6 py-24 text-[#FAF8F4] md:px-12 md:py-32">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="qutb-eyebrow text-[#FAF8F4]/35">Origin</p>
            <h2 className="mt-6 font-brand-serif text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.05]">
              Made near
              <br />
              the sea.
            </h2>
          </div>
          <div className="space-y-6 text-[16px] font-light leading-[1.9] text-[#FAF8F4]/60 lg:col-span-5 lg:col-start-8">
            <p>
              Alexandria gives the garment its rhythm: practical, coastal, and
              quietly exacting. The city is not a campaign reference. It is the
              source.
            </p>
            <p>
              Every stitch carries production memory from workshops and cutting
              rooms shaped by generations of cotton craft.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F0E8] px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="qutb-eyebrow text-[#7C7C75]">Fit Philosophy</p>
          <h2 className="mt-6 font-brand-serif text-[clamp(2.4rem,6vw,5rem)] leading-[1.05]">
            Fabric first.
            <br />
            Logo second.
            <br />
            Always.
          </h2>
        </div>
      </section>
    </>
  );
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts?: Product[];
}) {
  const images = product.images.length ? product.images : ["/images/1.avif"];
  const [mainImage, setMainImage] = useState(images[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [openGuide, setOpenGuide] = useState(false);
  const [openPhotoViewer, setOpenPhotoViewer] = useState(false);
  const [fly, setFly] = useState(false);
  const imageTouchStartXRef = useRef<number | null>(null);
  const imageSwipeTriggeredRef = useRef(false);
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const { track } = useMetaPixel();

  const related = useMemo(
    () => (relatedProducts || []).filter((p) => p.id !== product.id).slice(0, 4),
    [product.id, relatedProducts],
  );

  const hasStock = sizes.some((size) => product.stockBySize[size]);
  const canAdd = !!selectedSize && Boolean(product.stockBySize[selectedSize]);

  useEffect(() => {
    trackEvent("view_item", {
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      currency: "EGP",
    });
    track("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      value: product.price,
      currency: "EGP",
    });
  }, [product.id, product.name, product.price, track, trackEvent]);

  const handleAdd = () => {
    if (!canAdd || !selectedSize) return;
    setFly(true);
    window.setTimeout(() => {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        color: product.color,
        size: selectedSize,
        qty,
        unitPrice: product.price,
        image: images[0],
      });
      setFly(false);
    }, 230);
  };

  const handleBuyNow = () => {
    if (!canAdd || !selectedSize) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      color: product.color,
      size: selectedSize,
      qty,
      unitPrice: product.price,
      image: images[0],
    });
    router.push("/checkout?mode=buynow");
  };

  const switchMainImageByStep = (step: number) => {
    if (!images.length) return;
    const currentIndex = Math.max(0, images.indexOf(mainImage));
    const nextIndex = (currentIndex + step + images.length) % images.length;
    setMainImage(images[nextIndex]);
  };

  return (
    <div className="bg-[#FAF8F4] text-[#111111]">
      <main>
        <section className="mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-[62%_38%]">
          <div className="pt-[99px] lg:pt-[99px]">
            <div className="flex flex-col gap-[3px]">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setMainImage(image);
                    setOpenPhotoViewer(true);
                  }}
                  className="relative aspect-[3/4] w-full overflow-hidden bg-[#EDE8DF] text-left md:aspect-[4/5]"
                >
                  <img
                    src={image}
                    alt={`${product.name} in ${product.color} ${index + 1}`}
                    width={1200}
                    height={1600}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : undefined}
                    className="h-full w-full object-cover"
                    onTouchStart={(event) => {
                      const touch = event.touches[0];
                      imageTouchStartXRef.current = touch.clientX;
                      imageSwipeTriggeredRef.current = false;
                    }}
                    onTouchEnd={(event) => {
                      const startX = imageTouchStartXRef.current;
                      if (startX === null) return;
                      const deltaX = event.changedTouches[0].clientX - startX;
                      if (Math.abs(deltaX) > 35) {
                        imageSwipeTriggeredRef.current = true;
                        switchMainImageByStep(deltaX < 0 ? 1 : -1);
                      }
                      imageTouchStartXRef.current = null;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-[99px] lg:h-[calc(100vh-99px)] lg:overflow-y-auto">
            <div className="px-6 py-12 md:px-12 lg:px-10 lg:py-16">
              <Link
                href="/shop"
                className="mb-8 inline-block text-[11px] uppercase tracking-[0.18em] text-[#7C7C75] hover:text-[#111111]"
              >
                ← The Uniform
              </Link>
              <p className="qutb-eyebrow text-[#111111]/35">
                {product.weightGsm} GSM - {product.qVariant}
              </p>
              <h1 className="mt-3 font-brand-serif text-[clamp(2.1rem,4vw,3.2rem)] font-medium leading-none tracking-[-0.01em]">
                {product.name}
              </h1>
              <p className="mt-2 text-sm font-light tracking-[0.08em] text-[#7C7C75]">
                {product.color}
              </p>
              <p className="mt-6 text-lg text-[#111111]">
                {product.compareAtPrice ? (
                  <>
                    <span className="mr-3 text-[#7C7C75] line-through">
                      {formatEGP(product.compareAtPrice)}
                    </span>
                    {formatEGP(product.price)}
                  </>
                ) : (
                  formatEGP(product.price)
                )}
              </p>
              <p className="mt-6 text-[15px] font-light leading-[1.8] text-[#7C7C75]">
                {product.shortDescription || product.description.fabric}
              </p>

              <div className="my-8 border-t border-[#111111]/10" />

              {!hasStock ? (
                <p className="mb-7 border border-[#111111]/15 bg-[#F5F0E8] px-4 py-3 text-sm text-[#7C7C75]">
                  Sold out. Watch for the next restock.
                </p>
              ) : null}

              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="qutb-eyebrow text-[#7C7C75]">
                    Size{selectedSize ? ` - ${selectedSize}` : ""}
                  </p>
                  <button
                    onClick={() => setOpenGuide(true)}
                    className="text-[11px] uppercase tracking-[0.14em] text-[#7C7C75] underline underline-offset-4 hover:text-[#111111]"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-5">
                  {sizes.map((size) => {
                    const inStock = product.stockBySize[size];
                    return (
                      <button
                        key={size}
                        disabled={!inStock}
                        onClick={() => setSelectedSize(size)}
                        className={`border-b pb-1 text-[13px] uppercase tracking-[0.12em] ${
                          selectedSize === size
                            ? "border-[#111111] text-[#111111]"
                            : "border-transparent text-[#7C7C75]"
                        } ${!inStock ? "cursor-not-allowed text-[#111111]/25 line-through" : "hover:text-[#111111]"}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && hasStock ? (
                  <p className="mt-3 text-sm font-light text-[#7C7C75]">
                    Please select a size.
                  </p>
                ) : null}
              </div>

              {hasStock ? (
                <div className="mt-8">
                  <p className="qutb-eyebrow mb-3 text-[#7C7C75]">Quantity</p>
                  <div className="inline-flex h-11 items-center border border-[#111111]/20">
                    <button
                      className="grid h-11 w-11 place-items-center border-r border-[#111111]/20 text-[#7C7C75] hover:text-[#111111]"
                      onClick={() => setQty((value) => Math.max(1, value - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} strokeWidth={1.5} />
                    </button>
                    <span className="w-12 text-center text-sm">{qty}</span>
                    <button
                      className="grid h-11 w-11 place-items-center border-l border-[#111111]/20 text-[#7C7C75] hover:text-[#111111]"
                      onClick={() => setQty((value) => value + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ) : null}

              {hasStock ? (
                <div className="mt-8 space-y-3">
                  <button
                    disabled={!canAdd}
                    onClick={handleAdd}
                    className="h-12 w-full bg-[#111111] px-4 text-[12px] uppercase tracking-[0.16em] text-[#FAF8F4] transition-opacity hover:opacity-85 disabled:opacity-40"
                  >
                    Add To Bag
                  </button>
                  <button
                    disabled={!canAdd}
                    onClick={handleBuyNow}
                    className="h-12 w-full border border-[#111111]/25 px-4 text-[12px] uppercase tracking-[0.16em] text-[#111111] transition-colors hover:border-[#111111] disabled:opacity-40"
                  >
                    Buy Now
                  </button>
                </div>
              ) : null}

              <div className="mt-8 grid grid-cols-1 gap-3 border-y border-[#111111]/10 py-5 text-sm font-light text-[#7C7C75]">
                <p>Free Alexandria delivery</p>
                <p>100% cotton construction</p>
                <p>Made in Egypt</p>
              </div>

              <div className="mt-6">
                <Accordion title="Fabric Details" content={product.description.fabric} />
                <Accordion title="Fabric Story" content={product.fabricStory} />
                <Accordion title="Fit" content={product.description.fit} />
                <Accordion title="Care" content={product.description.care} />
              </div>
            </div>
          </aside>
        </section>

        <ProductStory product={product} />

        {related.length > 0 ? (
          <section className="bg-[#FAF8F4] px-6 py-24 md:px-12 md:py-32">
            <div className="mx-auto max-w-[1400px]">
              <div className="mb-14 flex items-end justify-between gap-5">
                <div>
                  <p className="qutb-eyebrow text-[#7C7C75]">
                    Also From The Uniform
                  </p>
                  <h2 className="mt-4 font-brand-serif text-[clamp(2rem,4vw,3rem)]">
                    Complete The Uniform
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="qutb-link-underline text-[12px] uppercase tracking-[0.16em] text-[#111111]"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <QutbFooter />

      <SizeGuideModal open={openGuide} onClose={() => setOpenGuide(false)} />
      <PhotoViewerModal
        open={openPhotoViewer}
        images={images}
        currentIndex={Math.max(0, images.indexOf(mainImage))}
        onChangeIndex={(index) => setMainImage(images[index])}
        alt={`${product.name} enlarged view`}
        onClose={() => setOpenPhotoViewer(false)}
      />

      <AnimatePresence>
        {fly ? (
          <motion.div
            className="fixed left-1/2 top-[50%] z-[120] h-8 w-8 bg-[#111111]"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: "42vw", y: "-44vh", opacity: 0.15, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            onAnimationComplete={() => {
              setFly(false);
              openCart();
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
