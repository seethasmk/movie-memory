import { z } from "zod";

// Movie input rules (shared by onboarding and edit)
export const movieSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(1, "Please enter a movie")
      .max(100, "Movie name is too long")
      .regex(/[\p{L}\p{N}]/u, "Movie name must contain a letter or number")
  );