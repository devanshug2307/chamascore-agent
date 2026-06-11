"use client";

import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  ClipboardList,
  ExternalLink,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Trophy,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { isAddress, type Address } from "viem";
import {
  encodeApprove,
  encodeContribution,
  encodeCreateUsdcCircle,
  encodeRiskFlag,
  isSupportedMiniPayChain,
  normalizeChainId,
  stableTokens,
  supportedChains,
  type StableTokenSymbol,
} from "@/lib/celo";
import {
  runChamaScoreAgent,
  sampleCircle,
  shortAddress,
  type CircleConfig,
  type Member,
} from "@/lib/chamascore";
import { demoCircleId, getDemoProofUiItems } from "@/lib/demo-proof";

type EthereumProvider = {
  isMiniPay?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const contractAddress = process.env.NEXT_PUBLIC_CHAMASCORE_CONTRACT as
  | Address
  | undefined;
const defaultCircleId = BigInt(demoCircleId);
const demoProofLinks = getDemoProofUiItems();

const severityClass = {
  low: "bg-trust-soft text-trust",
  medium: "bg-risk-soft text-risk",
  high: "bg-danger-soft text-danger",
};

const reliabilityClass = {
  excellent: "bg-trust-soft text-trust",
  steady: "bg-info-soft text-info",
  watch: "bg-risk-soft text-risk",
  risk: "bg-danger-soft text-danger",
};

export function ChamaScoreApp() {
  const [provider, setProvider] = useState<EthereumProvider | null>(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState<number>();
  const [walletError, setWalletError] = useState("");
  const [config, setConfig] = useState<CircleConfig>(sampleCircle);
  const [memberDraft, setMemberDraft] = useState(
    sampleCircle.members.map((member) => `${member.name},${member.wallet}`).join("\n"),
  );
  const [txStatus, setTxStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const report = useMemo(() => runChamaScoreAgent(config), [config]);
  const isMiniPay = provider?.isMiniPay === true;
  const supportedChain = isSupportedMiniPayChain(chainId);
  const selectedToken = stableTokens[config.tokenSymbol];
  const riskFlagTarget = report.memberScores.find(
    (member) => member.status === "late" || member.reliability === "risk",
  );

  useEffect(() => {
    void connectWallet(true);
  }, []);

  async function connectWallet(isAutoConnect = false) {
    setWalletError("");
    const injected = window.ethereum;

    if (!injected) {
      setProvider(null);
      setWalletError(
        isAutoConnect
          ? "Open this app inside MiniPay or another Celo wallet to prepare live transactions."
          : "No injected wallet found. Open MiniPay Developer Mode and retry.",
      );
      return;
    }

    try {
      setProvider(injected);
      const accounts = (await injected.request({
        method: "eth_requestAccounts",
        params: [],
      })) as string[];
      const nextChainId = normalizeChainId(
        (await injected.request({ method: "eth_chainId" })) as string,
      );
      setAccount(accounts[0] ?? "");
      setChainId(nextChainId);
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  }

  function updateMembersFromDraft() {
    const parsedMembers: Member[] = memberDraft
      .split("\n")
      .map((row, index) => {
        const [name, wallet] = row.split(",").map((value) => value.trim());
        if (!name || !wallet) return null;
        const existing = config.members[index];
        return {
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name,
          wallet,
          proof: existing?.proof ?? "self-pending",
          paidRounds: existing?.paidRounds ?? 0,
          lateRounds: existing?.lateRounds ?? 0,
          missedRounds: existing?.missedRounds ?? 0,
          status: existing?.status ?? "pending",
        } satisfies Member;
      })
      .filter(Boolean) as Member[];

    if (parsedMembers.length > 0) {
      setConfig((current) => ({ ...current, members: parsedMembers }));
    }
  }

  function cycleStatus(memberId: string) {
    setConfig((current) => ({
      ...current,
      members: current.members.map((member) => {
        if (member.id !== memberId) return member;
        const status =
          member.status === "pending"
            ? "paid"
            : member.status === "paid"
              ? "late"
              : "pending";
        return { ...member, status };
      }),
    }));
  }

  async function prepareContribution() {
    if (!provider || !account || !chainId) {
      setTxStatus("Open in MiniPay or connect a Celo wallet first.");
      return;
    }

    if (!supportedChain) {
      setTxStatus("MiniPay supports Celo Mainnet and Celo Sepolia only.");
      return;
    }

    if (!contractAddress) {
      setTxStatus(
        "Contract address is not configured yet. Deploy the contract, then set NEXT_PUBLIC_CHAMASCORE_CONTRACT.",
      );
      return;
    }

    setIsSending(true);
    setTxStatus("Requesting stablecoin approval...");

    try {
      const approval = encodeApprove(
        config.tokenSymbol,
        chainId,
        contractAddress,
        config.contribution,
      );

      const approvalHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: approval.to,
            data: approval.data,
          },
        ],
      })) as string;

      setTxStatus(`Approval sent: ${shortAddress(approvalHash)}. Requesting contribution...`);

      const contributionHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: contractAddress,
            data: encodeContribution(defaultCircleId),
          },
        ],
      })) as string;

      setTxStatus(`Contribution sent: ${shortAddress(contributionHash)}.`);
    } catch (error) {
      setTxStatus(error instanceof Error ? error.message : "Transaction request failed.");
    } finally {
      setIsSending(false);
    }
  }

  async function createPublicMetadataCircle() {
    if (!provider || !account || !chainId) {
      setTxStatus("Open in MiniPay or connect a Celo wallet first.");
      return;
    }

    if (chainId !== supportedChains.sepolia.id) {
      setTxStatus("Switch to Celo Sepolia before creating the public-metadata circle.");
      return;
    }

    if (!contractAddress) {
      setTxStatus("Contract address is not configured.");
      return;
    }

    setIsSending(true);
    setTxStatus("Creating fresh circle with public agent metadata...");

    try {
      const createHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: contractAddress,
            data: encodeCreateUsdcCircle(chainId, account as Address),
          },
        ],
      })) as string;

      setTxStatus(
        `Fresh circle creation sent: ${shortAddress(createHash)}. After it confirms, open the tx and copy the new CircleCreated circleId.`,
      );
    } catch (error) {
      setTxStatus(error instanceof Error ? error.message : "Fresh circle creation failed.");
    } finally {
      setIsSending(false);
    }
  }

  async function switchToCeloSepolia() {
    const injected = provider ?? window.ethereum;

    if (!injected) {
      setTxStatus("Open this app in Chrome with MetaMask enabled, then retry.");
      return;
    }

    setProvider(injected);
    setIsSending(true);
    setTxStatus("Requesting switch to Celo Sepolia...");

    try {
      await injected.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${supportedChains.sepolia.id.toString(16)}` }],
      });

      const nextChainId = normalizeChainId(
        (await injected.request({ method: "eth_chainId" })) as string,
      );
      setChainId(nextChainId);
      setTxStatus("Celo Sepolia selected. Now prepare contribution or record a risk flag.");
    } catch (error) {
      setTxStatus(error instanceof Error ? error.message : "Network switch failed.");
    } finally {
      setIsSending(false);
    }
  }

  async function recordRiskFlag() {
    if (!provider || !account || !chainId) {
      setTxStatus("Open in MiniPay or connect a Celo wallet first.");
      return;
    }

    if (!supportedChain) {
      setTxStatus("Switch to Celo Sepolia before recording a risk flag.");
      return;
    }

    if (!contractAddress) {
      setTxStatus("Contract address is not configured.");
      return;
    }

    if (!riskFlagTarget || !isAddress(riskFlagTarget.wallet)) {
      setTxStatus("No valid late or risky member is selected for a risk flag.");
      return;
    }

    setIsSending(true);
    setTxStatus(`Recording risk flag for ${riskFlagTarget.name}...`);

    try {
      const flagHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: contractAddress,
            data: encodeRiskFlag(
              defaultCircleId,
              riskFlagTarget.wallet,
              `ChamaScore late-payment review: ${riskFlagTarget.name}`,
              riskFlagTarget.reliability === "risk" ? 3 : 2,
            ),
          },
        ],
      })) as string;

      setTxStatus(`Risk flag recorded: ${shortAddress(flagHash)}.`);
    } catch (error) {
      setTxStatus(error instanceof Error ? error.message : "Risk flag transaction failed.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
        <div className="soft-enter flex min-h-[calc(100vh-2rem)] flex-col justify-between rounded-lg border border-border bg-panel p-5 shadow-sm sm:p-6">
          <div className="space-y-8">
            <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Celo Onchain Agents Hackathon</p>
                <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
                  ChamaScore Agent
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                  Portable trust and payout intelligence for MiniPay savings circles.
                  The agent watches contribution behavior, flags risk, prepares stablecoin
                  actions, and turns each round into reputation.
                </p>
              </div>
              <div className="flex gap-2">
                <StatusPill tone={isMiniPay ? "trust" : "info"} icon={<Smartphone size={16} />}>
                  {isMiniPay ? "MiniPay detected" : "Wallet-ready"}
                </StatusPill>
                <StatusPill tone={supportedChain ? "trust" : "risk"} icon={<ShieldCheck size={16} />}>
                  {supportedChain ? "Celo network" : "Needs Celo"}
                </StatusPill>
              </div>
            </header>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="Circle score"
                value={`${report.circleScore}`}
                detail="Contribution reliability"
              />
              <Metric
                label="Collected"
                value={`${report.collectedThisRound.toFixed(2)} ${config.tokenSymbol}`}
                detail={`of ${report.expectedThisRound.toFixed(2)} due`}
              />
              <Metric
                label="Payout state"
                value={report.readyForPayout ? "Ready" : "Hold"}
                detail={`Round ${config.round} to ${config.payoutRecipient}`}
              />
              <Metric
                label="Member proof"
                value={`${report.verifiedMembers}/${config.members.length}`}
                detail={`${report.selfVerifiedMembers} Self verified`}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-lg border border-border bg-panel-muted p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Circle setup</h2>
                    <p className="text-sm text-muted">Configure the demo round.</p>
                  </div>
                  <ClipboardList aria-hidden="true" className="text-info" size={22} />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium">
                    Circle name
                    <input
                      className="mt-2 h-11 w-full rounded-md border border-border bg-panel px-3 text-sm focus-visible:ring-2 focus-visible:ring-trust"
                      value={config.name}
                      onChange={(event) =>
                        setConfig((current) => ({ ...current, name: event.target.value }))
                      }
                      autoComplete="organization"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-medium">
                      Contribution
                      <input
                        className="mt-2 h-11 w-full rounded-md border border-border bg-panel px-3 text-sm focus-visible:ring-2 focus-visible:ring-trust"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={config.contribution}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            contribution: Number(event.target.value),
                          }))
                        }
                        autoComplete="off"
                      />
                    </label>

                    <label className="block text-sm font-medium">
                      Token
                      <select
                        className="mt-2 h-11 w-full rounded-md border border-border bg-panel px-3 text-sm focus-visible:ring-2 focus-visible:ring-trust"
                        value={config.tokenSymbol}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            tokenSymbol: event.target.value as StableTokenSymbol,
                          }))
                        }
                      >
                        {Object.keys(stableTokens).map((symbol) => (
                          <option key={symbol} value={symbol}>
                            {symbol}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block text-sm font-medium">
                    Members
                    <textarea
                      className="mt-2 min-h-28 w-full rounded-md border border-border bg-panel px-3 py-2 font-mono text-xs leading-5 focus-visible:ring-2 focus-visible:ring-trust"
                      value={memberDraft}
                      onChange={(event) => setMemberDraft(event.target.value)}
                      onBlur={updateMembersFromDraft}
                      spellCheck={false}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={updateMembersFromDraft}
                    className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-trust"
                  >
                    <RefreshCcw size={16} aria-hidden="true" />
                    Run agent audit
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-panel-muted p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Member trust table</h2>
                    <p className="text-sm text-muted">Tap a status to simulate this round.</p>
                  </div>
                  <Trophy aria-hidden="true" className="text-trust" size={22} />
                </div>

                <div className="space-y-2">
                  {report.memberScores.map((member) => (
                    <div
                      key={member.id}
                      className="grid gap-3 rounded-md border border-border bg-panel p-3 sm:grid-cols-[1fr_auto_auto_auto]"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{member.name}</p>
                        <p className="font-mono text-xs text-muted">{shortAddress(member.wallet)}</p>
                      </div>
                      <span className="inline-flex min-h-10 items-center justify-center rounded-md bg-info-soft px-3 text-xs font-semibold text-info">
                        {member.proof === "self-verified"
                          ? "Self"
                          : member.proof === "onchain-member"
                            ? "Onchain"
                            : "Pending"}
                      </span>
                      <span
                        className={`inline-flex min-h-10 items-center justify-center rounded-md px-3 text-sm font-semibold ${reliabilityClass[member.reliability]}`}
                      >
                        {member.score}
                      </span>
                      <button
                        type="button"
                        onClick={() => cycleStatus(member.id)}
                        className="min-h-10 rounded-md border border-border bg-panel px-3 text-sm capitalize transition hover:bg-panel-muted focus-visible:ring-2 focus-visible:ring-trust"
                      >
                        {member.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <footer className="mt-8 grid gap-3 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-5">
            <a
              className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:bg-panel-muted focus-visible:ring-2 focus-visible:ring-trust"
              href="/agent.json"
              target="_blank"
              rel="noreferrer"
            >
              Agent metadata
              <ExternalLink size={15} aria-hidden="true" />
            </a>
            <a
              className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:bg-panel-muted focus-visible:ring-2 focus-visible:ring-trust"
              href="/api/agent/report"
              target="_blank"
              rel="noreferrer"
            >
              Agent report API
              <ExternalLink size={15} aria-hidden="true" />
            </a>
            <a
              className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:bg-panel-muted focus-visible:ring-2 focus-visible:ring-trust"
              href="/api/agent/onchain-proof"
              target="_blank"
              rel="noreferrer"
            >
              Onchain proof API
              <ExternalLink size={15} aria-hidden="true" />
            </a>
            <a
              className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:bg-panel-muted focus-visible:ring-2 focus-visible:ring-trust"
              href="/api/agent/actions"
              target="_blank"
              rel="noreferrer"
            >
              Agent actions
              <ExternalLink size={15} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => void connectWallet(false)}
              className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:bg-panel-muted focus-visible:ring-2 focus-visible:ring-trust"
            >
              <Wallet size={15} aria-hidden="true" />
              Retry wallet
            </button>
          </footer>
        </div>

        <aside className="soft-enter space-y-4 lg:sticky lg:top-8 lg:h-fit">
          <Panel title="Agent findings" icon={<AlertTriangle size={20} />}>
            <div className="space-y-3">
              {report.findings.map((finding) => (
                <div key={finding.title} className="rounded-md border border-border bg-panel p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{finding.title}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${severityClass[finding.severity]}`}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{finding.detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Next agent actions" icon={<Bell size={20} />}>
            <div className="space-y-3">
              {report.nextActions.map((action) => (
                <div key={action.label} className="flex gap-3 rounded-md border border-border bg-panel p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-info-soft text-info">
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium">{action.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{action.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="MiniPay transaction path" icon={<Smartphone size={20} />}>
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <InfoRow label="Wallet" value={account ? shortAddress(account) : "Demo mode"} />
                <InfoRow
                  label="Network"
                  value={chainId ? `${chainId}` : "Open in MiniPay"}
                />
                <InfoRow label="Circle" value={`#${defaultCircleId.toString()}`} />
                <InfoRow label="Token" value={`${selectedToken.symbol} (${selectedToken.decimals})`} />
                <InfoRow
                  label="Risk target"
                  value={riskFlagTarget ? riskFlagTarget.name : "None"}
                />
                <InfoRow
                  label="Contract"
                  value={contractAddress ? shortAddress(contractAddress) : "Not deployed"}
                />
              </div>

              {walletError ? (
                <p className="rounded-md bg-risk-soft p-3 text-sm leading-6 text-risk">
                  {walletError}
                </p>
              ) : null}

              {txStatus ? (
                <p className="rounded-md bg-info-soft p-3 text-sm leading-6 text-info">
                  {txStatus}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => void switchToCeloSepolia()}
                disabled={isSending}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-info px-4 py-2 text-sm font-semibold text-info transition hover:bg-info-soft focus-visible:ring-2 focus-visible:ring-info disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Smartphone size={16} aria-hidden="true" />
                {isSending ? "Switching..." : "Switch to Celo Sepolia"}
              </button>

              <button
                type="button"
                onClick={() => void createPublicMetadataCircle()}
                disabled={isSending}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-trust px-4 py-2 text-sm font-semibold text-trust transition hover:bg-trust-soft focus-visible:ring-2 focus-visible:ring-trust disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BadgeCheck size={16} aria-hidden="true" />
                {isSending ? "Creating..." : "Create public metadata circle"}
              </button>

              <button
                type="button"
                onClick={() => void prepareContribution()}
                disabled={isSending}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-trust px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-trust disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={16} aria-hidden="true" />
                {isSending ? "Preparing..." : "Prepare contribution"}
              </button>

              <button
                type="button"
                onClick={() => void recordRiskFlag()}
                disabled={isSending || !riskFlagTarget}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-risk px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-risk disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AlertTriangle size={16} aria-hidden="true" />
                {isSending ? "Recording..." : "Record risk flag"}
              </button>
            </div>
          </Panel>

          <Panel title="Onchain proof" icon={<ExternalLink size={20} />}>
            <div className="space-y-2">
              {demoProofLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-panel px-3 py-2 text-sm transition hover:bg-panel-muted focus-visible:ring-2 focus-visible:ring-trust"
                >
                  <span className="text-muted">{link.label}</span>
                  <span className="flex items-center gap-2 font-mono text-xs">
                    {link.value}
                    <ExternalLink size={14} aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
          </Panel>

          <Panel title="Why this can beat ChamaAgent" icon={<BadgeCheck size={20} />}>
            <ul className="space-y-2 text-sm leading-6 text-muted">
              <li>Focuses on portable reliability scoring instead of only group custody.</li>
              <li>Turns each contribution round into ERC-8004 reputation evidence.</li>
              <li>Gives judges an agent that observes, decides, and recommends action.</li>
              <li>Keeps loans, yield, and regulated money movement out of the demo.</li>
            </ul>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel-muted p-4">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{detail}</p>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-panel-muted p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-info">{icon}</span>
      </div>
      {children}
    </section>
  );
}

function StatusPill({
  tone,
  icon,
  children,
}: {
  tone: "trust" | "info" | "risk";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const classes = {
    trust: "bg-trust-soft text-trust",
    info: "bg-info-soft text-info",
    risk: "bg-risk-soft text-risk",
  };

  return (
    <span className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold ${classes[tone]}`}>
      {icon}
      {children}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-panel px-3 py-2">
      <span className="text-muted">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}
