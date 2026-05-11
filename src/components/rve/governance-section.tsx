import { CheckCircle2, Clock, FileCheck, Vote, XCircle, Coins, User } from "lucide-react";
import { useAuth } from "@/lib/auth/auth.context";
import { voteOnProposal, getProposals } from "@/lib/rve/rve.functions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const VOTES = [
  { id: "RIP-042", title: "Increase Borneo Reforestation tranche by $4.2M", status: "passed", for: 78, against: 18, abstain: 4, ts: "2d ago", quorum: true },
  { id: "RIP-041", title: "Onboard Madagascar Mangrove Restoration asset", status: "passed", for: 91, against: 6, abstain: 3, ts: "5d ago", quorum: true },
  { id: "RIP-040", title: "Adjust restoration fee to 0.5% (was 0.4%)", status: "passed", for: 64, against: 30, abstain: 6, ts: "1w ago", quorum: true },
  { id: "RIP-039", title: "Halt Solar Infrastructure issuance pending audit", status: "rejected", for: 28, against: 68, abstain: 4, ts: "1w ago", quorum: true },
  { id: "RIP-043", title: "Implement automated oracle verification for carbon credits", status: "active", for: 52, against: 8, abstain: 2, ts: "open", quorum: false, canVote: true },
];

const EVENTS = [
  { time: "00:14", title: "Milestone trigger fired", contract: "0xa1f…d20", detail: "Borneo Reforestation • Tranche 4 unlocked" },
  { time: "01:02", title: "Oracle update accepted", contract: "0x8e3…0c7", detail: "Sentinel-2 verification cycle 412 published" },
  { time: "03:48", title: "Treasury disbursement", contract: "0x55b…91a", detail: "$642,000 routed to Pacific Reef Trust" },
  { time: "05:21", title: "Governance vote tally finalized", contract: "0x77d…a14", detail: "RIP-042 passed with 78% support" },
  { time: "08:09", title: "Smart contract upgrade", contract: "0x2c9…f44", detail: "Living payout v4.2 deployed to mainnet" },
];

const DISTRIBUTION = [
  { name: "Indigenous Stewards", pct: 32, color: "var(--emerald)" },
  { name: "Restoration Crews", pct: 24, color: "var(--bioluminescent)" },
  { name: "Community Treasuries", pct: 18, color: "var(--solar)" },
  { name: "Validators & Oracles", pct: 14, color: "var(--copper)" },
  { name: "Protocol Reserve", pct: 12, color: "var(--forest)" },
];

