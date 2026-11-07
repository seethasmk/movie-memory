import { Playfair_Display, Inter } from "next/font/google";
import { signIn } from "@/auth";

const serif = Playfair_Display({ subsets: ["latin"], weight: ["600"] });
const sans = Inter({ subsets: ["latin"] });

export default function Home() {
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
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button className="mt-10 rounded-full border border-white px-8 py-3 text-sm tracking-wide transition hover:bg-white hover:text-black">
          Sign in with Google
        </button>
      </form>
    </main>
  );
}