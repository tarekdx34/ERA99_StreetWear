import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

describe("legacy payment callback", () => {
  it("does not process gateway callbacks at launch", async () => {
    const response = await POST();
    await expect(response.json()).resolves.toEqual({
      code: "ONLINE_PAYMENT_DISABLED",
      message:
        "Paymob callback handling is disabled because online payments are disabled.",
    });
    expect(response.status).toBe(410);
  });

  it("acknowledges legacy GET callbacks without mutating orders", async () => {
    const response = await GET();
    await expect(response.json()).resolves.toEqual({
      code: "ONLINE_PAYMENT_DISABLED",
      message:
        "Paymob callback handling is disabled because online payments are disabled.",
    });
    expect(response.status).toBe(410);
  });
});
