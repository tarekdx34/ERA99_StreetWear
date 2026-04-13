"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { sizes } from "@/lib/products";
import {
  buildDefaultVariant,
  makeSlugFromName,
  type CatalogProduct,
  type FitType,
} from "@/lib/catalog";

type Props = {
  mode: "new" | "edit";
  initialProduct: CatalogProduct;
  collections: string[];
  quickStats?: {
    totalUnitsSold: number;
    revenueGenerated: number;
    mostOrderedSize: string;
    averageRating: string;
  };
};

function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) return null;
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 border border-[#F0EDE8]/15 bg-[#0E0E0E] p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="border border-[#F0EDE8]/20 px-2 py-1 text-xs uppercase"
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="border border-[#F0EDE8]/20 px-2 py-1 text-xs uppercase"
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="border border-[#F0EDE8]/20 px-2 py-1 text-xs uppercase"
      >
        Bullets
      </button>
    </div>
  );
}

export function AdminProductForm({
  mode,
  initialProduct,
  collections,
  quickStats,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [product, setProduct] = useState<CatalogProduct>(initialProduct);
  const [collectionInput, setCollectionInput] = useState("");
  const [collectionList, setCollectionList] = useState(collections);
  const [productionCost, setProductionCost] = useState("");
  const [toast, setToast] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const [deletingImageKey, setDeletingImageKey] = useState("");
  const [cloudinarySettings, setCloudinarySettings] = useState<{
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
  } | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: initialProduct.fullDescription || "<p></p>",
    onUpdate({ editor: ed }) {
      const html = ed.getHTML();
      setProduct((prev) => ({ ...prev, fullDescription: html }));
    },
  });

  const margin = useMemo(() => {
    const cost = Number(productionCost);
    if (!Number.isFinite(cost) || cost <= 0) return null;
    const value = ((product.price - cost) / product.price) * 100;
    return Number.isFinite(value) ? value : null;
  }, [product.price, productionCost]);

  const setField = <K extends keyof CatalogProduct>(
    key: K,
    value: CatalogProduct[K],
  ) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };

  const getCloudinarySignedConfig = async () => {
    if (cloudinarySettings) {
      return cloudinarySettings;
    }

    const res = await fetch("/api/admin/products/cloudinary-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "6street-products" }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || "Cloudinary config is missing");
    }

    const payload = await res.json();
    const cloudName = String(payload?.cloudName || "").trim();
    const apiKey = String(payload?.apiKey || "").trim();
    const signature = String(payload?.signature || "").trim();
    const folder = String(payload?.folder || "").trim();
    const timestamp = Number(payload?.timestamp || 0);

    if (!cloudName || !apiKey || !signature || !folder || !timestamp) {
      throw new Error("Cloudinary URL is missing or invalid in Admin Settings");
    }

    const config = { cloudName, apiKey, timestamp, signature, folder };
    setCloudinarySettings(config);
    return config;
  };

  const uploadToCloudinary = async (files: File[]) => {
    let cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    let preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    let signedConfig: Awaited<
      ReturnType<typeof getCloudinarySignedConfig>
    > | null = null;

    if (!cloudName || !preset) {
      signedConfig = await getCloudinarySignedConfig();
      cloudName = signedConfig.cloudName;
    }

    const urls: string[] = [];
    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      if (preset) {
        body.append("upload_preset", preset);
      } else if (signedConfig) {
        body.append("api_key", signedConfig.apiKey);
        body.append("timestamp", String(signedConfig.timestamp));
        body.append("signature", signedConfig.signature);
        body.append("folder", signedConfig.folder);
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body,
        },
      );

      const payload = await res.json();
      if (!res.ok || !payload?.secure_url) {
        throw new Error(payload?.error?.message || "Image upload failed");
      }

      urls.push(payload.secure_url);
    }

    return urls;
  };

  const addCollection = () => {
    const value = collectionInput.trim();
    if (!value) return;

    startTransition(async () => {
      const res = await fetch("/api/admin/products/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      if (!res.ok) return;
      const payload = await res.json();
      setCollectionList(payload.collections || []);
      setField("collection", value);
      setCollectionInput("");
    });
  };

  const validate = () => {
    if (!product.name.trim()) return "Product name is required";
    if (!product.slug.trim()) return "Slug is required";
    if (!product.price || product.price <= 0) return "Price must be positive";
    if (!product.collection.trim()) return "Collection is required";
    if (!product.shortDescription.trim())
      return "Short description is required";
    if (product.shortDescription.length > 160)
      return "Short description max is 160";
    if (!product.colorVariants.length)
      return "At least one color variant is required";
    if (!product.colorVariants[0].images.length)
      return "At least one product image is required";
    return null;
  };

  const saveProduct = () => {
    const error = validate();
    if (error) {
      setToast(error);
      return;
    }

    startTransition(async () => {
      const endpoint =
        mode === "new"
          ? "/api/admin/products"
          : `/api/admin/products/${product.id}`;
      const method = mode === "new" ? "POST" : "PATCH";
      const payload = product;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setToast(body?.message || "Save failed");
        return;
      }

      const saved = await res.json().catch(() => null);
      setToast("Saved successfully");
      if (mode === "new" && saved?.id) {
        router.push(`/admin/products/${saved.id}/edit`);
        return;
      }
      router.refresh();
    });
  };

  const updateVariant = (
    variantIndex: number,
    updater: (
      current: CatalogProduct["colorVariants"][0],
    ) => CatalogProduct["colorVariants"][0],
  ) => {
    setProduct((prev) => {
      const copy = [...prev.colorVariants];
      copy[variantIndex] = updater(copy[variantIndex]);
      return { ...prev, colorVariants: copy };
    });
  };

  const onImageFiles = async (variantIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const picked = Array.from(files).filter((file) =>
      /image\/(jpeg|png|webp)/.test(file.type),
    );
    if (!picked.length) return;

    try {
      const urls = await uploadToCloudinary(picked.slice(0, 8));
      updateVariant(variantIndex, (variant) => ({
        ...variant,
        images: [...variant.images, ...urls].slice(0, 8),
      }));
      setToast("Images uploaded");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Image upload failed");
    }
  };

  const moveVariantImage = (variantIndex: number, from: number, to: number) => {
    updateVariant(variantIndex, (variant) => {
      if (
        from < 0 ||
        to < 0 ||
        from >= variant.images.length ||
        to >= variant.images.length ||
        from === to
      ) {
        return variant;
      }

      const nextImages = [...variant.images];
      const [moved] = nextImages.splice(from, 1);
      nextImages.splice(to, 0, moved);
      return { ...variant, images: nextImages };
    });
  };

  const deleteCloudinaryImage = async (imageUrl: string) => {
    const res = await fetch("/api/admin/products/cloudinary-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        body?.message || "Failed to delete image from Cloudinary",
      );
    }
  };

  const handleDeleteImage = async (
    variantIndex: number,
    imageIndex: number,
    imageUrl: string,
  ) => {
    const imageKey = `${variantIndex}-${imageIndex}-${imageUrl}`;
    setDeletingImageKey(imageKey);

    try {
      await deleteCloudinaryImage(imageUrl);
      updateVariant(variantIndex, (variant) => ({
        ...variant,
        images: variant.images.filter((_, idx) => idx !== imageIndex),
      }));
      setToast("Image deleted");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Image delete failed");
    } finally {
      setDeletingImageKey("");
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[60%_40%]">
      <div className="space-y-6">
        <div className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
            Basic Info
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={product.name}
              onChange={(e) => {
                const name = e.target.value;
                setField("name", name);
                if (
                  !product.slug ||
                  product.slug === makeSlugFromName(product.name)
                )
                  setField("slug", makeSlugFromName(name));
              }}
              placeholder="Product name"
              className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            />
            <input
              value={product.slug}
              onChange={(e) => setField("slug", e.target.value)}
              placeholder="slug"
              className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            />
            <input
              type="number"
              value={product.price}
              onChange={(e) => setField("price", Number(e.target.value))}
              placeholder="Price EGP"
              className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            />
            <input
              type="number"
              value={product.compareAtPrice || ""}
              onChange={(e) =>
                setField(
                  "compareAtPrice",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="Compare-at price"
              className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <select
              value={product.collection}
              onChange={(e) => setField("collection", e.target.value)}
              className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            >
              {collectionList.map((collection) => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                value={collectionInput}
                onChange={(e) => setCollectionInput(e.target.value)}
                placeholder="Add collection"
                className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
              />
              <button
                type="button"
                onClick={addCollection}
                className="border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase"
              >
                Add
              </button>
            </div>
          </div>
          <textarea
            value={product.shortDescription}
            maxLength={160}
            onChange={(e) => setField("shortDescription", e.target.value)}
            placeholder="Short description (160 max)"
            className="mt-3 h-24 w-full border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <p className="mt-1 text-[11px] text-[#F0EDE8]/45">
            {product.shortDescription.length}/160
          </p>

          <div className="mt-4">
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/55">
              Full Description
            </p>
            <EditorToolbar editor={editor} />
            <div className="min-h-[180px] border border-[#F0EDE8]/20 bg-[#0E0E0E] p-3">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <div className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
            Images & Variants
          </h2>
          <div className="mt-3 space-y-5">
            {product.colorVariants.map((variant, variantIndex) => (
              <div
                key={variant.id}
                className="border border-[#F0EDE8]/12 bg-[#0E0E0E] p-3"
              >
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <input
                    value={variant.colorName}
                    onChange={(e) =>
                      updateVariant(variantIndex, (v) => ({
                        ...v,
                        colorName: e.target.value,
                      }))
                    }
                    placeholder="Color name"
                    className="border border-[#F0EDE8]/20 bg-[#0A0A0A] px-3 py-2"
                  />
                  <input
                    type="color"
                    value={variant.colorHex}
                    onChange={(e) =>
                      updateVariant(variantIndex, (v) => ({
                        ...v,
                        colorHex: e.target.value,
                      }))
                    }
                    className="h-10 w-16 border border-[#F0EDE8]/20 bg-[#0A0A0A]"
                  />
                </div>

                <label className="mt-3 block cursor-pointer border border-dashed border-[#F0EDE8]/25 px-3 py-4 text-center text-xs uppercase tracking-[0.14em] text-[#F0EDE8]/65">
                  Drag/drop or click to upload JPG, PNG, WEBP (max 8)
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onImageFiles(variantIndex, e.target.files)}
                  />
                </label>

                <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#F0EDE8]/45">
                  Reorder images by drag/drop or using arrows.
                </p>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {variant.images.map((image, imageIndex) => (
                    <div
                      key={`${variant.id}-${image}`}
                      className="border border-[#F0EDE8]/15 p-1"
                      draggable
                      onDragStart={(event) =>
                        event.dataTransfer.setData(
                          "text/plain",
                          String(imageIndex),
                        )
                      }
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const from = Number(
                          event.dataTransfer.getData("text/plain"),
                        );
                        if (Number.isNaN(from) || from === imageIndex) return;
                        moveVariantImage(variantIndex, from, imageIndex);
                      }}
                    >
                      <img
                        src={image}
                        alt="Product"
                        className="h-16 w-full object-cover"
                      />
                      <div className="mt-1 grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          disabled={imageIndex === 0}
                          onClick={() =>
                            moveVariantImage(
                              variantIndex,
                              imageIndex,
                              imageIndex - 1,
                            )
                          }
                          className="w-full border border-[#F0EDE8]/20 px-1 py-1 text-[10px] uppercase disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={imageIndex === variant.images.length - 1}
                          onClick={() =>
                            moveVariantImage(
                              variantIndex,
                              imageIndex,
                              imageIndex + 1,
                            )
                          }
                          className="w-full border border-[#F0EDE8]/20 px-1 py-1 text-[10px] uppercase disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          disabled={
                            deletingImageKey ===
                            `${variantIndex}-${imageIndex}-${image}`
                          }
                          onClick={() =>
                            handleDeleteImage(variantIndex, imageIndex, image)
                          }
                          className="w-full border border-[#F0EDE8]/20 px-1 py-1 text-[10px] uppercase disabled:opacity-40"
                        >
                          {deletingImageKey ===
                          `${variantIndex}-${imageIndex}-${image}`
                            ? "..."
                            : "Del"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="uppercase tracking-[0.12em] text-[#F0EDE8]/55">
                      <tr>
                        <th className="py-2 text-left">Size</th>
                        <th className="py-2 text-left">Active</th>
                        <th className="py-2 text-left">Stock</th>
                        <th className="py-2 text-left">SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.map((size) => {
                        const sizeData = variant.sizes[size];
                        return (
                          <tr
                            key={`${variant.id}-${size}`}
                            className="border-t border-[#F0EDE8]/10"
                          >
                            <td className="py-2">{size}</td>
                            <td className="py-2">
                              <input
                                type="checkbox"
                                checked={sizeData.active}
                                onChange={(e) =>
                                  updateVariant(variantIndex, (v) => ({
                                    ...v,
                                    sizes: {
                                      ...v.sizes,
                                      [size]: {
                                        ...v.sizes[size],
                                        active: e.target.checked,
                                      },
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="py-2">
                              <input
                                type="number"
                                value={sizeData.stock}
                                onChange={(e) =>
                                  updateVariant(variantIndex, (v) => ({
                                    ...v,
                                    sizes: {
                                      ...v.sizes,
                                      [size]: {
                                        ...v.sizes[size],
                                        stock: Math.max(
                                          0,
                                          Number(e.target.value || 0),
                                        ),
                                      },
                                    },
                                  }))
                                }
                                className="w-20 border border-[#F0EDE8]/20 bg-[#0A0A0A] px-2 py-1"
                              />
                            </td>
                            <td className="py-2">
                              <input
                                value={sizeData.sku}
                                onChange={(e) =>
                                  updateVariant(variantIndex, (v) => ({
                                    ...v,
                                    sizes: {
                                      ...v.sizes,
                                      [size]: {
                                        ...v.sizes[size],
                                        sku: e.target.value,
                                      },
                                    },
                                  }))
                                }
                                className="w-full border border-[#F0EDE8]/20 bg-[#0A0A0A] px-2 py-1"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setProduct((prev) => ({
                ...prev,
                colorVariants: [
                  ...prev.colorVariants,
                  buildDefaultVariant(
                    prev.id,
                    `Color ${prev.colorVariants.length + 1}`,
                    "#FFFFFF",
                  ),
                ],
              }))
            }
            className="mt-3 border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.16em]"
          >
            + Add Color Variant
          </button>
        </div>

        <div className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
            Product Details
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={product.fabricComposition}
              onChange={(e) => setField("fabricComposition", e.target.value)}
              placeholder="Fabric composition"
              className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            />
            <select
              value={product.fitType}
              onChange={(e) => setField("fitType", e.target.value as FitType)}
              className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            >
              <option value="Boxy">Boxy</option>
              <option value="Oversized">Oversized</option>
              <option value="Regular">Regular</option>
            </select>
            <textarea
              value={product.careInstructions}
              onChange={(e) => setField("careInstructions", e.target.value)}
              placeholder="Care instructions"
              className="md:col-span-2 h-24 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            />
            <input
              type="number"
              value={product.weightGsm}
              onChange={(e) =>
                setField("weightGsm", Number(e.target.value || 0))
              }
              placeholder="Weight GSM"
              className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            />
          </div>
        </div>

        <div className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
          <button
            type="button"
            onClick={() => setSeoOpen((v) => !v)}
            className="w-full text-left text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65"
          >
            SEO {seoOpen ? "-" : "+"}
          </button>
          {seoOpen ? (
            <div className="mt-3 grid gap-3">
              <input
                value={product.metaTitle}
                onChange={(e) => setField("metaTitle", e.target.value)}
                placeholder="Meta title"
                className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
              />
              <textarea
                value={product.metaDescription}
                onChange={(e) => setField("metaDescription", e.target.value)}
                placeholder="Meta description"
                className="h-20 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
              />
              <input
                value={product.mainImageAlt}
                onChange={(e) => setField("mainImageAlt", e.target.value)}
                placeholder="Main image alt text"
                className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
              />
            </div>
          ) : null}
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
            Visibility
          </h3>
          <div className="mt-3 space-y-2 text-xs uppercase tracking-[0.14em]">
            <label className="flex items-center justify-between">
              <span>Active</span>
              <input
                type="checkbox"
                checked={product.active}
                onChange={(e) => setField("active", e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Featured</span>
              <input
                type="checkbox"
                checked={product.featured}
                onChange={(e) => setField("featured", e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between">
              <span>New Arrival</span>
              <input
                type="checkbox"
                checked={product.newArrival}
                onChange={(e) => setField("newArrival", e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
            Pricing
          </h3>
          <p className="mt-2 text-lg font-medium">{product.price} EGP</p>
          <input
            value={productionCost}
            onChange={(e) => setProductionCost(e.target.value)}
            placeholder="Production cost"
            className="mt-3 w-full border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#F0EDE8]/60">
            Gross margin: {margin === null ? "-" : `${margin.toFixed(1)}%`}
          </p>
        </div>

        {mode === "edit" && quickStats ? (
          <div className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
              Quick Stats
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <p>Total units sold: {quickStats.totalUnitsSold}</p>
              <p>
                Revenue generated: {Math.round(quickStats.revenueGenerated)} EGP
              </p>
              <p>Most ordered size: {quickStats.mostOrderedSize}</p>
              <p>Average rating: {quickStats.averageRating}</p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={pending}
          onClick={saveProduct}
          className="w-full bg-[#F0EDE8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black disabled:opacity-60"
        >
          {pending ? "Saving..." : "SAVE PRODUCT"}
        </button>

        {toast ? (
          <p className="text-center text-xs uppercase tracking-[0.14em] text-[#F0EDE8]/65">
            {toast}
          </p>
        ) : null}
      </aside>
    </section>
  );
}
