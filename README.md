# PCIe Microgames

Short, focused **microgames** that teach PCIe fundamentals — for platform Solutions Architects and new OS/driver engineers. Polished tech-ed tone; stopwatch scoring (lower is better; **+1.5s** per mistake; campaign total = sum of drills).

**Live:** https://pcie-microgames.vercel.app

## Curriculum (campaign chapters)

| Chapter | Microgames | Concept |
|---------|------------|---------|
| **1 · Fundamentals** | Link Training, Packet Sort, BAR Claim | LTSSM / Gen negotiate, TLP·DLLP·OS, MMIO BARs |
| **2 · Bandwidth** | Lane Widths, Generations, Throughput Calc | ×1/×4/×8/×16, Gen3/4/5 per-lane BW, Gen × lanes aggregate |
| **3 · Topology** | Bifurcation | Split an ×16 root without oversubscribing lanes |
| **4 · Tradeoffs** | Tradeoff Boss | Meet a BW target under Gen/slot/power constraints with least overkill |
| **5 · Fabric / Ops** | Root or Switch?, DMA Path, P2P or Bounce? | Topology roles, DMA via RC, P2P vs host bounce |
| **6 · Drivers / Platform** | Config Walk, MSI Setup, AER Triage | Type0/1 enum, MSI/MSI-X vectors, AER severity |
| **7 · Attach / CXL · DMI · NVMe** | DMI Link, NVMe Map, CXL Type | CPU↔PCH DMI vs PEG, NVMe PCIe EP + queues, CXL Types 1/2/3 & .io/.cache/.mem |
| **8 · Virtualization / SR-IOV** | VF Carve | PF vs VF, NumVFs ≤ TotalVFs, VF passthrough to VMs over one shared port |
| **9 · Isolation / ACS · IOMMU · ATS** | ACS Groups, IOVA Map | ACS & IOMMU groups for passthrough, IOVA→PA mapping, ATS invalidation on unmap |

**Chapter flow:** Fundamentals → Bandwidth → Bifurcation → Tradeoffs → Fabric → Drivers → Attach (CXL / DMI / NVMe) → Virtualization (SR-IOV) → Isolation (ACS / IOMMU / ATS).

Hub shows **progressive unlock**: clear every drill in a chapter to open the next. Campaign plays all drills in order. Each game starts with a one-line teach tip.

Throughput uses commonly taught approximate unidirectional numbers (Gen3 ≈ 1, Gen4 ≈ 2, Gen5 ≈ 4 GB/s per lane; aggregate ≈ per-lane × lanes). The Throughput Calc drill includes a peekable reference card.

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

**Stack:** Vite + React + TypeScript · time-based scoring · deployed on Vercel. Client-only static app — no env secrets required for play (optional `FEEDBACK_WEBHOOK_URL` for the hub poll).

---

## Deploy on Vercel

### Option A — Import in dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Einse57/pcie-microgames`
3. Framework Preset: **Vite** · Build: `npm run build` · Output: `dist`
4. Deploy

### Option B — CLI

```bash
npm i -g vercel
vercel login && vercel link
vercel --prod
```

`vercel.json` rewrites SPA routes to `index.html`.

---

## Project layout

```
src/
  App.tsx              # hub / campaign / solo routing
  components/          # Hub (chapters), GameShell, Campaign, Timer, Result
  games/               # playable microgames
  data/                # catalog, chapters, progress, BW reference, feedback
```

---

## Scoring

- Elapsed stopwatch per drill (lower better)
- Each mistake adds **+1.5s**; round continues until clear (or you leave)
- Campaign score = sum of all drill times; best campaign stored in `localStorage`

---

## Non-goals

- Multiplayer / accounts / leaderboards
- Backend or analytics
- Full Spec fidelity (intuition > encyclopedia)

---

## License

Private — Andrew Lamkin / Einse57. All rights reserved for now.

---

## Feedback poll (what to cover next)

Hub footer includes a low-key topic poll. Votes `POST` to `/api/feedback`.

**Tracking**

1. Every vote is logged in the Vercel function logs (`[feedback] …`).
2. If `FEEDBACK_WEBHOOK_URL` is set, the same JSON is forwarded (Google Sheet via Apps Script, Zapier, Make, Formspree, etc.).

**Env var (Vercel → Project → Settings → Environment Variables)**

| Name | Required | Notes |
|------|----------|-------|
| `FEEDBACK_WEBHOOK_URL` | No (recommended) | HTTPS endpoint that accepts `POST` JSON `{ topic, note, at, ua }`. |

Sample Apps Script for a Google Sheet: `scripts/feedback-sheet.gs`. After deploying the web app, paste its URL as `FEEDBACK_WEBHOOK_URL` for Production (and Preview if you want), then redeploy.

Without the env var the poll still works; check **Deployments → Function logs** for votes until the sheet webhook is wired.
