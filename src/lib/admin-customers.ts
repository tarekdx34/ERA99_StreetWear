import { prisma } from "@/lib/prisma";

type OrderLite = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  building: string | null;
  notes: string | null;
  paymentMethod: string;
  total: number;
  createdAt: Date;
  items: unknown;
};

function parseItems(items: unknown): Array<any> {
  return Array.isArray(items) ? items : [];
}

export async function getAdminCustomersData() {
  const orders = (await prisma.order.findMany({
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
      paymentMethod: true,
      total: true,
      createdAt: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })) as OrderLite[];

  const map = new Map<
    string,
    {
      name: string;
      phone: string;
      governorate: string;
      orders: number;
      totalSpent: number;
      lastOrder: string;
      addresses: Set<string>;
      sizes: Record<string, number>;
      paymentMap: Record<string, number>;
      notes: string[];
      orderHistory: Array<{
        orderId: number;
        orderNumber: string;
        createdAt: string;
        total: number;
        paymentMethod: string;
        governorate: string;
        city: string;
        address: string;
      }>;
    }
  >();

  for (const order of orders) {
    const key = order.phone;
    if (!map.has(key)) {
      map.set(key, {
        name: order.customerName,
        phone: order.phone,
        governorate: order.governorate,
        orders: 0,
        totalSpent: 0,
        lastOrder: order.createdAt.toISOString(),
        addresses: new Set<string>(),
        sizes: {},
        paymentMap: {},
        notes: [],
        orderHistory: [],
      });
    }

    const customer = map.get(key)!;
    customer.orders += 1;
    customer.totalSpent += order.total;
    if (order.createdAt.toISOString() > customer.lastOrder) {
      customer.lastOrder = order.createdAt.toISOString();
    }

    const addressParts = [
      order.governorate,
      order.city,
      order.address,
      order.building || "",
    ].filter(Boolean);
    customer.addresses.add(addressParts.join(" - "));

    customer.paymentMap[order.paymentMethod] =
      (customer.paymentMap[order.paymentMethod] || 0) + 1;

    if (order.notes?.trim()) {
      customer.notes.push(order.notes.trim());
    }

    for (const item of parseItems(order.items)) {
      const size = String(item?.size || "Unknown");
      const qty = Number(item?.qty || 0);
      customer.sizes[size] = (customer.sizes[size] || 0) + qty;
    }

    customer.orderHistory.push({
      orderId: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      total: order.total,
      paymentMethod: order.paymentMethod,
      governorate: order.governorate,
      city: order.city,
      address: order.address,
    });
  }

  const customers = Array.from(map.values()).map((customer) => {
    const preferredPayment =
      Object.entries(customer.paymentMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "-";

    return {
      name: customer.name,
      phone: customer.phone,
      governorate: customer.governorate,
      orders: customer.orders,
      totalSpent: customer.totalSpent,
      lastOrder: customer.lastOrder,
      averageOrderValue: customer.orders
        ? customer.totalSpent / customer.orders
        : 0,
      preferredPayment,
      sizesOrdered: Object.entries(customer.sizes)
        .map(([size, qty]) => `${size} (${qty})`)
        .join(", "),
      addresses: Array.from(customer.addresses),
      notes: customer.notes,
      orderHistory: customer.orderHistory,
    };
  });

  return customers;
}
