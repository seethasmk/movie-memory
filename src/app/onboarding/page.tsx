import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { movieSchema } from "@/lib/validation";
import { serif, sans } from "@/lib/fonts";

// First-time setup: ask for favorite movie
export default async function Onboarding({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // Already onboarded? Skip to dashboard
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.favoriteMovie) redirect("/dashboard");

  const { error } = await searchParams;

  async function saveMovie(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) redirect("/");

    const result = movieSchema.safeParse(formData.get("movie"));
    if (!result.success) redirect("/onboarding?error=invalid");

    await prisma.user.update({
      where: { id: session.user.id },
      data: { favoriteMovie: result.data },
    });
    redirect("/dashboard");
  }

  return (
    <main className={`${sans.className} flex min-h-screen flex-col items-center justify-center bg-black text-white`}>
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">One quick question</p>
      <h1 className={`${serif.className} mt-4 text-5xl`}>What&apos;s your favorite movie?</h1>

      <form action={saveMovie} className="mt-10 flex w-full max-w-md flex-col items-center gap-4">
        <input
          name="movie"
          required
          maxLength={100}
          placeholder="e.g. Titanic"
          className="w-full rounded-full border border-neutral-700 bg-transparent px-6 py-3 text-center outline-none focus:border-white"
        />
        {error && (
          <p className="text-sm text-red-400">Please enter a valid movie name (1 to 100 characters).</p>
        )}
        <button className="rounded-full border border-white px-8 py-3 text-sm tracking-wide transition hover:bg-white hover:text-black">
          Continue
        </button>
      </form>
    </main>
  );
}