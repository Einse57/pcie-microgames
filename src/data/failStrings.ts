import type { MicrogameId } from '../types';

const FAILS: Record<MicrogameId, string[]> = {
  'link-training': [
    'LTSSM stuck in Recovery — renegotiate Gen and realign lanes.',
    'Gen mismatch: downstream advertised a different speed.',
    'Lane deskew failed. Align all four lanes before training.',
  ],
  'packet-sort': [
    'That was a DLLP, not a TLP — Data Link layer.',
    'Ordered Sets belong on the Physical layer, not Transaction.',
    'ACK is a DLLP, not a Memory Write TLP.',
  ],
  'bar-claim': [
    'BAR overlap: two devices cannot share the same MMIO range.',
    'That lands on the VGA hole — shift the window.',
    'Region already claimed. Choose an empty range.',
  ],
  'lane-widths': [
    'Wrong link width — check the form-factor or silk.',
    'M.2 NVMe is typically ×4, not ×16.',
    'PEG / graphics slots are usually ×16.',
  ],
  generations: [
    'Per-lane BW doubles each generation from Gen3 onward (rule of thumb).',
    'Gen4 ≈ 2 GB/s per lane; Gen5 ≈ 4 GB/s per lane.',
    'Match Gen to GT/s and the approximate GB/s per lane.',
  ],
  'throughput-calc': [
    'Aggregate = per-lane × lanes. Re-check Gen and width.',
    'Gen4 ×8 ≈ 16 GB/s (2 × 8), not Gen3 math.',
    'Watch the meter — Gen × lanes must hit the target exactly.',
  ],
  bifurcation: [
    'Oversubscribed: child widths sum past the ×16 parent.',
    'That split leaves a device without enough lanes.',
    'Lane budget exceeded — reduce a child or change the pattern.',
  ],
  'tradeoff-boss': [
    'Under target — that combo does not meet the bandwidth need.',
    'Constraint violation — board Gen or slot width blocks that pick.',
    'Prefer meeting the target with the smallest aggregate headroom.',
  ],
  'root-vs-switch': [
    'That port sits on the Root Complex — Root Port, not Switch DS.',
    'Endpoints are leaf devices — GPU, NIC, NVMe — not ports.',
    'Root Complex owns root ports; switches fan the tree out.',
  ],
  'dma-path': [
    'DMA data rides EP → Root → Memory — not a CPU memcpy loop.',
    'Pick the root-complex path into system memory.',
    'Device is the DMA master toward host DRAM.',
  ],
  'p2p-route': [
    'Same switch with P2P on — take the direct switch path.',
    'Separate root ports without P2P — bounce through host memory.',
    'Direct P2P needs a supported peer path (often same switch).',
  ],
  'config-enum': [
    'Wrong order — software walks Root → Bridge → Endpoint.',
    'Type1 is bridge/root-port config; Type0 is the endpoint.',
    'BDF walks the hierarchy; do not skip the bridge.',
  ],
  'msi-setup': [
    'Multi-queue needs MSI or MSI-X — legacy INTx is one shared pin.',
    'Not enough vectors for every queue — bump the count or use MSI-X.',
    'Match mode and vector count to the queue budget.',
  ],
  'aer-triage': [
    'Correctable errors are logged and cleared — not a fatal reset.',
    'Bad TLP / UR are typically non-fatal — advisory recovery.',
    'Fatal may need link or device reset — not a soft clear alone.',
  ],
  'dmi-link': [
    'Chipset traffic rides DMI to the PCH — not the PEG ×16 GPU slot.',
    'PEG ×16 is for discrete GPU endpoints; DMI is the chipset link.',
    'Do not treat DMI like a general PCIe endpoint slot.',
  ],
  'nvme-map': [
    'NVMe sits on a ×4 PCIe path as an endpoint — not SATA/AHCI.',
    'Pick the matching form factor for that ×4 seat.',
    'Admin queue is control; I/O queue pairs carry the data path.',
  ],
  'cxl-type': [
    'Type 3 is memory expander; Type 1 is accel+cache; Type 2 adds device memory.',
    'CXL.io is PCIe-like I/O; .cache is coherency; .mem is memory access.',
    'Match the silhouette to the CXL Type before binning protocols.',
  ],
};

export function randomFail(id: MicrogameId): string {
  const list = FAILS[id];
  return list[Math.floor(Math.random() * list.length)];
}

export const WIN_STRINGS: Record<MicrogameId, string[]> = {
  'link-training': ['Link Up — L0 achieved.', 'Gen locked and lanes aligned.', 'Training complete. Deskew looks clean.'],
  'packet-sort': ['Layers sorted: Transaction / Data Link / Physical.', 'Packet taxonomy correct.', 'TLP / DLLP / Ordered Set triage complete.'],
  'bar-claim': ['BAR claimed — MMIO window is clean.', 'No overlaps. Enumeration can proceed.', 'Address map looks tidy.'],
  'lane-widths': ['Width matched to device / silk.', 'Lane count looks right for that slot.', 'Form-factor and link width agree.'],
  generations: ['Generation ↔ per-lane BW locked in.', 'Gen ladder check passed.', 'GT/s and approximate GB/s aligned.'],
  'throughput-calc': ['Aggregate bandwidth correct.', 'Gen × lanes math checks out.', 'Throughput estimate within tolerance.'],
  bifurcation: ['Bifurcation legal — lanes fully accounted.', '×16 split covers every device without overspend.', 'Root-port lane budget balanced.'],
  'tradeoff-boss': ['Leanest valid Gen × width under constraints.', 'Target met with minimal overkill.', 'Tradeoff call looks solid.'],
  'root-vs-switch': ['Fabric roles sorted: Root / Switch / Endpoint.', 'Port vs leaf triage complete.', 'Topology labels look right.'],
  'dma-path': ['DMA path locked: EP → Root → Memory.', 'Payload rides the root complex — no software copy.', 'Host memory write path correct.'],
  'p2p-route': ['Route chosen: P2P or host bounce as appropriate.', 'Peer path vs bounce call looks solid.', 'Fabric routing decision correct.'],
  'config-enum': ['Config walk complete — Type0/Type1 sorted.', 'Hierarchy enumerated; BARs can be claimed next.', 'BDF tree walk looks clean.'],
  'msi-setup': ['Interrupt path armed — vectors cover every queue.', 'MSI / MSI-X upgrade looks right for the device.', 'IRQ mode matches the queue budget.'],
  'aer-triage': ['AER severity and recovery action match.', 'Correctable vs fatal triage complete.', 'Error log routed to the right recovery bin.'],
  'dmi-link': ['DMI vs PEG path locked in.', 'Chipset traffic on DMI — GPU on PEG.', 'CPU↔PCH link distinguished from the GPU slot.'],
  'nvme-map': ['NVMe seated on ×4 as a PCIe endpoint.', 'Protocol and queues look right.', 'M.2/U.2/AIC mapped onto PCIe — not SATA.'],
  'cxl-type': ['CXL Type match looks solid.', 'Protocol lane binned: .io / .cache / .mem.', 'Type 1/2/3 roles sorted over the PCIe PHY.'],
};

export function randomWin(id: MicrogameId): string {
  const list = WIN_STRINGS[id];
  return list[Math.floor(Math.random() * list.length)];
}
