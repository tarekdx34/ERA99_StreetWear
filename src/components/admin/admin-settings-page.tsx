"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";

type DeliveryFeeRow = {
  governorate: string;
  fee: number;
};

type SettingsModel = {
  storeName: string;
  adminWhatsappNumber: string;
  notificationEmail: string;
  orderNumberPrefix: string;
  currency: "EGP";
  cloudinaryUrl: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappFrom: string;

  freeDeliveryGovernorate: string;
  deliveryFees: DeliveryFeeRow[];
  minimumOrderForFreeDelivery: number;

  whatsappNotificationsEnabled: boolean;
  browserNotificationsEnabled: boolean;
  newOrderSoundEnabled: boolean;
  lowStockAlertThreshold: number;
  lowStockWhatsappAlertEnabled: boolean;

  dashboardPaymentFailureWarningRate: number;
  dashboardPaymentFailureCriticalRate: number;
  dashboardStaleConfirmationWarningCount: number;
  dashboardStaleConfirmationCriticalCount: number;
  dashboardSecurityWarningCount: number;
  dashboardSecurityCriticalCount: number;

  showAnnouncementStrip: boolean;
  announcementStripText: string;
  maintenanceMode: boolean;
};

const EMPTY_SETTINGS: SettingsModel = {
  storeName: "",
  adminWhatsappNumber: "",
  notificationEmail: "",
  orderNumberPrefix: "99",
  currency: "EGP",
  cloudinaryUrl: "",
  twilioAccountSid: "",
  twilioAuthToken: "",
  twilioWhatsappFrom: "",

  freeDeliveryGovernorate: "Alexandria",
  deliveryFees: [],
  minimumOrderForFreeDelivery: 0,

  whatsappNotificationsEnabled: true,
  browserNotificationsEnabled: true,
  newOrderSoundEnabled: true,
  lowStockAlertThreshold: 10,
  lowStockWhatsappAlertEnabled: true,

  dashboardPaymentFailureWarningRate: 10,
  dashboardPaymentFailureCriticalRate: 18,
  dashboardStaleConfirmationWarningCount: 4,
  dashboardStaleConfirmationCriticalCount: 10,
  dashboardSecurityWarningCount: 6,
  dashboardSecurityCriticalCount: 15,

  showAnnouncementStrip: true,
  announcementStripText: "",
  maintenanceMode: false,
};

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsModel>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [securityNotice, setSecurityNotice] = useState("");

  const [totpQr, setTotpQr] = useState("");
  const [totpManualKey, setTotpManualKey] = useState("");
  const [totpCode, setTotpCode] = useState("");

  const [sessions, setSessions] = useState<
    Array<{ ip: string; username: string | null; lastSeen: string }>
  >([]);
  const [loginAttempts, setLoginAttempts] = useState<
    Array<{ id: number; ip: string; success: boolean; createdAt: string }>
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, sessionsRes] = await Promise.all([
          fetch("/api/admin/settings", { cache: "no-store" }),
          fetch("/api/admin/settings/security/sessions", { cache: "no-store" }),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data);
        }

        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(
            (data.activeSessions || []).map((item: any) => ({
              ...item,
              lastSeen: item.lastSeen,
            })),
          );
          setLoginAttempts(
            (data.loginAttempts || []).map((item: any) => ({
              ...item,
              createdAt: item.createdAt,
            })),
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const setField = <K extends keyof SettingsModel>(
    key: K,
    value: SettingsModel[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setNotice("");
  };

  const saveAll = () => {
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setNotice(body?.message || "Failed to save settings");
        return;
      }

      const updated = await res.json();
      setSettings(updated);
      setNotice("Settings saved.");
    });
  };

  const testWhatsapp = () => {
    startTransition(async () => {
      const res = await fetch("/api/admin/settings/test-whatsapp", {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setNotice(body?.message || "Failed to send test WhatsApp");
        return;
      }
      setNotice("Test WhatsApp sent.");
    });
  };

  const addDeliveryRow = () => {
    setField("deliveryFees", [
      ...settings.deliveryFees,
      { governorate: "", fee: 0 },
    ]);
  };

  const removeDeliveryRow = (index: number) => {
    setField(
      "deliveryFees",
      settings.deliveryFees.filter((_, idx) => idx !== index),
    );
  };

  const updateDeliveryRow = (index: number, row: Partial<DeliveryFeeRow>) => {
    setField(
      "deliveryFees",
      settings.deliveryFees.map((item, idx) =>
        idx === index ? { ...item, ...row } : item,
      ),
    );
  };

  const submitChangePassword = (event: FormEvent) => {
    event.preventDefault();
    setSecurityNotice("");

    startTransition(async () => {
      const res = await fetch("/api/admin/settings/security/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSecurityNotice(body?.message || "Failed to change password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setSecurityNotice("Password updated. All sessions invalidated.");
    });
  };

  const startRegenerate2fa = () => {
    setSecurityNotice("");
    startTransition(async () => {
      const res = await fetch("/api/admin/settings/security/2fa/regenerate", {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSecurityNotice(body?.message || "Failed to generate new 2FA secret");
        return;
      }

      setTotpQr(body.qrDataUrl || "");
      setTotpManualKey(body.manualKey || "");
      setSecurityNotice("Scan the new QR, then confirm with current 2FA code.");
    });
  };

  const confirmRegenerate2fa = () => {
    setSecurityNotice("");
    startTransition(async () => {
      const res = await fetch("/api/admin/settings/security/2fa/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-settings-action": "confirm",
        },
        body: JSON.stringify({ code: totpCode }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSecurityNotice(
          body?.message || "Failed to confirm 2FA regeneration",
        );
        return;
      }

      setTotpCode("");
      setTotpQr("");
      setTotpManualKey("");
      setSecurityNotice("2FA secret regenerated and all sessions invalidated.");
    });
  };

  const invalidateAllSessions = () => {
    startTransition(async () => {
      const res = await fetch("/api/admin/settings/security/sessions", {
        method: "POST",
      });
      if (!res.ok) {
        setSecurityNotice("Failed to invalidate sessions");
        return;
      }
      setSecurityNotice("All sessions invalidated.");
    });
  };

  const reloadSecurityData = () => {
    startTransition(async () => {
      const res = await fetch("/api/admin/settings/security/sessions", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const body = await res.json();
      setSessions(
        (body.activeSessions || []).map((item: any) => ({
          ...item,
          lastSeen: item.lastSeen,
        })),
      );
      setLoginAttempts(
        (body.loginAttempts || []).map((item: any) => ({
          ...item,
          createdAt: item.createdAt,
        })),
      );
    });
  };

  const deliveryRows = useMemo(
    () => settings.deliveryFees,
    [settings.deliveryFees],
  );

  if (loading) {
    return <p className="text-sm text-[#F0EDE8]/70">Loading settings...</p>;
  }

  return (
    <section className="space-y-6">
      <h1 className="font-blackletter text-5xl">SETTINGS</h1>

      <section className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Store
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            value={settings.storeName}
            onChange={(e) => setField("storeName", e.target.value)}
            placeholder="Store name"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <input
            value={settings.adminWhatsappNumber}
            onChange={(e) => setField("adminWhatsappNumber", e.target.value)}
            placeholder="Admin WhatsApp number"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <input
            value={settings.notificationEmail}
            onChange={(e) => setField("notificationEmail", e.target.value)}
            placeholder="Notification email"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <input
            value={settings.orderNumberPrefix}
            onChange={(e) => setField("orderNumberPrefix", e.target.value)}
            placeholder="Order number prefix"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <input
            value={settings.currency}
            disabled
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2 text-[#F0EDE8]/60"
          />
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/55">
          External APIs
        </p>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <input
            value={settings.cloudinaryUrl}
            onChange={(e) => setField("cloudinaryUrl", e.target.value)}
            placeholder="Cloudinary URL (cloudinary://API_KEY:API_SECRET@CLOUD_NAME)"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            autoComplete="off"
          />
          <input
            value={settings.twilioAccountSid}
            onChange={(e) => setField("twilioAccountSid", e.target.value)}
            placeholder="Twilio account SID"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <input
            value={settings.twilioAuthToken}
            onChange={(e) => setField("twilioAuthToken", e.target.value)}
            placeholder="Twilio auth token"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <input
            value={settings.twilioWhatsappFrom}
            onChange={(e) => setField("twilioWhatsappFrom", e.target.value)}
            placeholder="Twilio WhatsApp from (whatsapp:+...)"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2 md:col-span-2"
          />
        </div>
      </section>

      <section className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Delivery & Pricing
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            value={settings.freeDeliveryGovernorate}
            onChange={(e) =>
              setField("freeDeliveryGovernorate", e.target.value)
            }
            placeholder="Free delivery governorate"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <input
            type="number"
            value={settings.minimumOrderForFreeDelivery}
            onChange={(e) =>
              setField(
                "minimumOrderForFreeDelivery",
                Number(e.target.value || 0),
              )
            }
            placeholder="Minimum order for free delivery"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
        </div>

        <div className="mt-4 space-y-2">
          {deliveryRows.map((row, index) => (
            <div
              key={`${row.governorate}-${index}`}
              className="grid gap-2 md:grid-cols-[1fr_auto_auto]"
            >
              <input
                value={row.governorate}
                onChange={(e) =>
                  updateDeliveryRow(index, { governorate: e.target.value })
                }
                placeholder="Governorate"
                className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
              />
              <input
                type="number"
                value={row.fee}
                onChange={(e) =>
                  updateDeliveryRow(index, { fee: Number(e.target.value || 0) })
                }
                placeholder="Fee"
                className="w-32 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
              />
              <button
                type="button"
                onClick={() => removeDeliveryRow(index)}
                className="border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.14em]"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDeliveryRow}
            className="border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.14em]"
          >
            Add Row
          </button>
        </div>
      </section>

      <section className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Notifications
        </h2>
        <div className="mt-3 grid gap-2 text-sm">
          <label className="flex items-center justify-between">
            <span>WhatsApp notifications</span>
            <input
              type="checkbox"
              checked={settings.whatsappNotificationsEnabled}
              onChange={(e) =>
                setField("whatsappNotificationsEnabled", e.target.checked)
              }
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Browser notifications</span>
            <input
              type="checkbox"
              checked={settings.browserNotificationsEnabled}
              onChange={(e) =>
                setField("browserNotificationsEnabled", e.target.checked)
              }
            />
          </label>
          <label className="flex items-center justify-between">
            <span>New order sound</span>
            <input
              type="checkbox"
              checked={settings.newOrderSoundEnabled}
              onChange={(e) =>
                setField("newOrderSoundEnabled", e.target.checked)
              }
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Low stock WhatsApp alert</span>
            <input
              type="checkbox"
              checked={settings.lowStockWhatsappAlertEnabled}
              onChange={(e) =>
                setField("lowStockWhatsappAlertEnabled", e.target.checked)
              }
            />
          </label>
          <div className="flex items-center justify-between">
            <span>Low stock threshold</span>
            <input
              type="number"
              value={settings.lowStockAlertThreshold}
              onChange={(e) =>
                setField("lowStockAlertThreshold", Number(e.target.value || 1))
              }
              className="w-24 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={testWhatsapp}
          className="mt-3 border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.14em]"
        >
          Send Test WhatsApp
        </button>
      </section>

      <section className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Dashboard Alert Rules
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex items-center justify-between gap-3 border border-[#F0EDE8]/12 bg-[#151515] px-3 py-2 text-sm">
            <span>Payment failure warning (%)</span>
            <input
              type="number"
              min={1}
              value={settings.dashboardPaymentFailureWarningRate}
              onChange={(e) =>
                setField(
                  "dashboardPaymentFailureWarningRate",
                  Number(e.target.value || 1),
                )
              }
              className="w-24 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-2 py-1"
            />
          </label>
          <label className="flex items-center justify-between gap-3 border border-[#F0EDE8]/12 bg-[#151515] px-3 py-2 text-sm">
            <span>Payment failure critical (%)</span>
            <input
              type="number"
              min={1}
              value={settings.dashboardPaymentFailureCriticalRate}
              onChange={(e) =>
                setField(
                  "dashboardPaymentFailureCriticalRate",
                  Number(e.target.value || 1),
                )
              }
              className="w-24 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-2 py-1"
            />
          </label>
          <label className="flex items-center justify-between gap-3 border border-[#F0EDE8]/12 bg-[#151515] px-3 py-2 text-sm">
            <span>Stale confirmation warning count</span>
            <input
              type="number"
              min={1}
              value={settings.dashboardStaleConfirmationWarningCount}
              onChange={(e) =>
                setField(
                  "dashboardStaleConfirmationWarningCount",
                  Number(e.target.value || 1),
                )
              }
              className="w-24 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-2 py-1"
            />
          </label>
          <label className="flex items-center justify-between gap-3 border border-[#F0EDE8]/12 bg-[#151515] px-3 py-2 text-sm">
            <span>Stale confirmation critical count</span>
            <input
              type="number"
              min={1}
              value={settings.dashboardStaleConfirmationCriticalCount}
              onChange={(e) =>
                setField(
                  "dashboardStaleConfirmationCriticalCount",
                  Number(e.target.value || 1),
                )
              }
              className="w-24 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-2 py-1"
            />
          </label>
          <label className="flex items-center justify-between gap-3 border border-[#F0EDE8]/12 bg-[#151515] px-3 py-2 text-sm">
            <span>Security warning count</span>
            <input
              type="number"
              min={1}
              value={settings.dashboardSecurityWarningCount}
              onChange={(e) =>
                setField(
                  "dashboardSecurityWarningCount",
                  Number(e.target.value || 1),
                )
              }
              className="w-24 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-2 py-1"
            />
          </label>
          <label className="flex items-center justify-between gap-3 border border-[#F0EDE8]/12 bg-[#151515] px-3 py-2 text-sm">
            <span>Security critical count</span>
            <input
              type="number"
              min={1}
              value={settings.dashboardSecurityCriticalCount}
              onChange={(e) =>
                setField(
                  "dashboardSecurityCriticalCount",
                  Number(e.target.value || 1),
                )
              }
              className="w-24 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-2 py-1"
            />
          </label>
        </div>
      </section>

      <section className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Security
        </h2>

        <form
          onSubmit={submitChangePassword}
          className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 8)"
            className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <button
            type="submit"
            className="border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.14em]"
          >
            Change
          </button>
        </form>

        <div className="mt-4 border-t border-[#F0EDE8]/10 pt-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/55">
            Regenerate 2FA Secret
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={startRegenerate2fa}
              className="border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.14em]"
            >
              Generate New QR
            </button>
            <input
              value={totpCode}
              onChange={(e) =>
                setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Current 2FA code"
              className="w-40 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
            />
            <button
              type="button"
              onClick={confirmRegenerate2fa}
              className="border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.14em]"
            >
              Confirm
            </button>
          </div>

          {totpQr ? (
            <img
              src={totpQr}
              alt="New 2FA QR"
              className="mt-3 h-44 w-44 border border-[#F0EDE8]/15 bg-white p-2"
            />
          ) : null}
          {totpManualKey ? (
            <p className="mt-2 break-all text-xs text-[#F0EDE8]/65">
              {totpManualKey}
            </p>
          ) : null}
        </div>

        <div className="mt-4 border-t border-[#F0EDE8]/10 pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={invalidateAllSessions}
              className="border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.14em]"
            >
              Invalidate All Sessions
            </button>
            <button
              type="button"
              onClick={reloadSecurityData}
              className="border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.14em]"
            >
              Refresh
            </button>
          </div>

          <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/55">
            Active Sessions (snapshot)
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {sessions.map((session) => (
              <li
                key={`${session.ip}-${session.lastSeen}`}
                className="border-b border-[#F0EDE8]/10 pb-1"
              >
                {session.ip} - {session.username || "admin"} -{" "}
                {new Date(session.lastSeen).toLocaleString("en-GB")}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/55">
            Last 20 Login Attempts
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="uppercase tracking-[0.12em] text-[#F0EDE8]/55">
                <tr>
                  <th className="py-2 pr-3">IP</th>
                  <th className="py-2 pr-3">Timestamp</th>
                  <th className="py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {loginAttempts.map((item) => (
                  <tr key={item.id} className="border-t border-[#F0EDE8]/10">
                    <td className="py-2 pr-3">{item.ip}</td>
                    <td className="py-2 pr-3">
                      {new Date(item.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td className="py-2">
                      {item.success ? "Success" : "Fail"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {securityNotice ? (
          <p className="mt-3 text-xs text-[#F0EDE8]/70">{securityNotice}</p>
        ) : null}
      </section>

      <section className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          Appearance
        </h2>
        <div className="mt-3 grid gap-2 text-sm">
          <label className="flex items-center justify-between">
            <span>Show announcement strip</span>
            <input
              type="checkbox"
              checked={settings.showAnnouncementStrip}
              onChange={(e) =>
                setField("showAnnouncementStrip", e.target.checked)
              }
            />
          </label>
          <textarea
            value={settings.announcementStripText}
            onChange={(e) => setField("announcementStripText", e.target.value)}
            placeholder="Announcement strip text"
            className="h-20 border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2"
          />
          <label className="flex items-center justify-between">
            <span>Maintenance mode</span>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setField("maintenanceMode", e.target.checked)}
            />
          </label>
        </div>
      </section>

      <button
        type="button"
        disabled={pending}
        onClick={saveAll}
        className="w-full bg-[#F0EDE8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black disabled:opacity-60"
      >
        {pending ? "Saving..." : "SAVE SETTINGS"}
      </button>

      {notice ? (
        <p className="text-center text-xs uppercase tracking-[0.14em] text-[#F0EDE8]/70">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
