# Dolly

Camera-move studio: upload a frame, preview a move on it instantly, see the credit cost, then render.

## Run
```
npm install
cp .env.example .env.local   # add FAL_KEY for real video; without it the app falls back to a simulated render
npm run dev
```
Deploy: push to GitHub, import in Vercel, set `FAL_KEY`.

## Product decisions
- Built first: one end-to-end flow (frame, move, length, generate, result, history).
- Instant client-side preview of each move on the user's own frame, before spending credits.
- Cost and time shown up front; credits refunded on timeout.
- Cut on purpose: payments, social feed, teams, custom model training.
- Next: Supabase auth, storage and a server-side credits ledger; preset gallery with sample clips.

## Agent logs
`.agent-logs/` holds captured agent prompts and responses (see the 8x capture setup). Commit it as you go.
