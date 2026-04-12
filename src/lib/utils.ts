export function formatEGP(amount: number) {
  return `${amount.toFixed(0)} EGP`;
}

export function isEgyptPhone(value: string) {
  return /^(010|011|012|015)\d{8}$/.test(value);
}

export function orderNumberFromId(id: number) {
  return `99-${String(id).padStart(5, "0")}`;
}

export function orderNumberFromIdWithPrefix(id: number, prefix: string) {
  const cleanPrefix = (prefix || "99").trim() || "99";
  return `${cleanPrefix}-${String(id).padStart(5, "0")}`;
}
