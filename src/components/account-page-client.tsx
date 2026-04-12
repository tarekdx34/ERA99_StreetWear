"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatEGP } from "@/lib/utils";

type Profile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: string;
};

type Address = {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
  building: string | null;
  isDefault: boolean;
};

type Order = {
  id: number;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  items: any;
  total: number;
  createdAt: string;
};

export function AccountPageClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [nameForm, setNameForm] = useState({ firstName: "", lastName: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [emailForm, setEmailForm] = useState({ email: "", currentPassword: "" });
  const [addressForm, setAddressForm] = useState({
    label: "",
    firstName: "",
    lastName: "",
    phone: "",
    governorate: "",
    city: "",
    street: "",
    building: "",
    isDefault: false,
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const memberSince = useMemo(() => {
    if (!profile?.createdAt) return "";
    return new Date(profile.createdAt).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }, [profile?.createdAt]);

  const refreshAll = async () => {
    const [profileRes, ordersRes, addressesRes] = await Promise.all([
      fetch("/api/account/profile", { cache: "no-store" }),
      fetch("/api/account/orders", { cache: "no-store" }),
      fetch("/api/account/addresses", { cache: "no-store" }),
    ]);

    if (profileRes.status === 401) {
      router.push("/auth/login?next=/account");
      return;
    }

    const profileData = await profileRes.json().catch(() => ({}));
    const ordersData = ordersRes.ok
      ? await ordersRes.json().catch(() => ({}))
      : {};
    const addressesData = addressesRes.ok
      ? await addressesRes.json().catch(() => ({}))
      : {};

    setProfile(profileData.user || null);
    setOrders(ordersData.orders || []);
    setAddresses(addressesData.addresses || []);

    if (profileData.user) {
      setNameForm({
        firstName: profileData.user.firstName || "",
        lastName: profileData.user.lastName || "",
      });
      setEmailForm((prev) => ({ ...prev, email: profileData.user.email || "" }));
    }
  };

  useEffect(() => {
    refreshAll().finally(() => setLoading(false));
  }, []);

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nameForm),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message || "Failed to update profile.");
      return;
    }

    setMessage("Profile updated.");
    await refreshAll();
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setMessage(data.message || (res.ok ? "Password updated." : "Failed to update password."));
    if (res.ok) {
      setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" });
      await signOut({ redirect: false });
      router.push("/auth/login?message=password-updated");
    }
  };

  const changeEmail = async (event: FormEvent) => {
    event.preventDefault();
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailForm.email.trim().toLowerCase(),
        currentPassword: emailForm.currentPassword,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(data.message || (res.ok ? "Email updated. Verify your new email." : "Email update failed."));
    if (res.ok) {
      setEmailForm((prev) => ({ ...prev, currentPassword: "" }));
      await refreshAll();
    }
  };

  const addAddress = async (event: FormEvent) => {
    event.preventDefault();
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });

    const data = await res.json().catch(() => ({}));
    setMessage(data.message || (res.ok ? "Address saved." : "Address save failed."));

    if (res.ok) {
      setAddressForm({
        label: "",
        firstName: "",
        lastName: "",
        phone: "",
        governorate: "",
        city: "",
        street: "",
        building: "",
        isDefault: false,
      });
      await refreshAll();
    }
  };

  const setDefaultAddress = async (id: string) => {
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message || "Unable to update default address.");
      return;
    }

    setMessage("Default address updated.");
    await refreshAll();
  };

  const deleteAddress = async (id: string) => {
    const confirmed = window.confirm("Delete this address?");
    if (!confirmed) return;

    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message || "Unable to delete address.");
      return;
    }

    setMessage("Address deleted.");
    await refreshAll();
  };

  const reorder = async (orderId: number) => {
    const res = await fetch("/api/account/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message || "Unable to reorder these items.");
      return;
    }

    setMessage("Items added to cart.");
  };

  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault();
    const confirmed = window.confirm(
      "This will permanently delete your account and data. Continue?",
    );
    if (!confirmed) return;

    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "Unable to delete account.");
      setDeletePassword("");
      return;
    }

    setDeletePassword("");
    await signOut({ redirect: false });
    router.push("/");
  };

  if (loading) {
    return <main className="px-6 pb-20 pt-28">Loading account...</main>;
  }

  return (
    <main className="bg-[#080808] px-6 pb-20 pt-28 text-[#F0EDE8] md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-2xl uppercase tracking-[0.18em]">My Account</h1>

        {message ? (
          <div className="border border-[#F0EDE8]/25 bg-[#111111] p-3 text-sm">{message}</div>
        ) : null}

        <section className="border border-[#F0EDE8]/15 bg-[#111111] p-5">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#F0EDE8]/65">Profile</h2>
          <p className="mt-2 text-sm">Email: {profile?.email}</p>
          <p className="text-sm text-[#F0EDE8]/70">Member since: {memberSince}</p>

          <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={saveName}>
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" value={nameForm.firstName} onChange={(e) => setNameForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="First name" />
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" value={nameForm.lastName} onChange={(e) => setNameForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Last name" />
            <button className="h-12 border border-[#F0EDE8] bg-[#F0EDE8] text-[#080808] text-xs uppercase tracking-[0.16em] md:col-span-2">Save name</button>
          </form>

          <form className="mt-6 space-y-3" onSubmit={changePassword}>
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Change password</p>
            <input type="password" className="h-12 w-full border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="Current password" />
            <input type="password" className="h-12 w-full border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" value={passwordForm.password} onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))} placeholder="New password" />
            <input type="password" className="h-12 w-full border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
            <button className="h-12 w-full border border-[#F0EDE8]/35 text-xs uppercase tracking-[0.16em]">Update password</button>
          </form>

          <form className="mt-6 space-y-3" onSubmit={changeEmail}>
            <p className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">Change email</p>
            <input className="h-12 w-full border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" value={emailForm.email} onChange={(e) => setEmailForm((p) => ({ ...p, email: e.target.value }))} placeholder="New email" />
            <input type="password" className="h-12 w-full border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" value={emailForm.currentPassword} onChange={(e) => setEmailForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="Confirm with current password" />
            <button className="h-12 w-full border border-[#F0EDE8]/35 text-xs uppercase tracking-[0.16em]">Update email</button>
          </form>
        </section>

        <section className="border border-[#F0EDE8]/15 bg-[#111111] p-5">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#F0EDE8]/65">Order History</h2>
          <div className="mt-4 space-y-3">
            {orders.length === 0 ? <p className="text-sm text-[#F0EDE8]/60">No orders yet.</p> : null}
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <div key={order.id} className="border border-[#F0EDE8]/10 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.14em]">{order.orderNumber}</p>
                    <p className="text-xs text-[#F0EDE8]/65">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="border border-[#F0EDE8]/25 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-[#F0EDE8]/65">{order.paymentStatus}</span>
                  </div>
                  <p className="mt-2 text-sm">{formatEGP(order.total)}</p>
                  <p className="mt-1 text-[12px] text-[#F0EDE8]/60">{items.length} items</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        setExpandedOrderId((prev) => (prev === order.id ? null : order.id))
                      }
                      className="border border-[#F0EDE8]/35 px-3 py-2 text-[11px] uppercase tracking-[0.16em]"
                    >
                      {expandedOrderId === order.id ? "Hide details" : "View details"}
                    </button>
                    <button onClick={() => reorder(order.id)} className="border border-[#F0EDE8]/35 px-3 py-2 text-[11px] uppercase tracking-[0.16em]">Reorder</button>
                  </div>

                  {expandedOrderId === order.id ? (
                    <div className="mt-3 border-t border-[#F0EDE8]/10 pt-3 text-[12px] text-[#F0EDE8]/75">
                      {items.map((item: any, idx: number) => (
                        <p key={`${order.id}-${idx}`}>
                          {item.name} / {item.color} / {item.size} x{item.qty}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="border border-[#F0EDE8]/15 bg-[#111111] p-5">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#F0EDE8]/65">Saved Addresses</h2>

          <div className="mt-4 space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="border border-[#F0EDE8]/10 p-3">
                <p className="text-sm">{address.firstName} {address.lastName} {address.isDefault ? "(Default)" : ""}</p>
                <p className="text-[12px] text-[#F0EDE8]/65">{address.governorate}, {address.city}, {address.street}</p>
                <div className="mt-2 flex gap-2">
                  {!address.isDefault ? <button onClick={() => setDefaultAddress(address.id)} className="border border-[#F0EDE8]/35 px-3 py-1 text-[10px] uppercase">Set default</button> : null}
                  <button onClick={() => deleteAddress(address.id)} className="border border-[#8B0000]/65 px-3 py-1 text-[10px] uppercase text-[#F0EDE8]">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <form className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={addAddress}>
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" placeholder="Label" value={addressForm.label} onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))} />
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" placeholder="First name" value={addressForm.firstName} onChange={(e) => setAddressForm((p) => ({ ...p, firstName: e.target.value }))} />
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" placeholder="Last name" value={addressForm.lastName} onChange={(e) => setAddressForm((p) => ({ ...p, lastName: e.target.value }))} />
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))} />
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" placeholder="Governorate" value={addressForm.governorate} onChange={(e) => setAddressForm((p) => ({ ...p, governorate: e.target.value }))} />
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} />
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3 md:col-span-2" placeholder="Street" value={addressForm.street} onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))} />
            <input className="h-12 border border-[#F0EDE8]/20 bg-[#0D0D0D] px-3 md:col-span-2" placeholder="Building" value={addressForm.building} onChange={(e) => setAddressForm((p) => ({ ...p, building: e.target.value }))} />
            <label className="md:col-span-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em]">
              <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))} /> Set as default
            </label>
            <button className="h-12 border border-[#F0EDE8] bg-[#F0EDE8] text-[#080808] text-xs uppercase tracking-[0.16em] md:col-span-2">Save address</button>
          </form>
        </section>

        <section className="border border-[#8B0000]/45 bg-[#8B0000]/10 p-5">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#F0EDE8]">Danger Zone</h2>
          <form className="mt-4 space-y-3" onSubmit={deleteAccount}>
            <input type="password" className="h-12 w-full border border-[#8B0000]/70 bg-[#0D0D0D] px-3" placeholder="Enter password to confirm" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
            <button className="h-12 w-full border border-[#8B0000] bg-[#8B0000] text-xs uppercase tracking-[0.18em]">Delete account</button>
          </form>
        </section>
      </div>
    </main>
  );
}
