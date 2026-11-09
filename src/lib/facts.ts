import { prisma } from "@/lib/prisma";
import { generateFact } from "@/lib/openai";

export const CACHE_WINDOW_MS = 60_000; // 60 seconds

// Is this fact younger than 60s?
export function isFresh(createdAt: Date, now: Date = new Date()) {
  return now.getTime() - createdAt.getTime() < CACHE_WINDOW_MS;
}

// Return a cached fact if fresh, otherwise generate and save a new one
export async function getFact(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.favoriteMovie) throw new Error("No favorite movie set");
  const movie = user.favoriteMovie;

  // 1. Check cache: newest fact for this user + movie
  const latest = await prisma.fact.findFirst({
    where: { userId, movie },
    orderBy: { createdAt: "desc" },
  });
  if (latest && isFresh(latest.createdAt)) return latest;

  try {
    // 2. Lock per user so only one request generates at a time
    return await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

        // 3. Re-check: another request may have just created one
        const recent = await tx.fact.findFirst({
          where: { userId, movie },
          orderBy: { createdAt: "desc" },
        });
        if (recent && isFresh(recent.createdAt)) return recent;

        // 4. Generate and save
        const text = await generateFact(movie);
        return tx.fact.create({ data: { userId, movie, text } });
      },
      { timeout: 15_000 }
    );
  } catch (err) {
    // 5. OpenAI failed: fall back to the last saved fact, if any
    console.error("Fact generation failed:", err);
    if (latest) return latest;
    throw new Error("Could not generate a fun fact right now. Please try again shortly.");
  }
}