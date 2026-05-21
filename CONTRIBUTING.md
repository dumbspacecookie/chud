# Contributing

short version: read [docs/BRAND.md](docs/BRAND.md), then PR.

## setup
```
docker compose up -d
# wait ~30s for first npm install in frontend container
# http://localhost:3030
```

local dev without docker:
```
cd backend  && python -m venv .venv && pip install -r requirements.txt && alembic upgrade head && python seed_cosmetics.py && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

## ground rules
- **lowercase** by default in copy. capital letters mean drama.
- every line of code passes through a human. tone-match the existing voice. if it doesn't sound like the rest of the repo, rewrite.
- match the [brand voice](docs/BRAND.md). The Terl quotes in source are *the* tone reference.
- new mechanics get added to [docs/MECHANICS.md](docs/MECHANICS.md) first, then code.
- new endpoints get e2e curl'd in the PR description. no e2e proof, no merge.
- tailwind dynamic classes don't ship (`border-${color}` fails silently). spell them out literally.

## commit style
- imperative, lowercase, terse. example: `friends: cancel-outgoing button + sort by recency`
- one logical change per commit. squash if reviewing reveals smaller chunks.

## what NOT to add
- backwards-compat shims for stuff we just changed
- abstractions before we have three concrete uses
- "for the future" toggles
- generic boilerplate. read it out loud — if it could sit in any repo, it doesn't belong in this one.
