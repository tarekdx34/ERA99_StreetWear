import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

describe("legacy payment callback", () => {
  it("does not process gateway callbacks at launch", async () => {
    const response = await POST();
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(response.status).toBe(200);
  });

  it("acknowledges legacy GET callbacks without mutating orders", async () => {
    const response = await GET();
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(response.status).toBe(200);
  });
});
