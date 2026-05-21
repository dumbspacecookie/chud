# Security policy

If you find a vulnerability — auth bypass, scan/tip exploit, leaderboard
manipulation, PII exposure, anything that could harm users — **do not** open
a public issue.

Email: `security@chud.gg` (set up when domain lands; until then, DM
dumbspacecookie on GitHub privately).

Include:
- what
- how to reproduce
- impact assessment
- your handle if you want credit in the fixed-bugs ledger

We'll acknowledge within 72 hours. No bug-bounty pool exists yet — gratitude
and credit only at this stage.

## Out-of-scope
- Rate-limit-bypass via burner accounts (we throttle aggressively, but
  rate-limit dodges are a known cat-and-mouse, not a security bug per se)
- Cosmetic / brand / language complaints (use [idea](.github/ISSUE_TEMPLATE/idea.md))
- Anything in third-party deps (report upstream)

## What we treat as P0
- Reading another user's wallet, scans, or DMs
- Sending scans / tips / battle actions as another user
- Bypassing the mutual-friend chud gate
- Bypassing age gate
- Stored XSS in user-controlled fields (handle, saiyan_name)
