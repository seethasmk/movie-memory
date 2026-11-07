import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serif, sans } from "@/lib/fonts";

// User dashboard (login required)
export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  // No movie yet? Finish onboarding first
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.favoriteMovie) redirect("/onboarding");

  const displayName = user.name ?? "Movie Lover";

  return (
    <main className={`${sans.className} min-h-screen bg-black text-white`}>
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-neutral-900 px-10 py-6">
        <span className={`${serif.className} text-xl`}>Movie Memory</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="rounded-full border border-neutral-700 px-5 py-2 text-xs uppercase tracking-widest text-neutral-300 transition hover:border-white hover:text-white">
            Log out
          </button>
        </form>
      </header>

      {/* Profile */}
      <section className="mx-auto mt-20 flex max-w-xl flex-col items-center text-center">
        {user.image ? (
          <img src={user.image} alt={displayName} className="h-24 w-24 rounded-full border border-neutral-800 object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-neutral-800 text-3xl">
            {displayName[0]}
          </div>
        )}

        <p className="mt-8 text-xs uppercase tracking-[0.3em] text-neutral-500">Welcome back</p>
        <h1 className={`${serif.className} mt-3 text-5xl`}>{displayName}</h1>
        <p className="mt-2 text-neutral-500">{user.email}</p>

        {/* Favorite movie */}
        <p className="mt-12 text-xs uppercase tracking-[0.3em] text-neutral-500">Favorite movie</p>
        <p className={`${serif.className} mt-3 text-3xl`}>{user.favoriteMovie}</p>
      </section>
    </main>
  );
}