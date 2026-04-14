import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value: string | null | undefined) {
  const str = String(value ?? "");
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseItems(items: unknown) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: any) => ({
      name: String(item?.name ?? "Item"),
      color: String(item?.color ?? "-"),
      size: String(item?.size ?? "-"),
      qty: Number(item?.qty ?? item?.quantity ?? 1),
      unitPrice: Number(item?.unitPrice ?? item?.price ?? 0),
    }))
    .filter((item: any) => item && item.name);
}

export default async function PrintOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const resolved = await searchParams;
  const idsStr = resolved.ids;
  if (!idsStr) return notFound();

  const ids = idsStr
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (ids.length === 0) return notFound();

  const orders = await prisma.order.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      phone: true,
      governorate: true,
      city: true,
      address: true,
      building: true,
      notes: true,
      items: true,
      subtotal: true,
      deliveryFee: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      orderStatus: true,
      createdAt: true,
    },
    orderBy: { id: "asc" },
  });

  if (orders.length === 0) return notFound();

  return (
    <html dir="auto" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>QUTB Orders — Print</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 20px; color: #111; }
          .order-page { page-break-after: always; margin-bottom: 30px; max-width: 700px; margin-left: auto; margin-right: auto; }
          .order-page:last-child { page-break-after: auto; }
          h1 { font-size: 20px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #333; }
          h2 { font-size: 13px; margin: 14px 0 6px; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }
          p { font-size: 12px; margin: 3px 0; line-height: 1.5; }
          .label { font-weight: bold; color: #666; display: inline-block; width: 110px; }
          .address { margin: 6px 0 12px; line-height: 1.6; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #f0f0f0; font-size: 10px; text-transform: uppercase; padding: 6px 4px; text-align: left; border-bottom: 2px solid #ccc; }
          td { font-size: 11px; padding: 6px 4px; border-bottom: 1px solid #eee; vertical-align: top; }
          .totals { margin-top: 12px; padding-top: 8px; border-top: 1px solid #ccc; }
          .totals-row { display: flex; justify-content: flex-end; gap: 20px; margin: 4px 0; font-size: 12px; }
          .totals-label { width: 90px; text-align: right; color: #666; }
          .totals-value { width: 110px; text-align: right; }
          .grand-total { font-size: 14px; font-weight: bold; margin-top: 6px; padding-top: 6px; border-top: 2px solid #999; }
          .notes-box { background: #f9f9f9; padding: 8px; margin-top: 8px; border-radius: 3px; font-size: 11px; }
          .footer { text-align: center; font-size: 9px; color: #999; margin-top: 20px; padding-top: 8px; border-top: 1px solid #ddd; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        `}</style>
      </head>
      <body>
        <div className="no-print" style={{ textAlign: "center", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid #ddd" }}>
          <p style={{ fontSize: 12, color: "#666" }}>
            Press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac) and select <strong>"Save as PDF"</strong> as the destination.
          </p>
        </div>

        {orders.map((order) => {
          const items = parseItems(order.items);
          const fullAddress = [order.address, order.building, order.city, order.governorate]
            .filter(Boolean)
            .join(" ، ");

          return (
            <div key={order.id} className="order-page">
              <h1>QUTB — Order {escapeHtml(order.orderNumber)}</h1>

              <h2>Order Details</h2>
              <p><span className="label">Created:</span> {new Date(order.createdAt).toLocaleString("en-GB")}</p>
              <p><span className="label">Status:</span> {escapeHtml(order.orderStatus)}</p>
              <p><span className="label">Payment:</span> {escapeHtml(order.paymentMethod)} ({escapeHtml(order.paymentStatus)})</p>

              <h2>Customer Information</h2>
              <p><span className="label">Name:</span> {escapeHtml(order.customerName)}</p>
              <p><span className="label">Phone:</span> {escapeHtml(order.phone)}</p>
              <p><span className="label">Governorate:</span> {escapeHtml(order.governorate || "-")}</p>
              <p><span className="label">City:</span> {escapeHtml(order.city || "-")}</p>

              <h2>Shipping Address</h2>
              <p className="address">{escapeHtml(fullAddress) || "No address provided"}</p>

              {order.notes && (
                <>
                  <h2>Notes</h2>
                  <div className="notes-box">{escapeHtml(order.notes)}</div>
                </>
              )}

              <h2>Items</h2>
              {items.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Color</th>
                      <th>Size</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td>{escapeHtml(item.name.substring(0, 30))}</td>
                        <td>{escapeHtml(item.color)}</td>
                        <td>{escapeHtml(item.size)}</td>
                        <td>{item.qty}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.unitPrice * item.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ fontSize: 11, color: "#999" }}>No items in this order</p>
              )}

              <div className="totals">
                <div className="totals-row">
                  <span className="totals-label">Subtotal:</span>
                  <span className="totals-value">{formatCurrency(order.subtotal || 0)}</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label">Delivery:</span>
                  <span className="totals-value">{formatCurrency(order.deliveryFee || 0)}</span>
                </div>
                <div className="totals-row grand-total">
                  <span className="totals-label">TOTAL:</span>
                  <span className="totals-value">{formatCurrency(order.total || 0)}</span>
                </div>
              </div>

              <div className="footer">
                QUTB • Alexandria, Egypt • Printed on {new Date().toLocaleDateString("en-GB")}
              </div>
            </div>
          );
        })}

        <script>{`
          window.addEventListener('load', function() {
            setTimeout(function() { window.print(); }, 500);
          });
        `}</script>
      </body>
    </html>
  );
}
