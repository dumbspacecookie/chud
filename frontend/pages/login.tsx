// "Login is just signup with fewer fields, Morty. The man-animal already
// gave you the leverage, now they're just *bzrp* proving they still
// remember it." — Terl, IAM minimalist.
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { login, errMsg } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const refresh = useAuth((s) => s.refresh);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      await refresh();
      router.push("/app");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <Link href="/" className="text-white/40 text-sm">← home</Link>
      <h1 className="brand-mark text-5xl mt-3 text-aura-gold">login</h1>

      <form onSubmit={go} className="mt-8 flex flex-col gap-3 max-w-sm">
        <input
          type="email"
          required
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-aura-gold"
          autoComplete="email"
        />
        <input
          type="password"
          required
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-aura-gold"
          autoComplete="current-password"
        />
        {error && <div className="text-brick-piss text-sm">{error}</div>}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 py-4 rounded-full bg-aura-gold text-ink font-display text-xl active:scale-95 disabled:opacity-50"
        >
          {busy ? "…" : "log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-white/60">
        new here? <Link href="/signup" className="text-aura-gold underline">make an account</Link>
      </p>
    </div>
  );
}