export function GovernanceSection() {
  const { user, isAuthenticated } = useAuth();
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});
  const totalRGN = 18_420_000;

  const handleVote = async (proposalId: string, vote: "for" | "against" | "abstain") => {
    if (!isAuthenticated || !user) return;

    setVotingStates(prev => ({ ...prev, [proposalId]: true }));
    try {
      await voteOnProposal({ proposalId, vote });
      // In a real app, you'd refresh the proposal data here
      console.log(`Voted ${vote} on ${proposalId}`);
    } catch (error) {
      console.error("Voting failed:", error);
    } finally {
      setVotingStates(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* User RID Score */}
      {isAuthenticated && user && (
        <div className="panel lg:col-span-12">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Your Governance Status</div>
                <div className="text-xs text-muted-foreground">DID: {user.did.slice(0, 16)}...</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-primary">{user.ridScore}</div>
              <div className="text-xs text-muted-foreground">RID Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Vote history */}
      <div className="panel lg:col-span-7">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium"><Vote className="h-4 w-4 text-primary" /> Governance Vote History</div>
          <a href="#" className="text-xs text-secondary hover:underline">Full ledger →</a>
        </div>
        <ul className="divide-y divide-border/40">
          {VOTES.map(v => {
            const StatusIcon = v.status === "passed" ? CheckCircle2 : v.status === "rejected" ? XCircle : Clock;
            const color = v.status === "passed" ? "text-primary" : v.status === "rejected" ? "text-destructive" : "text-accent";
            const isVoting = votingStates[v.id];
            return (
              <li key={v.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-muted-foreground">{v.id}</span>
                      <span className={`flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2 py-0.5 capitalize ${color}`}>
                        <StatusIcon className="h-3 w-3" /> {v.status}
                      </span>
                      {!v.quorum && <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">Quorum pending</span>}
                    </div>
                    <div className="mt-1 text-sm font-medium">{v.title}</div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{v.ts}</span>
                </div>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                  <div className="bg-primary" style={{ width: `${v.for}%` }} />
                  <div className="bg-destructive" style={{ width: `${v.against}%` }} />
                  <div className="bg-muted-foreground/50" style={{ width: `${v.abstain}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-mono text-muted-foreground">
                  <span><span className="text-primary">For {v.for}%</span></span>
                  <span><span className="text-destructive">Against {v.against}%</span></span>
                  <span>Abstain {v.abstain}%</span>
                </div>
                {v.canVote && isAuthenticated && user && user.ridScore >= 25 && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(v.id, "for")}
                      disabled={isVoting}
                      className="h-7 text-xs"
                    >
                      For
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(v.id, "against")}
                      disabled={isVoting}
                      className="h-7 text-xs"
                    >
                      Against
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(v.id, "abstain")}
                      disabled={isVoting}
                      className="h-7 text-xs"
                    >
                      Abstain
                    </Button>
                  </div>
                )}
                {v.canVote && isAuthenticated && user && user.ridScore < 25 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Minimum RID score of 25 required to vote
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Smart contract event timeline */}
      <div className="panel lg:col-span-5">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium"><FileCheck className="h-4 w-4 text-secondary" /> Smart Contract Event Timeline</div>
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
        <div className="relative px-5 py-4">
          <div className="absolute bottom-4 left-[3.25rem] top-4 w-px bg-gradient-to-b from-primary/60 via-secondary/40 to-transparent" />
          <ol className="space-y-4">
            {EVENTS.map((e, i) => (
              <li key={i} className="relative flex gap-4">
                <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">{e.time}</span>
                <span className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full bg-gradient-aurora ring-4 ring-card" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.detail}</div>
                  <div className="mt-1 font-mono text-[10px] text-secondary">{e.contract}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Revenue distribution */}
      <div className="panel lg:col-span-12">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium"><Coins className="h-4 w-4 text-accent" /> Community Revenue Distribution</div>
          <div className="text-xs text-muted-foreground">Total distributed: <span className="font-mono text-foreground">{(totalRGN/1e6).toFixed(2)}M RGN</span> · 30d</div>
        </div>
        <div className="grid gap-6 p-5 md:grid-cols-2">
          {/* Donut */}
          <div className="flex items-center justify-center">
            <Donut data={DISTRIBUTION} />
          </div>
          {/* Legend + bars */}
          <div className="space-y-3">
            {DISTRIBUTION.map(d => (
              <div key={d.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-mono text-muted-foreground">{((totalRGN * d.pct) / 100 / 1e6).toFixed(2)}M RGN</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
              </div>
            ))}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md border border-border bg-muted/30 p-3"><div className="font-mono text-xl">4,280</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Communities</div></div>
              <div className="rounded-md border border-border bg-muted/30 p-3"><div className="font-mono text-xl">62</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Countries</div></div>
              <div className="rounded-md border border-border bg-muted/30 p-3"><div className="font-mono text-xl">98.4%</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Settlement Rate</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Donut({ data }: { data: { name: string; pct: number; color: string }[] }) {
  const C = 2 * Math.PI * 60;
  let acc = 0;
  return (
    <svg viewBox="0 0 160 160" className="h-56 w-56">
      <circle cx="80" cy="80" r="60" fill="none" stroke="oklch(0.26 0.025 200)" strokeWidth="22" />
      {data.map((d, i) => {
        const len = (d.pct / 100) * C;
        const offset = -acc;
        acc += len;
        return (
          <circle
            key={i}
            cx="80" cy="80" r="60" fill="none"
            stroke={d.color}
            strokeWidth="22"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={offset}
            transform="rotate(-90 80 80)"
          />
        );
      })}
      <text x="80" y="76" textAnchor="middle" className="fill-foreground" fontSize="22" fontFamily="monospace">100%</text>
      <text x="80" y="94" textAnchor="middle" className="fill-muted-foreground" fontSize="9">DISTRIBUTED</text>
    </svg>
  );
}
