import { prisma } from "@/lib/prisma";
import { generateFact } from "@/lib/openai";

// Generate a new fact for the user's movie and save it
export async function getFact(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.favoriteMovie) throw new Error("No favorite movie set");

  const text = await generateFact(user.favoriteMovie);

  return prisma.fact.create({
    data: { userId, movie: user.favoriteMovie, text },
  });
}