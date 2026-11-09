import { describe, it, expect, vi, beforeEach } from "vitest";

// Fake DB and OpenAI so tests are free and predictable
vi.mock("@/lib/prisma", () => {
  const fact = { findFirst: vi.fn(), create: vi.fn() };
  return {
    prisma: {
      user: { findUnique: vi.fn() },
      fact,
      $transaction: vi.fn((fn) => fn({ $executeRaw: vi.fn(), fact })),
    },
  };
});
vi.mock("@/lib/openai", () => ({ generateFact: vi.fn() }));

import { prisma } from "@/lib/prisma";
import { generateFact } from "@/lib/openai";
import { getFact, isFresh } from "@/lib/facts";

const secondsAgo = (s: number) => new Date(Date.now() - s * 1000);

describe("isFresh (60s window)", () => {
  it("59s old is fresh", () => expect(isFresh(secondsAgo(59))).toBe(true));
  it("61s old is stale", () => expect(isFresh(secondsAgo(61))).toBe(false));
});

describe("getFact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-a", favoriteMovie: "Titanic" } as never);
  });

  it("returns cached fact under 60s without calling OpenAI", async () => {
    const cached = { id: "f1", text: "old", createdAt: secondsAgo(30) };
    vi.mocked(prisma.fact.findFirst).mockResolvedValue(cached as never);

    expect(await getFact("user-a")).toBe(cached);
    expect(generateFact).not.toHaveBeenCalled();
  });

  it("generates a new fact when the latest is over 60s old", async () => {
    vi.mocked(prisma.fact.findFirst).mockResolvedValue({ id: "f1", createdAt: secondsAgo(90) } as never);
    vi.mocked(generateFact).mockResolvedValue("new fact");
    vi.mocked(prisma.fact.create).mockResolvedValue({ id: "f2", text: "new fact" } as never);

    const result = await getFact("user-a");
    expect(generateFact).toHaveBeenCalledOnce();
    expect(result.text).toBe("new fact");
  });

  it("falls back to the last fact when OpenAI fails", async () => {
    const stale = { id: "f1", text: "stale", createdAt: secondsAgo(90) };
    vi.mocked(prisma.fact.findFirst).mockResolvedValue(stale as never);
    vi.mocked(generateFact).mockRejectedValue(new Error("timeout"));

    expect(await getFact("user-a")).toBe(stale);
  });

  it("only queries facts for the given user", async () => {
    vi.mocked(prisma.fact.findFirst).mockResolvedValue({ createdAt: secondsAgo(10) } as never);
    await getFact("user-a");
    expect(prisma.fact.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-a", movie: "Titanic" } })
    );
  });
});