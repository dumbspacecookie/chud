// "Crapulous fool, signup is just leverage for *bzrp* later. The
// man-animal hands you their email, you hand them an account. Trade
// completed." — Terl, growth marketer.
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { signup, errMsg } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const refresh = useAuth((s) => s.refresh);
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup(email, password, handle, dob);
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
      <h1 className="brand-mark text-5xl mt-3 text-aura-gold">join chud</h1>
      <p className="text-white/50 text-sm mt-1">13+ to play, 18+ to broadcast.</p>

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
          required
          placeholder="handle (letters, numbers, _)"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          pattern="[a-zA-Z0-9_]+"
          minLength={2}
          maxLength={32}
          className="bg-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-aura-gold"
          autoComplete="username"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="password (8+ chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-aura-gold"
          autoComplete="new-password"
        />
        <input
          type="date"
          required
          placeholder="birthday"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="bg-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-aura-gold"
        />
        {error && <div className="text-brick-piss text-sm">{error}</div>}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 py-4 rounded-full bg-aura-gold text-ink font-display text-xl active:scale-95 disabled:opacity-50"
        >
          {busy ? "…" : "create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-white/60">
        got an account? <Link href="/login" className="text-aura-gold underline">login</Link>
      </p>
    </div>
  );
}
