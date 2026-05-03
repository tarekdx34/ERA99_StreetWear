"use client";

import { motion } from "framer-motion";

type OrderStage = {
  status: string;
  label: string;
  description: string;
  date?: string;
};

type Props = {
  orderStatus: string;
  createdAt: string;
  updatedAt?: string;
  stages?: OrderStage[];
};

const DEFAULT_STAGES: Array<{ status: string; label: string; description: string }> = [
  {
    status: "pending_confirmation",
    label: "ORDER PLACED",
    description: "Your order has been received and is awaiting confirmation.",
  },
  {
    status: "pending_payment",
    label: "PAYMENT PENDING",
    description: "Waiting for payment to be completed.",
  },
  {
    status: "payment_failed",
    label: "PAYMENT FAILED",
    description: "Payment was not completed. Please retry or contact support.",
  },
  {
    status: "preparing",
    label: "PREPARING",
    description: "Your order is being prepared for shipment.",
  },
  {
    status: "shipped",
    label: "SHIPPED",
    description: "Your order is on its way to you.",
  },
  {
    status: "delivered",
    label: "DELIVERED",
    description: "Your order has been delivered.",
  },
  {
    status: "cancelled",
    label: "CANCELLED",
    description: "This order has been cancelled.",
  },
];

function getStageIndex(status: string): number {
  const order = [
    "pending_confirmation",
    "pending_payment",
    "preparing",
    "shipped",
    "delivered",
  ];
  if (status === "cancelled" || status === "payment_failed") return -1;
  return order.indexOf(status);
}

export function OrderTimeline({ orderStatus, createdAt, updatedAt, stages }: Props) {
  const stageList = stages || DEFAULT_STAGES;
  const currentIndex = getStageIndex(orderStatus);
  const isCancelled = orderStatus === "cancelled" || orderStatus === "payment_failed";
  const createdDate = new Date(createdAt).toLocaleString("en-GB", {
    timeZone: "Africa/Cairo",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedDate = updatedAt
    ? new Date(updatedAt).toLocaleString("en-GB", {
        timeZone: "Africa/Cairo",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const visibleStages = isCancelled
    ? stageList.filter((s) => s.status === orderStatus)
    : stageList.filter((s) => {
        const idx = getStageIndex(s.status);
        return idx <= currentIndex || idx === -1;
      });

  return (
    <div className="space-y-0">
      {visibleStages.map((stage, index) => {
        const stageIdx = getStageIndex(stage.status);
        const isCompleted = !isCancelled && stageIdx < currentIndex;
        const isCurrent = !isCancelled && stageIdx === currentIndex;
        const isFuture = !isCancelled && stageIdx > currentIndex;
        const isFailed = isCancelled && stage.status === orderStatus;

        return (
          <motion.div
            key={stage.status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 border-2 ${
                  isCompleted
                    ? "border-[#F0EDE8] bg-[#F0EDE8]"
                    : isCurrent
                      ? "border-[#8B0000] bg-[#8B0000]"
                      : isFailed
                        ? "border-[#8B0000] bg-[#8B0000]"
                        : "border-[#F0EDE8]/30 bg-transparent"
                }`}
              />
              {index < visibleStages.length - 1 && (
                <div
                  className={`my-1 w-px flex-1 ${
                    isCompleted || isCurrent ? "bg-[#F0EDE8]/60" : "bg-[#F0EDE8]/15"
                  }`}
                />
              )}
            </div>

            <div className="flex-1 pb-6">
              <p
                className={`text-xs uppercase tracking-[0.16em] ${
                  isFuture ? "text-[#F0EDE8]/30" : "text-[#F0EDE8]"
                }`}
              >
                {stage.label}
              </p>
              <p
                className={`mt-1 text-sm ${
                  isFuture ? "text-[#F0EDE8]/30" : "text-[#F0EDE8]/65"
                }`}
              >
                {stage.description}
              </p>
              {isCompleted && updatedDate && isCurrent === false && (
                <p className="mt-1 text-[11px] text-[#F0EDE8]/45">{updatedDate}</p>
              )}
              {isCurrent && createdDate && currentIndex === 0 && (
                <p className="mt-1 text-[11px] text-[#F0EDE8]/45">{createdDate}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
