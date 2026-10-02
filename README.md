# PCIe Microgames

WarioWare-style **5-second microgames** that teach PCIe fundamentals — for platform Solutions Architects and new OS/driver engineers.

**Vertical slice (Phase A):** hub (motherboard metaphor) + 3 playable games + campaign runner.

| Microgame | What you do | Concept |
|-----------|-------------|---------|---|---|---|
| **Link Training** | Match Gen speed + align 4 lanes | Link training / Gen negotiate |
| **Packet Sort** | Bin TLP vs DLLP vs Ordered Set | Layer packet types |
| **BAR Claim** | Place an MMIO window without overlap | Base Address Registers |

Fail screens roast you with the actual PCIe concept you botched.

Design brief (Drive): *PCIe Microgames — Design Brief (2026-10-01)* in folder **PCIe Microgames**.

---

## Quick start (local)

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production bundle → dist/
npm run preview  # serve dist locally
```

**Stack:** Vite + React + TypeScript. Client-only static app — no env secrets, no backend.

---

## Deploy on Vercel

### Option A — Import in dashboard (recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Einse57/pcie-microgames` (grant access to the private repo if prompted)
3. Framework Preset: **Vite** (auto-detected)
4. Build command: `npm run build` · Output: `dist`
5. Deploy

### Option B — CLI

```bash
npm i -g vercel
vercel login
vercel link    # create/link project
vercel         # preview
vercel --prod  # production
```

`vercel.json` rewrites SPA routes to `index.html`.

---

## Project layout

```
src/
  App.tsx              # hub / campaign / solo routing
  components/          # Hub, GameShell, Campaign, Timer, Result
  games/               # LinkTraining, PacketSort, BarClaim
  data/                # catalog + fail/win strings
```

Art is intentional CSS placeholders — fun before polish.

---

## Non-goals (day one)

- CXL
- Multiplayer / accounts / leaderboards
- Backend or analytics
- Full Spec fidelity (intuition > encyclopedia)

---

## License

Private — Andrew Lamkin / Einse57. All rights reserved for now.
