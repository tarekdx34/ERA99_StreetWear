"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { egyptGovernorates } from "@/lib/governorates";
import { formatEGP, isEgyptPhone } from "@/lib/utils";
import { CardIcon, CashIcon, LockIcon } from "@/components/icons";
import { csrfFetch } from "@/hooks/use-csrf";

type FormState = {
  customerName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  building: string;
  notes: string;
};

type Errors = Partial<Record<keyof FormState | "items", string>>;

const baseDelivery = 75;

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const { track } = useMetaPixel();

  const [form, setForm] = useState<FormState>({
    customerName: "",
    phone: "",
    governorate: "",
    city: "",
    address: "",
    building: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [errors, setErrors] = useState<Errors>({});
  const [processing, setProcessing] = useState(false);

  const deliveryFee = useMemo(
    () => (form.governorate === "Alexandria" ? 0 : baseDelivery),
    [form.governorate],
  );
  const total = subtotal + deliveryFee;

  const paymentError =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("error") ===
      "payment_failed";

  useEffect(() => {
    trackEvent("begin_checkout", {
      value: subtotal,
      currency: "EGP",
      num_items: items.reduce((sum, item) => sum + item.qty, 0),
    });
    track("InitiateCheckout", {
      value: subtotal,
      num_items: items.reduce((sum, item) => sum + item.qty, 0),
      currency: "EGP",
    });
  }, []);

  useEffect(() => {
    const prefill = async () => {
      try {
        const res = await fetch("/api/account/addresses", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data.addresses) ? data.addresses : [];
        const defaultAddress = list.find((address: any) => address.isDefault);
        if (!defaultAddress) return;

        setForm((prev) => {
          if (prev.address || prev.city || prev.governorate || prev.phone || prev.customerName) {
            return prev;
          }
          return {
            ...prev,
            customerName: `${defaultAddress.firstName} ${defaultAddress.lastName}`.trim(),
            phone: defaultAddress.phone || "",
            governorate: defaultAddress.governorate || "",
            city: defaultAddress.city || "",
            address: defaultAddress.street || "",
            building: defaultAddress.building || "",
          };
        });
      } catch {
        // Ignore prefill failures for guests.
      }
    };

    prefill();
  }, []);

  const setField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const next: Errors = {};
    if (!items.length) next.items = "Your cart is empty.";
    if (!form.customerName.trim()) next.customerName = "Name is required.";
    if (!isEgyptPhone(form.phone.trim()))
      next.phone =
        "Use valid Egyptian mobile number (010/011/012/015 + 8 digits).";
    if (!form.governorate) next.governorate = "Governorate is required.";
    if (!form.city.trim()) next.city = "City / District is required.";
    if (!form.address.trim()) next.address = "Street address is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setProcessing(true);

    const payload = {
      ...form,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
    };

    try {
      if (paymentMethod === "COD") {
        const res = await csrfFetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create order");
        const data = (await res.json()) as { orderId: number };

        try {
          const addressesRes = await fetch("/api/account/addresses", {
            cache: "no-store",
          });
          if (addressesRes.ok) {
            const addressesData = await addressesRes.json();
            const list = Array.isArray(addressesData.addresses)
              ? addressesData.addresses
              : [];
            const exists = list.some(
              (address: any) =>
                String(address.governorate || "").toLowerCase() ===
                  form.governorate.toLowerCase() &&
                String(address.city || "").toLowerCase() ===
                  form.city.toLowerCase() &&
                String(address.street || "").toLowerCase() ===
                  form.address.toLowerCase(),
            );

            if (!exists) {
              const save = window.confirm(
                "Save this address to your account?",
              );
              if (save) {
                const [firstName, ...rest] = form.customerName.trim().split(" ");
                const lastName = rest.join(" ");
                await csrfFetch("/api/account/addresses", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    firstName: firstName || "Customer",
                    lastName: lastName || "",
                    phone: form.phone,
                    governorate: form.governorate,
                    city: form.city,
                    street: form.address,
                    building: form.building,
                  }),
                });
              }
            }
          }
        } catch {
          // Ignore optional saved-address prompt failures.
        }

        clear();
        router.push(`/order-confirmation/${data.orderId}`);
        return;
      }

      const paymentRes = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!paymentRes.ok) throw new Error("Payment creation failed");
      const paymentData = (await paymentRes.json()) as { redirectUrl: string };
      router.push(paymentData.redirectUrl);
    } catch {
      setErrors((prev) => ({
        ...prev,
        items: "Unable to place order right now. Please try again.",
      }));
      setProcessing(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await placeOrder();
  };

  const inputBase =
    "h-12 w-full border border-[#F0EDE8]/20 bg-[#111111] px-3 text-sm text-[#F0EDE8] placeholder:text-[#F0EDE8]/40 focus:border-[#F0EDE8] focus:outline-none";

  return (
    <main className="bg-[#080808] px-6 pb-28 pt-28 md:px-10 md:pb-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[60%_40%]">
        <form onSubmit={submit} className="space-y-10">
          {paymentError ? (
            <div className="border border-[#8B0000] bg-[#8B0000]/10 p-3 text-xs">
              Payment failed. Please retry or choose Cash on Delivery.
            </div>
          ) : null}
          {errors.items ? (
            <p className="text-xs text-[#8B0000]">{errors.items}</p>
          ) : null}

          <section>
            <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/60">
              YOUR DETAILS
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <input
                  className={`${inputBase} ${errors.customerName ? "border-[#8B0000]" : ""}`}
                  placeholder="Full name"
                  value={form.customerName}
                  onChange={(e) => setField("customerName", e.target.value)}
                />
                {errors.customerName ? (
                  <p className="mt-1 text-[12px] text-[#8B0000]">
                    {errors.customerName}
                  </p>
                ) : null}
              </div>
              <div>
                <input
                  className={`${inputBase} ${errors.phone ? "border-[#8B0000]" : ""}`}
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) =>
                    setField(
                      "phone",
                      e.target.value.replace(/\D/g, "").slice(0, 11),
                    )
                  }
                />
                {errors.phone ? (
                  <p className="mt-1 text-[12px] text-[#8B0000]">
                    {errors.phone}
                  </p>
                ) : form.phone.length === 11 ? (
                  <p className="mt-1 text-[12px] text-[#F0EDE8]/55">✓ Valid</p>
                ) : null}
              </div>
              <div>
                <select
                  className={`${inputBase} ${errors.governorate ? "border-[#8B0000]" : ""}`}
                  value={form.governorate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setField("governorate", value);
                    if (value) {
                      trackEvent("add_shipping_info", {
                        shipping_tier: value === "Alexandria" ? "Alexandria" : "Standard",
                        value: total,
                      });
                    }
                  }}
                >
                  <option value="">Governorate</option>
                  {egyptGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
                {errors.governorate ? (
                  <p className="mt-1 text-[12px] text-[#8B0000]">
                    {errors.governorate}
                  </p>
                ) : null}
              </div>

              {form.governorate ? (
                <div className="md:col-span-2">
                  <input
                    className={`${inputBase} ${errors.city ? "border-[#8B0000]" : ""}`}
                    placeholder="City / District"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                  {errors.city ? (
                    <p className="mt-1 text-[12px] text-[#8B0000]">
                      {errors.city}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="md:col-span-2">
                <input
                  className={`${inputBase} ${errors.address ? "border-[#8B0000]" : ""}`}
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                />
                {errors.address ? (
                  <p className="mt-1 text-[12px] text-[#8B0000]">
                    {errors.address}
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <input
                  className={inputBase}
                  placeholder="Building & apartment"
                  value={form.building}
                  onChange={(e) => setField("building", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <textarea
                  className="min-h-28 w-full border border-[#F0EDE8]/20 bg-[#111111] px-3 py-3 text-sm text-[#F0EDE8] placeholder:text-[#F0EDE8]/40 focus:border-[#F0EDE8] focus:outline-none"
                  placeholder="Any special instructions for your order?"
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/60">
              DELIVERY METHOD
            </h2>
            <div className="border border-[#F0EDE8]/20 bg-[#111111] p-4 text-sm">
              {form.governorate === "Alexandria" ? (
                <p>
                  Alexandria Delivery — 1 to 2 days —{" "}
                  <span className="text-[#8B0000]">FREE</span>
                </p>
              ) : (
                <p>
                  Standard Delivery — 2 to 5 business days —{" "}
                  {formatEGP(baseDelivery)}
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/60">
              PAYMENT METHOD
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("COD");
                  trackEvent("add_payment_info", { payment_type: "COD" });
                  track("AddPaymentInfo", { payment_type: "COD" });
                }}
                className={`border p-4 text-left ${paymentMethod === "COD" ? "border-[#8B0000] bg-[#8B0000]/10" : "border-[#F0EDE8]/20 bg-[#111111]"}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <CashIcon />{" "}
                  <span className="text-xs uppercase tracking-[0.14em]">
                    CASH ON DELIVERY
                  </span>
                </div>
                <p className="text-sm text-[#F0EDE8]/70">
                  Pay when your order arrives.
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("ONLINE");
                  trackEvent("add_payment_info", { payment_type: "Online" });
                  track("AddPaymentInfo", { payment_type: "Online" });
                }}
                className={`border p-4 text-left ${paymentMethod === "ONLINE" ? "border-[#8B0000] bg-[#8B0000]/10" : "border-[#F0EDE8]/20 bg-[#111111]"}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <CardIcon />{" "}
                  <span className="text-xs uppercase tracking-[0.14em]">
                    ONLINE PAYMENT
                  </span>
                </div>
                <p className="text-sm text-[#F0EDE8]/70">
                  Visa / Mastercard via Paymob.
                </p>
              </button>
            </div>
            <p className="mt-3 text-xs text-[#F0EDE8]/60">
              {paymentMethod === "COD"
                ? "Our team will call to confirm your order before shipping."
                : "You will be redirected to our secure payment page."}
            </p>
          </section>
        </form>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="border border-[#F0EDE8]/18 bg-[#111111] p-6">
            <h3 className="text-sm uppercase tracking-[0.16em]">
              ORDER SUMMARY
            </h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="grid grid-cols-[52px_1fr_auto] gap-3 border-b border-[#F0EDE8]/10 pb-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-13 w-13 object-cover"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em]">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-[#F0EDE8]/60">
                      {item.color} / {item.size} / x{item.qty}
                    </p>
                  </div>
                  <p className="text-xs">
                    {formatEGP(item.unitPrice * item.qty)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-[#F0EDE8]/15 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#F0EDE8]/70">Subtotal</span>
                <span>{formatEGP(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F0EDE8]/70">Delivery</span>
                <span>
                  {deliveryFee === 0 ? "FREE" : formatEGP(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatEGP(total)}</span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={processing}
              className="mt-5 w-full bg-[#F0EDE8] px-4 py-3 text-[18px] font-bold uppercase tracking-[0.12em] text-black disabled:opacity-60"
            >
              {processing ? (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  PROCESSING...
                </motion.span>
              ) : (
                "PLACE ORDER →"
              )}
            </button>
            <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-[#F0EDE8]/55">
              <LockIcon />
              Secure checkout
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#F0EDE8]/15 bg-[#080808] p-3 lg:hidden">
        <button
          onClick={placeOrder}
          disabled={processing}
          className="w-full bg-[#F0EDE8] px-4 py-3 text-base font-bold uppercase tracking-[0.12em] text-black disabled:opacity-60"
        >
          {processing ? "PROCESSING..." : `PLACE ORDER → ${formatEGP(total)}`}
        </button>
      </div>
    </main>
  );
}
