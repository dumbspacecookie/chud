/**
 *   "REST is just leverage with extra steps, Morty. You GET, you POST,
 *   you bearer-token your way into a JSON payload and the server hands
 *   you back a status code like it's *bzrp* doing you a favor. Crapulous
 *   protocol but it ships." — Terl, network engineer, has opinions.
 */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "chud_token";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const tok = window.localStorage.getItem(TOKEN_KEY);
    if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  }
  return cfg;
});

export function setToken(tok: string) {
  window.localStorage.setItem(TOKEN_KEY, tok);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export type ScanMode = "glaze" | "chud";

export interface ScanResult {
  interaction_id: number;
  mode: ScanMode;
  your_delta_currency: "aura" | "ls";
  your_delta: number;
  target_delta_aura: number;
  new_aura_balance: number;
  new_ls_balance: number;
}

export async function postScan(
  target_handle: string,
  mode: ScanMode,
  raw_score: number,
  session_id?: string,
): Promise<ScanResult> {
  const { data } = await api.post<ScanResult>("/scan", {
    target_handle,
    mode,
    raw_score,
    session_id,
  });
  return data;
}

export interface MeResponse {
  id: number;
  handle: string;
  saiyan_name: string | null;
  alignment_pct: number;
  current_aura: number;
  current_ls: number;
  is_18_plus: boolean;
  streak: number;
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
}

export interface LeaderRow {
  rank: number;
  handle: string;
  saiyan_name: string | null;
  score: number;
  alignment_pct: number;
}

export async function getLeaderboard(board: "fame" | "shame"): Promise<LeaderRow[]> {
  const { data } = await api.get(`/leaderboard?board=${board}&scope=global`);
  return data.rows;
}

export interface CapsulePullResult {
  item: {
    id: number;
    slug: string;
    name: string;
    side: "glazer" | "chud" | "neutral";
    rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
    slot: string;
    asset_url: string | null;
  };
  was_pity: boolean;
  pull_no: number;
}

export async function pullCapsule(paid_with: "aura" | "ls" | "free"): Promise<CapsulePullResult> {
  const { data } = await api.post("/capsule/pull", { paid_with });
  return data;
}
