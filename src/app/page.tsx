import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serif, sans } from "@/lib/fonts";

// Landing page with Google sign in
export default async function Home() {
  // Logged in? Send to onboarding or dashboard
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    redirect(user?.favoriteMovie ? "/dashboard" : "/onboarding");
  }

  return (
    <main
      className={`${sans.className} flex min-h-screen flex-col items-center justify-center bg-black text-white`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Now Showing</p>

      <h1 className={`${serif.className} mt-4 text-6xl tracking-tight`}>Movie Memory</h1>

      <p className="mt-4 text-neutral-400">Your favorite movie. Fresh facts, every visit.</p>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button className="mt-10 rounded-full border border-white px-8 py-3 text-sm tracking-wide transition hover:bg-white hover:text-black">
          Sign in with Google
        </button>
      </form>
    </main>
  );
}