import { describe, it, expect, vi, beforeEach } from "vitest";

// Fake login and fact logic
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/facts", () => ({ getFact: vi.fn() }));

import { auth } from "@/auth";
import { getFact } from "@/lib/facts";
import { GET } from "./route";

describe("GET /api/fact authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(getFact).not.toHaveBeenCalled();
  });

  it("only fetches facts for the logged-in user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-a" } } as never);
    vi.mocked(getFact).mockResolvedValue({ text: "fact", movie: "Titanic", createdAt: new Date() } as never);

    await GET();
    expect(getFact).toHaveBeenCalledWith("user-a");
  });
});