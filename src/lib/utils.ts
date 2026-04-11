export function formatEGP(amount: number) {
  return `${amount.toFixed(0)} EGP`;
}

export function isEgyptPhone(value: string) {
  return /^(010|011|012|015)\d{8}$/.test(value);
}

export function orderNumberFromId(id: number) {
  return `QUTB-${String(id).padStart(5, "0")}`;
}
