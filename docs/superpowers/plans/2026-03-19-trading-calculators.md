# Trading Calculators Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 9 trading calculators as a dedicated page with card-grid launcher and tabbed workspace to the existing single-file trading journal dashboard.

**Architecture:** All code goes into the existing `src/app/trading-journal-dashboard.tsx` single file. New components are function declarations within the file, following the existing pattern. Each calculator is a self-contained component with local useState for inputs and useMemo for computed outputs. A CalculatorsPage orchestrator manages the card grid and tabbed workspace (max 3 tabs). Two math utilities (normalCDF, normalPDF) are added for Black-Scholes.

**Tech Stack:** React 19 (useState, useMemo, useCallback), Recharts (AreaChart, BarChart for compound growth and break-even visualizations), Tailwind CSS 4, Lucide React icons.

**Spec:** `docs/superpowers/specs/2026-03-19-trading-calculators-design.md`

---

## File Structure

All changes are in a single file:

- **Modify:** `src/app/trading-journal-dashboard.tsx`
  - Lines 42-108: Add `Calculator` icon to lucide-react imports
  - Lines 122-240: Add calculator-related TypeScript interfaces
  - Lines 323-455: Add `normalCDF()`, `normalPDF()` math utilities
  - Lines 1114-1122: Add "calculators" entry to `NAV_ITEMS`
  - Lines 2600-2625: Add `activeView === "calculators"` branch to main content switch
  - After line ~2460 (before `export default`): Insert all calculator components (~1800 lines):
    - `CalculatorField` — reusable input with ⓘ tooltip
    - `CalculatorResultRow` — reusable output display with copy button
    - `PositionSizeCalc` — calculator 1
    - `RiskRewardCalc` — calculator 2
    - `PnlCalc` — calculator 3
    - `OptionsCalc` — calculator 4 (Black-Scholes)
    - `CompoundGrowthCalc` — calculator 5
    - `MarginCalc` — calculator 6
    - `FibonacciCalc` — calculator 7
    - `BreakEvenCalc` — calculator 8
    - `AdrCalc` — calculator 9
    - `CalculatorCard` — card in launcher grid
    - `CalculatorWorkspace` — tabbed workspace manager
    - `CalculatorsPage` — page orchestrator

No new files created. No test files (this is a single-file UI-only project with no test infrastructure).

---

## Chunk 1: Foundation — Imports, Types, Utilities, Nav Integration

### Task 1: Add Calculator icon to lucide-react imports

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx:42-108`

- [ ] **Step 1: Add Calculator import**

Add `Calculator` to the lucide-react import block. Insert after `CandlestickChart` (line 88):

```typescript
  Calculator,
```

Also add `Copy` if not already present (it is — line 71), and `Ruler` for Fibonacci:

```typescript
  Ruler,
```

- [ ] **Step 2: Verify no compile errors**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`
Expected: Build succeeds (warnings OK, no errors)

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): add Calculator and Ruler icons to imports"
```

---

### Task 2: Add calculator TypeScript interfaces

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx:122-240`

- [ ] **Step 1: Add interfaces after the existing types block (after line 239)**

Insert before the `// Constants` section:

```typescript
// ---------------------------------------------------------------------------
// Calculator Types
// ---------------------------------------------------------------------------

type CalculatorId =
  | "position-size"
  | "risk-reward"
  | "pnl"
  | "options"
  | "compound-growth"
  | "margin"
  | "fibonacci"
  | "break-even"
  | "adr"

interface CalculatorMeta {
  id: CalculatorId
  name: string
  description: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  color: string
}

interface OpenCalculatorTab {
  id: CalculatorId
  openedAt: number
}
```

- [ ] **Step 2: Verify no compile errors**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): add calculator TypeScript types"
```

---

### Task 3: Add math utilities for Black-Scholes

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx:323-455`

- [ ] **Step 1: Add normalCDF and normalPDF functions after the existing utility functions (after `getMaxDrawdown`, around line 454)**

```typescript
// ---------------------------------------------------------------------------
// Math Utilities (Black-Scholes)
// ---------------------------------------------------------------------------

/** Standard normal cumulative distribution function — rational approximation (Abramowitz & Stegun 26.2.17) */
function normalCDF(x: number): number {
  if (x < -10) return 0
  if (x > 10) return 1
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x)
  const t = 1.0 / (1.0 + p * absX)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2)
  return 0.5 * (1.0 + sign * y)
}

/** Standard normal probability density function */
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}
```

- [ ] **Step 2: Verify no compile errors**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): add normalCDF and normalPDF math utilities"
```

---

### Task 4: Add "Calculators" to sidebar nav and route it

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx:1114-1122` (NAV_ITEMS)
- Modify: `src/app/trading-journal-dashboard.tsx:2617-2624` (activeView switch)

- [ ] **Step 1: Add calculators to NAV_ITEMS**

Insert after the `{ key: "analytics", ... }` entry (line 1117):

```typescript
  { key: "calculators", label: "Calculators", icon: Calculator },
```

- [ ] **Step 2: Add calculator view branch to main content switch**

Find the block that starts with:
```typescript
{activeView !== "dashboard" && activeView !== "journal" && activeView !== "analytics" && (
```

Replace it with:
```typescript
              {activeView === "calculators" && (
                <div className="max-w-7xl mx-auto">
                  <CalculatorsPage />
                </div>
              )}

              {activeView !== "dashboard" && activeView !== "journal" && activeView !== "analytics" && activeView !== "calculators" && (
```

- [ ] **Step 3: Add a placeholder CalculatorsPage component**

Insert before the `export default function TradingDashboard()` line:

```typescript
// ---------------------------------------------------------------------------
// SECTION 5: Calculators Page
// ---------------------------------------------------------------------------

function CalculatorsPage() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Calculator className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-100 mb-1">Trading Calculators</h2>
        <p className="text-sm text-slate-400">Coming soon — 9 professional calculators</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify the page renders**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`
Expected: Build succeeds. Navigating to Calculators in sidebar shows placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): add Calculators nav item and placeholder page"
```

---

## Chunk 2: Shared Components — CalculatorField, CalculatorResultRow, Card Grid, Tabbed Workspace

### Task 5: Build the CalculatorField reusable input component

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (insert in SECTION 5, replacing the placeholder)

- [ ] **Step 1: Create CalculatorField component**

This is the core reusable input with ⓘ tooltip, dollar/percent prefix, and validation. Insert at the start of SECTION 5:

```typescript
// ---------------------------------------------------------------------------
// SECTION 5: Calculators Page
// ---------------------------------------------------------------------------

const CALCULATOR_REGISTRY: CalculatorMeta[] = [
  { id: "position-size", name: "Position Size", description: "Calculate optimal position size based on risk tolerance", icon: Target, color: "emerald" },
  { id: "risk-reward", name: "Risk / Reward", description: "Evaluate R:R ratio and expected value of a trade setup", icon: Scale, color: "blue" },
  { id: "pnl", name: "Profit / Loss", description: "Calculate exact P&L including all fees and commissions", icon: DollarSign, color: "emerald" },
  { id: "options", name: "Options Pricing", description: "Black-Scholes fair value and Greeks for any option", icon: Brain, color: "purple" },
  { id: "compound-growth", name: "Compound Growth", description: "Project account growth with compounding over time", icon: TrendingUp, color: "cyan" },
  { id: "margin", name: "Margin Calculator", description: "Determine margin requirements, buying power, and leverage", icon: Shield, color: "amber" },
  { id: "fibonacci", name: "Fibonacci Levels", description: "Calculate key retracement and extension price levels", icon: Ruler, color: "orange" },
  { id: "break-even", name: "Break-Even Analysis", description: "Determine if your trading system is profitable long-term", icon: Activity, color: "pink" },
  { id: "adr", name: "ADR% Calculator", description: "Average Daily Range for setting realistic targets and stops", icon: BarChart3, color: "teal" },
]

interface CalculatorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  prefix?: string
  suffix?: string
  type?: string
  placeholder?: string
  error?: string
  min?: number
  max?: number
  step?: string
  className?: string
}

function CalculatorField({
  label,
  value,
  onChange,
  helperText,
  prefix,
  suffix,
  type = "number",
  placeholder,
  error,
  min,
  max,
  step,
  className = "",
}: CalculatorFieldProps) {
  const [showHelper, setShowHelper] = useState(false)

  return (
    <div className={classNames("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
        {helperText && (
          <button
            type="button"
            className="text-slate-500 hover:text-emerald-400 transition-colors focus:outline-none"
            onClick={() => setShowHelper(!showHelper)}
            onMouseEnter={() => setShowHelper(true)}
            onMouseLeave={() => setShowHelper(false)}
            aria-label={`Info about ${label}`}
          >
            <Info size={13} />
          </button>
        )}
      </div>
      {showHelper && helperText && (
        <p className="text-xs text-slate-500 bg-slate-800/60 rounded-md px-2.5 py-1.5 border border-slate-700/50">
          {helperText}
        </p>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs text-slate-500 pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={classNames(
            "w-full bg-slate-900/80 border border-slate-700 rounded-lg py-2 text-sm text-slate-100 placeholder-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200",
            "font-mono tabular-nums",
            prefix ? "pl-7 pr-3" : "px-3",
            suffix ? "pr-8" : "",
            error && "border-red-500 focus:ring-red-500/40 focus:border-red-500"
          )}
        />
        {suffix && (
          <span className="absolute right-3 text-xs text-slate-500 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
```

- [ ] **Step 2: Verify no compile errors**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): add CalculatorField component and calculator registry"
```

---

### Task 6: Build CalculatorResultRow component

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (insert after CalculatorField)

- [ ] **Step 1: Create CalculatorResultRow component**

```typescript
interface CalculatorResultRowProps {
  label: string
  value: string
  subtext?: string
  variant?: "neutral" | "profit" | "loss" | "warning"
  large?: boolean
}

function CalculatorResultRow({ label, value, subtext, variant = "neutral", large = false }: CalculatorResultRowProps) {
  const [copied, setCopied] = useState(false)

  const colorMap: Record<string, string> = {
    neutral: "text-slate-100",
    profit: "text-emerald-400",
    loss: "text-red-400",
    warning: "text-amber-400",
  }

  const handleCopy = useCallback(() => {
    const raw = value.replace(/[^0-9.\-]/g, "")
    navigator.clipboard.writeText(raw || value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [value])

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-b-0 group">
      <div className="flex flex-col">
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
        {subtext && <span className="text-[10px] text-slate-500">{subtext}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={classNames(
            "font-mono tabular-nums font-semibold",
            large ? "text-xl" : "text-sm",
            colorMap[variant]
          )}
        >
          {value}
        </span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-emerald-400 transition-all"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify no compile errors**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): add CalculatorResultRow component with copy button"
```

---

### Task 7: Build CalculatorCard, CalculatorWorkspace, and CalculatorsPage orchestrator

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace placeholder CalculatorsPage)

- [ ] **Step 1: Create CalculatorCard component**

```typescript
function CalculatorCard({
  meta,
  isOpen,
  onClick,
}: {
  meta: CalculatorMeta
  isOpen: boolean
  onClick: () => void
}) {
  const Icon = meta.icon
  const bgColorMap: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-400",
    blue: "bg-blue-500/15 text-blue-400",
    purple: "bg-purple-500/15 text-purple-400",
    cyan: "bg-cyan-500/15 text-cyan-400",
    amber: "bg-amber-500/15 text-amber-400",
    orange: "bg-orange-500/15 text-orange-400",
    pink: "bg-pink-500/15 text-pink-400",
    teal: "bg-teal-500/15 text-teal-400",
  }

  return (
    <button
      onClick={onClick}
      className={classNames(
        "relative text-left p-4 rounded-xl border transition-all duration-200 group",
        "bg-slate-900/80 backdrop-blur-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        isOpen
          ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10"
          : "border-slate-700/50 hover:border-slate-600"
      )}
    >
      {isOpen && (
        <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
          Open
        </span>
      )}
      <div className={classNames("w-9 h-9 rounded-lg flex items-center justify-center mb-3", bgColorMap[meta.color] || bgColorMap.emerald)}>
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-semibold text-slate-100 mb-1">{meta.name}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{meta.description}</p>
    </button>
  )
}
```

- [ ] **Step 2: Create the CalculatorsPage with workspace and tab management**

Replace the placeholder `CalculatorsPage` function with the full implementation:

```typescript
function CalculatorsPage() {
  const [openTabs, setOpenTabs] = useState<OpenCalculatorTab[]>([])
  const [activeTabId, setActiveTabId] = useState<CalculatorId | null>(null)

  const openCalculator = useCallback((id: CalculatorId) => {
    setOpenTabs((prev) => {
      const exists = prev.find((t) => t.id === id)
      if (exists) {
        setActiveTabId(id)
        return prev
      }
      if (prev.length >= 3) {
        // Replace oldest tab
        const sorted = [...prev].sort((a, b) => a.openedAt - b.openedAt)
        const newTabs = sorted.slice(1)
        newTabs.push({ id, openedAt: Date.now() })
        setActiveTabId(id)
        return newTabs
      }
      setActiveTabId(id)
      return [...prev, { id, openedAt: Date.now() }]
    })
  }, [])

  const closeTab = useCallback((id: CalculatorId) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (activeTabId === id) {
        setActiveTabId(next.length > 0 ? next[next.length - 1].id : null)
      }
      return next
    })
  }, [activeTabId])

  const openTabIds = useMemo(() => new Set(openTabs.map((t) => t.id)), [openTabs])

  const renderCalculator = useCallback((id: CalculatorId) => {
    switch (id) {
      case "position-size": return <PositionSizeCalc />
      case "risk-reward": return <RiskRewardCalc />
      case "pnl": return <PnlCalc />
      case "options": return <OptionsCalc />
      case "compound-growth": return <CompoundGrowthCalc />
      case "margin": return <MarginCalc />
      case "fibonacci": return <FibonacciCalc />
      case "break-even": return <BreakEvenCalc />
      case "adr": return <AdrCalc />
      default: return null
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Trading Calculators</h1>
        <p className="text-sm text-slate-400 mt-1">Professional tools to size, analyze, and plan your trades</p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3">
        {CALCULATOR_REGISTRY.map((meta) => (
          <CalculatorCard
            key={meta.id}
            meta={meta}
            isOpen={openTabIds.has(meta.id)}
            onClick={() => openCalculator(meta.id)}
          />
        ))}
      </div>

      {/* Tabbed Workspace */}
      {openTabs.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center border-b border-slate-700/50 overflow-x-auto" role="tablist">
            {openTabs.map((tab) => {
              const meta = CALCULATOR_REGISTRY.find((m) => m.id === tab.id)
              if (!meta) return null
              const Icon = meta.icon
              const isActive = activeTabId === tab.id
              return (
                <div
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "text-emerald-400 border-emerald-500 bg-slate-800/40"
                      : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20"
                  )}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <Icon size={15} />
                  <span>{meta.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                    className="ml-1 text-slate-500 hover:text-red-400 transition-colors rounded-full p-0.5 hover:bg-slate-700/50"
                    aria-label={`Close ${meta.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Active Calculator Panel */}
          <div className="p-5" role="tabpanel">
            {activeTabId && renderCalculator(activeTabId)}
          </div>
        </div>
      )}

      {/* Empty state when no tabs */}
      {openTabs.length === 0 && (
        <div className="flex items-center justify-center py-16 text-center border border-dashed border-slate-700/50 rounded-xl">
          <div>
            <Calculator className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Click a calculator above to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add temporary stubs for all 9 calculator components**

Insert before `CalculatorCard`, one stub per calculator so the build passes:

```typescript
function PositionSizeCalc() { return <p className="text-slate-400 text-sm">Position Size Calculator — implementing...</p> }
function RiskRewardCalc() { return <p className="text-slate-400 text-sm">Risk/Reward Calculator — implementing...</p> }
function PnlCalc() { return <p className="text-slate-400 text-sm">P&L Calculator — implementing...</p> }
function OptionsCalc() { return <p className="text-slate-400 text-sm">Options Pricing Calculator — implementing...</p> }
function CompoundGrowthCalc() { return <p className="text-slate-400 text-sm">Compound Growth Calculator — implementing...</p> }
function MarginCalc() { return <p className="text-slate-400 text-sm">Margin Calculator — implementing...</p> }
function FibonacciCalc() { return <p className="text-slate-400 text-sm">Fibonacci Levels Calculator — implementing...</p> }
function BreakEvenCalc() { return <p className="text-slate-400 text-sm">Break-Even Calculator — implementing...</p> }
function AdrCalc() { return <p className="text-slate-400 text-sm">ADR% Calculator — implementing...</p> }
```

- [ ] **Step 4: Verify the full page works**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`
Expected: Build succeeds. Clicking "Calculators" in sidebar shows card grid. Clicking a card opens a tab with stub text.

- [ ] **Step 5: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): add card grid, tabbed workspace, and calculator stubs"
```

---

## Chunk 3: Calculators 1-3 — Position Size, Risk/Reward, P&L

### Task 8: Implement Position Size Calculator

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace PositionSizeCalc stub)

- [ ] **Step 1: Replace the PositionSizeCalc stub with the full implementation**

```typescript
function PositionSizeCalc() {
  const [accountSize, setAccountSize] = useState("")
  const [riskPercent, setRiskPercent] = useState("1")
  const [entryPrice, setEntryPrice] = useState("")
  const [stopLoss, setStopLoss] = useState("")

  const results = useMemo(() => {
    const acc = parseFloat(accountSize)
    const riskPct = parseFloat(riskPercent)
    const entry = parseFloat(entryPrice)
    const sl = parseFloat(stopLoss)

    if (!acc || !riskPct || !entry || !sl || entry === sl) return null

    const riskAmount = acc * (riskPct / 100)
    const riskPerShare = Math.abs(entry - sl)
    const positionSize = Math.floor(riskAmount / riskPerShare)
    const totalValue = positionSize * entry
    const pctOfAccount = (totalValue / acc) * 100
    const direction = sl < entry ? "LONG" : "SHORT"

    return { riskAmount, positionSize, totalValue, pctOfAccount, direction, riskPerShare }
  }, [accountSize, riskPercent, entryPrice, stopLoss])

  const handleReset = useCallback(() => {
    setAccountSize("")
    setRiskPercent("1")
    setEntryPrice("")
    setStopLoss("")
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inputs</h3>
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
        </div>
        <CalculatorField
          label="Account Size"
          value={accountSize}
          onChange={setAccountSize}
          prefix="$"
          placeholder="50,000"
          helperText="Your total trading account balance — check your broker's account summary page"
        />
        <CalculatorField
          label="Risk per Trade"
          value={riskPercent}
          onChange={setRiskPercent}
          suffix="%"
          placeholder="1"
          step="0.25"
          min={0.1}
          max={100}
          helperText="% of account you're willing to lose on this trade. Most pros risk 0.5–2% per trade"
        />
        <CalculatorField
          label="Entry Price"
          value={entryPrice}
          onChange={setEntryPrice}
          prefix="$"
          placeholder="220.00"
          helperText="The price you plan to enter at — use your broker's Level 2 or TradingView last price"
        />
        <CalculatorField
          label="Stop Loss Price"
          value={stopLoss}
          onChange={setStopLoss}
          prefix="$"
          placeholder="215.00"
          helperText="Your invalidation level — the price where your thesis is wrong"
        />
      </div>

      {/* Results */}
      <div className="lg:col-span-3 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Results</h3>
        {results ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={results.direction === "LONG" ? "success" : "danger"}>
                {results.direction === "LONG" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span className="ml-1">{results.direction}</span>
              </Badge>
              <span className="text-xs text-slate-500">Inferred from entry vs stop loss</span>
            </div>
            <CalculatorResultRow label="Risk Amount" value={`$${results.riskAmount.toFixed(2)}`} subtext={`${riskPercent}% of account`} />
            <CalculatorResultRow label="Risk Per Share" value={`$${results.riskPerShare.toFixed(2)}`} subtext="Distance to stop loss" />
            <CalculatorResultRow label="Position Size" value={`${results.positionSize} shares`} variant="profit" large />
            <CalculatorResultRow label="Total Position Value" value={`$${results.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
            <CalculatorResultRow
              label="% of Account"
              value={`${results.pctOfAccount.toFixed(1)}%`}
              variant={results.pctOfAccount > 100 ? "loss" : results.pctOfAccount > 50 ? "warning" : "neutral"}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
            Fill in all fields to see results
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): implement Position Size calculator"
```

---

### Task 9: Implement Risk/Reward Calculator

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace RiskRewardCalc stub)

- [ ] **Step 1: Replace RiskRewardCalc stub**

```typescript
function RiskRewardCalc() {
  const [entryPrice, setEntryPrice] = useState("")
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")
  const [winRate, setWinRate] = useState("50")

  const results = useMemo(() => {
    const entry = parseFloat(entryPrice)
    const sl = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)
    const wr = parseFloat(winRate) / 100

    if (!entry || !sl || !tp || isNaN(wr)) return null

    const risk = Math.abs(entry - sl)
    const reward = Math.abs(tp - entry)
    if (risk === 0) return null

    const rr = reward / risk
    const breakEvenWr = (1 / (1 + rr)) * 100
    const ev = (wr * reward) - ((1 - wr) * risk)

    return { risk, reward, rr, breakEvenWr, ev, winRateDecimal: wr }
  }, [entryPrice, stopLoss, takeProfit, winRate])

  const handleReset = useCallback(() => {
    setEntryPrice(""); setStopLoss(""); setTakeProfit(""); setWinRate("50")
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inputs</h3>
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
        </div>
        <CalculatorField label="Entry Price" value={entryPrice} onChange={setEntryPrice} prefix="$" placeholder="220.00" helperText="Your planned entry price" />
        <CalculatorField label="Stop Loss" value={stopLoss} onChange={setStopLoss} prefix="$" placeholder="215.00" helperText="Price where you'll exit if wrong" />
        <CalculatorField label="Take Profit" value={takeProfit} onChange={setTakeProfit} prefix="$" placeholder="232.00" helperText="Your target exit price — use key levels, supply/demand zones, or prior highs/lows on chart" />
        <CalculatorField label="Win Rate" value={winRate} onChange={setWinRate} suffix="%" placeholder="50" helperText="Your historical win rate — find this on your journal's Insights panel under 'Win Rate'" />
      </div>

      <div className="lg:col-span-3 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Results</h3>
        {results ? (
          <div className="space-y-1">
            {/* Visual R:R Bar */}
            <div className="mb-4">
              <div className="flex rounded-lg overflow-hidden h-8">
                <div
                  className="bg-red-500/30 border-r border-slate-700 flex items-center justify-center text-xs font-mono text-red-300"
                  style={{ width: `${(results.risk / (results.risk + results.reward)) * 100}%` }}
                >
                  Risk ${results.risk.toFixed(2)}
                </div>
                <div
                  className="bg-emerald-500/30 flex items-center justify-center text-xs font-mono text-emerald-300"
                  style={{ width: `${(results.reward / (results.risk + results.reward)) * 100}%` }}
                >
                  Reward ${results.reward.toFixed(2)}
                </div>
              </div>
            </div>
            <CalculatorResultRow label="R:R Ratio" value={`${results.rr.toFixed(2)} : 1`} variant={results.rr >= 2 ? "profit" : results.rr >= 1 ? "warning" : "loss"} large />
            <CalculatorResultRow label="Risk (points)" value={`$${results.risk.toFixed(2)}`} variant="loss" />
            <CalculatorResultRow label="Reward (points)" value={`$${results.reward.toFixed(2)}`} variant="profit" />
            <CalculatorResultRow
              label="Breakeven Win Rate"
              value={`${results.breakEvenWr.toFixed(1)}%`}
              subtext={`You need to win ≥${results.breakEvenWr.toFixed(0)}% of the time at this R:R`}
            />
            <CalculatorResultRow
              label="Expected Value"
              value={`$${results.ev.toFixed(2)} per trade`}
              variant={results.ev > 0 ? "profit" : results.ev < 0 ? "loss" : "neutral"}
              subtext={results.ev > 0 ? "Positive edge — this setup is profitable over time" : "Negative edge — improve R:R or win rate"}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
            Fill in all fields to see results
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): implement Risk/Reward calculator"
```

---

### Task 10: Implement Profit/Loss Calculator

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace PnlCalc stub)

- [ ] **Step 1: Replace PnlCalc stub**

```typescript
function PnlCalc() {
  const [direction, setDirection] = useState<"long" | "short">("long")
  const [entryPrice, setEntryPrice] = useState("")
  const [exitPrice, setExitPrice] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [commission, setCommission] = useState("0")
  const [otherFees, setOtherFees] = useState("0")

  const results = useMemo(() => {
    const entry = parseFloat(entryPrice)
    const exit = parseFloat(exitPrice)
    const qty = parseFloat(quantity)
    const comm = parseFloat(commission) || 0
    const fees = parseFloat(otherFees) || 0

    if (!entry || !exit || !qty) return null

    const dirMult = direction === "long" ? 1 : -1
    const grossPnl = (exit - entry) * qty * dirMult
    const totalFees = (comm * 2) + fees
    const netPnl = grossPnl - totalFees
    const returnPct = (netPnl / (entry * qty)) * 100
    const breakeven = direction === "long"
      ? entry + (totalFees / qty)
      : entry - (totalFees / qty)

    return { grossPnl, totalFees, netPnl, returnPct, breakeven }
  }, [direction, entryPrice, exitPrice, quantity, commission, otherFees])

  const handleReset = useCallback(() => {
    setDirection("long"); setEntryPrice(""); setExitPrice(""); setQuantity("1"); setCommission("0"); setOtherFees("0")
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inputs</h3>
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
        </div>

        {/* Direction Toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Direction</label>
          <div className="flex rounded-lg overflow-hidden border border-slate-700" role="radiogroup">
            {(["long", "short"] as const).map((dir) => (
              <button
                key={dir}
                role="radio"
                aria-checked={direction === dir}
                onClick={() => setDirection(dir)}
                className={classNames(
                  "flex-1 py-2 text-sm font-semibold uppercase transition-colors",
                  direction === dir
                    ? dir === "long" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
                )}
              >
                {dir === "long" ? "↑ Long" : "↓ Short"}
              </button>
            ))}
          </div>
        </div>

        <CalculatorField label="Entry Price" value={entryPrice} onChange={setEntryPrice} prefix="$" placeholder="220.00" helperText="Price you bought/shorted at" />
        <CalculatorField label="Exit Price" value={exitPrice} onChange={setExitPrice} prefix="$" placeholder="235.00" helperText="Price you sold/covered at" />
        <CalculatorField label="Quantity" value={quantity} onChange={setQuantity} placeholder="100" helperText="Number of shares, contracts, or units" />
        <CalculatorField label="Commission (per trade)" value={commission} onChange={setCommission} prefix="$" placeholder="0.00" helperText="Check your broker's fee schedule — e.g., IBKR: $0.005/share, Webull/Robinhood: $0" />
        <CalculatorField label="Other Fees" value={otherFees} onChange={setOtherFees} prefix="$" placeholder="0.00" helperText="SEC fees, exchange fees, ECN fees — usually shown on your trade confirmation" />
      </div>

      <div className="lg:col-span-3 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Results</h3>
        {results ? (
          <div className="space-y-1">
            <CalculatorResultRow label="Gross P&L" value={`${results.grossPnl >= 0 ? "+" : ""}$${results.grossPnl.toFixed(2)}`} variant={results.grossPnl >= 0 ? "profit" : "loss"} />
            <CalculatorResultRow label="Total Fees" value={`-$${results.totalFees.toFixed(2)}`} subtext="Round-trip commissions + other fees" variant="loss" />
            <CalculatorResultRow label="Net P&L" value={`${results.netPnl >= 0 ? "+" : ""}$${results.netPnl.toFixed(2)}`} variant={results.netPnl >= 0 ? "profit" : "loss"} large />
            <CalculatorResultRow label="Return %" value={`${results.returnPct >= 0 ? "+" : ""}${results.returnPct.toFixed(2)}%`} variant={results.returnPct >= 0 ? "profit" : "loss"} />
            <CalculatorResultRow label="Breakeven Price" value={`$${results.breakeven.toFixed(2)}`} subtext="Price needed to cover all fees" />
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
            Fill in entry, exit, and quantity to see results
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): implement Profit/Loss calculator"
```

---

## Chunk 4: Calculators 4-6 — Options Pricing, Compound Growth, Margin

### Task 11: Implement Options Pricing Calculator (Black-Scholes)

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace OptionsCalc stub)

- [ ] **Step 1: Replace OptionsCalc stub**

```typescript
function OptionsCalc() {
  const [optionType, setOptionType] = useState<"call" | "put">("call")
  const [underlyingPrice, setUnderlyingPrice] = useState("")
  const [strikePrice, setStrikePrice] = useState("")
  const [dte, setDte] = useState("30")
  const [iv, setIv] = useState("30")
  const [riskFreeRate, setRiskFreeRate] = useState("4.3")

  const results = useMemo(() => {
    const S = parseFloat(underlyingPrice)
    const K = parseFloat(strikePrice)
    const daysToExpiry = parseFloat(dte)
    const sigma = parseFloat(iv) / 100
    const r = parseFloat(riskFreeRate) / 100

    if (!S || !K || !daysToExpiry || !sigma || isNaN(r)) return null
    if (daysToExpiry <= 0 || sigma <= 0) return null

    const T = daysToExpiry / 365
    const sqrtT = Math.sqrt(T)

    const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * sqrtT)
    const d2 = d1 - sigma * sqrtT

    const Nd1 = normalCDF(d1)
    const Nd2 = normalCDF(d2)
    const Nnd1 = normalCDF(-d1)
    const Nnd2 = normalCDF(-d2)
    const phid1 = normalPDF(d1)

    const eRT = Math.exp(-r * T)

    let price: number
    let delta: number
    let thetaAnnual: number
    let rho: number

    if (optionType === "call") {
      price = S * Nd1 - K * eRT * Nd2
      delta = Nd1
      thetaAnnual = -(S * phid1 * sigma) / (2 * sqrtT) - r * K * eRT * Nd2
      rho = K * T * eRT * Nd2 / 100
    } else {
      price = K * eRT * Nnd2 - S * Nnd1
      delta = Nd1 - 1
      thetaAnnual = -(S * phid1 * sigma) / (2 * sqrtT) + r * K * eRT * Nnd2
      rho = -K * T * eRT * Nnd2 / 100
    }

    const gamma = phid1 / (S * sigma * sqrtT)
    const thetaPerDay = thetaAnnual / 365
    const vega = S * phid1 * sqrtT / 100

    const intrinsic = optionType === "call" ? Math.max(0, S - K) : Math.max(0, K - S)
    const extrinsic = Math.max(0, price - intrinsic)

    return { price, delta, gamma, thetaPerDay, vega, rho, intrinsic, extrinsic }
  }, [optionType, underlyingPrice, strikePrice, dte, iv, riskFreeRate])

  const handleReset = useCallback(() => {
    setOptionType("call"); setUnderlyingPrice(""); setStrikePrice(""); setDte("30"); setIv("30"); setRiskFreeRate("4.3")
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inputs</h3>
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
        </div>

        {/* Option Type Toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Option Type</label>
          <div className="flex rounded-lg overflow-hidden border border-slate-700" role="radiogroup">
            {(["call", "put"] as const).map((type) => (
              <button
                key={type}
                role="radio"
                aria-checked={optionType === type}
                onClick={() => setOptionType(type)}
                className={classNames(
                  "flex-1 py-2 text-sm font-semibold uppercase transition-colors",
                  optionType === type
                    ? type === "call" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <CalculatorField label="Underlying Price" value={underlyingPrice} onChange={setUnderlyingPrice} prefix="$" placeholder="220.00" helperText="Current stock price — search the ticker on TradingView or your broker" />
        <CalculatorField label="Strike Price" value={strikePrice} onChange={setStrikePrice} prefix="$" placeholder="225.00" helperText="The option's strike — found in your broker's options chain" />
        <CalculatorField label="Days to Expiry" value={dte} onChange={setDte} placeholder="30" helperText="Calendar days until expiration — shown on the options chain header" />
        <CalculatorField label="Implied Volatility" value={iv} onChange={setIv} suffix="%" placeholder="30" helperText="IV is listed per strike in your options chain — Thinkorswim: 'Impl Vol' column, TastyTrade: shown on the trade page" />
        <CalculatorField label="Risk-Free Rate" value={riskFreeRate} onChange={setRiskFreeRate} suffix="%" placeholder="4.3" helperText="US 10-Year Treasury yield — search 'US10Y' on TradingView or google 'treasury yield today'" />
      </div>

      <div className="lg:col-span-3 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Results</h3>
        {results ? (
          <div className="space-y-1">
            <CalculatorResultRow label="Theoretical Price" value={`$${results.price.toFixed(4)}`} variant="profit" large />

            {/* Intrinsic vs Extrinsic bar */}
            <div className="my-3">
              <div className="flex text-[10px] text-slate-500 justify-between mb-1">
                <span>Intrinsic: ${results.intrinsic.toFixed(2)}</span>
                <span>Extrinsic: ${results.extrinsic.toFixed(2)}</span>
              </div>
              <div className="flex rounded-lg overflow-hidden h-3 bg-slate-700/50">
                {results.price > 0 && (
                  <>
                    <div className="bg-blue-500/60" style={{ width: `${(results.intrinsic / results.price) * 100}%` }} />
                    <div className="bg-purple-500/60" style={{ width: `${(results.extrinsic / results.price) * 100}%` }} />
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-2">Greeks</p>
            </div>
            <CalculatorResultRow label="Delta" value={results.delta.toFixed(4)} subtext="Price change per $1 move in underlying" />
            <CalculatorResultRow label="Gamma" value={results.gamma.toFixed(4)} subtext="Rate of change of Delta" />
            <CalculatorResultRow label="Theta" value={`$${results.thetaPerDay.toFixed(4)}/day`} subtext="Daily time decay — how much value the option loses per day" variant="loss" />
            <CalculatorResultRow label="Vega" value={`$${results.vega.toFixed(4)}`} subtext="Price change per 1% change in IV" />
            <CalculatorResultRow label="Rho" value={`$${results.rho.toFixed(4)}`} subtext="Price change per 1% change in interest rate" />
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
            Fill in underlying price and strike to see results
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): implement Black-Scholes Options Pricing calculator"
```

---

### Task 12: Implement Compound Growth Calculator

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace CompoundGrowthCalc stub)

- [ ] **Step 1: Replace CompoundGrowthCalc stub**

```typescript
function CompoundGrowthCalc() {
  const [startingCapital, setStartingCapital] = useState("")
  const [returnPerPeriod, setReturnPerPeriod] = useState("")
  const [periodType, setPeriodType] = useState("Weekly")
  const [numPeriods, setNumPeriods] = useState("52")
  const [contribution, setContribution] = useState("0")

  const results = useMemo(() => {
    const start = parseFloat(startingCapital)
    const rate = parseFloat(returnPerPeriod) / 100
    const periods = parseInt(numPeriods, 10)
    const contrib = parseFloat(contribution) || 0

    if (!start || isNaN(rate) || !periods || periods <= 0) return null

    const chartData: { period: number; balance: number }[] = []
    let balance = start
    chartData.push({ period: 0, balance })

    for (let i = 1; i <= periods; i++) {
      balance = balance * (1 + rate) + contrib
      chartData.push({ period: i, balance })
    }

    const finalBalance = balance
    const totalContributions = start + contrib * periods
    const totalReturn = finalBalance - totalContributions
    const totalReturnPct = ((finalBalance - start) / start) * 100

    return { finalBalance, totalReturn, totalReturnPct, totalContributions, chartData, growthFromCompounding: totalReturn }
  }, [startingCapital, returnPerPeriod, numPeriods, contribution])

  const handleReset = useCallback(() => {
    setStartingCapital(""); setReturnPerPeriod(""); setPeriodType("Weekly"); setNumPeriods("52"); setContribution("0")
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inputs</h3>
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
        </div>
        <CalculatorField label="Starting Capital" value={startingCapital} onChange={setStartingCapital} prefix="$" placeholder="50,000" helperText="Your current account balance" />
        <CalculatorField label="Return per Period" value={returnPerPeriod} onChange={setReturnPerPeriod} suffix="%" placeholder="2" helperText="Your average return per period — check your journal's monthly performance chart for a realistic number" />

        {/* Period Type Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Period Type</label>
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        <CalculatorField label="Number of Periods" value={numPeriods} onChange={setNumPeriods} placeholder="52" helperText="How many periods to project — e.g., 52 weeks = 1 year, 12 months = 1 year" />
        <CalculatorField label="Additional Contribution" value={contribution} onChange={setContribution} prefix="$" placeholder="0" helperText="Extra capital added each period — e.g., monthly deposit from salary" />
      </div>

      <div className="lg:col-span-3 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Results</h3>
        {results ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <CalculatorResultRow label="Final Balance" value={`$${results.finalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} variant="profit" large />
              <CalculatorResultRow label="Total Return" value={`+$${results.totalReturn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subtext={`${results.totalReturnPct.toFixed(1)}% total`} variant="profit" />
              <CalculatorResultRow label="Total Contributions" value={`$${results.totalContributions.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              <CalculatorResultRow label="Growth from Compounding" value={`$${results.growthFromCompounding.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} variant="profit" />
            </div>

            {/* Growth Chart */}
            <div className="h-48 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="compoundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="period" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(value: number) => [`$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Balance"]}
                    labelFormatter={(label: number) => `${periodType} ${label}`}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#10b981" fill="url(#compoundGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
            Fill in starting capital and return to see projections
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): implement Compound Growth calculator with chart"
```

---

### Task 13: Implement Margin Calculator

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace MarginCalc stub)

- [ ] **Step 1: Replace MarginCalc stub**

```typescript
function MarginCalc() {
  const [positionValue, setPositionValue] = useState("")
  const [marginReq, setMarginReq] = useState("50")
  const [accountEquity, setAccountEquity] = useState("")
  const [maintenanceMargin, setMaintenanceMargin] = useState("25")

  const results = useMemo(() => {
    const posVal = parseFloat(positionValue)
    const marginPct = parseFloat(marginReq) / 100
    const equity = parseFloat(accountEquity)
    const maintPct = parseFloat(maintenanceMargin) / 100

    if (!posVal || !marginPct || !equity || isNaN(maintPct)) return null

    const requiredMargin = posVal * marginPct
    const buyingPower = equity / marginPct
    const leverage = posVal / equity
    const loan = posVal - equity
    const marginCallThreshold = loan > 0 ? loan / (1 - maintPct) : 0
    const availableMargin = equity - requiredMargin
    const marginUtilization = (requiredMargin / equity) * 100

    return { requiredMargin, buyingPower, leverage, marginCallThreshold, availableMargin, marginUtilization }
  }, [positionValue, marginReq, accountEquity, maintenanceMargin])

  const handleReset = useCallback(() => {
    setPositionValue(""); setMarginReq("50"); setAccountEquity(""); setMaintenanceMargin("25")
  }, [])

  const utilizationColor = results
    ? results.marginUtilization > 80 ? "text-red-400" : results.marginUtilization > 60 ? "text-amber-400" : "text-emerald-400"
    : "text-slate-400"

  const utilizationBg = results
    ? results.marginUtilization > 80 ? "bg-red-500" : results.marginUtilization > 60 ? "bg-amber-500" : "bg-emerald-500"
    : "bg-slate-600"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inputs</h3>
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
        </div>
        <CalculatorField label="Position Value" value={positionValue} onChange={setPositionValue} prefix="$" placeholder="10,000" helperText="Total value of the position = Price × Quantity" />
        <CalculatorField label="Margin Requirement" value={marginReq} onChange={setMarginReq} suffix="%" placeholder="50" helperText="Your broker's initial margin rate — Reg-T stocks: 50%, Futures: varies by contract. Day trading (PDT): 25%" />
        <CalculatorField label="Account Equity" value={accountEquity} onChange={setAccountEquity} prefix="$" placeholder="50,000" helperText="Your account's net liquidation value — found on broker's account summary or portfolio page" />
        <CalculatorField label="Maintenance Margin" value={maintenanceMargin} onChange={setMaintenanceMargin} suffix="%" placeholder="25" helperText="Minimum equity % before margin call — Reg-T default: 25%, but brokers may require 30–40%" />
      </div>

      <div className="lg:col-span-3 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Results</h3>
        {results ? (
          <div className="space-y-4">
            {/* Margin Utilization Bar */}
            <div className="text-center mb-2">
              <p className={classNames("text-3xl font-bold font-mono tabular-nums", utilizationColor)}>
                {results.marginUtilization.toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Margin Utilization</p>
              <div className="mt-2 h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={classNames("h-full rounded-full transition-all duration-500", utilizationBg)}
                  style={{ width: `${Math.min(100, results.marginUtilization)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <CalculatorResultRow label="Required Margin" value={`$${results.requiredMargin.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
              <CalculatorResultRow label="Buying Power" value={`$${results.buyingPower.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} variant="profit" />
              <CalculatorResultRow label="Leverage Ratio" value={`${results.leverage.toFixed(2)} : 1`} variant={results.leverage > 4 ? "loss" : results.leverage > 2 ? "warning" : "neutral"} />
              <CalculatorResultRow
                label="Margin Call Threshold"
                value={`$${results.marginCallThreshold.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                subtext="Your position value must stay above this to avoid a margin call"
                variant="warning"
              />
              <CalculatorResultRow
                label="Available Margin"
                value={`$${results.availableMargin.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                variant={results.availableMargin < 0 ? "loss" : "profit"}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
            Fill in position value and account equity to see results
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): implement Margin calculator"
```

---

## Chunk 5: Calculators 7-9 — Fibonacci, Break-Even, ADR%

### Task 14: Implement Fibonacci Levels Calculator

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace FibonacciCalc stub)

- [ ] **Step 1: Replace FibonacciCalc stub**

```typescript
function FibonacciCalc() {
  const [swingHigh, setSwingHigh] = useState("")
  const [swingLow, setSwingLow] = useState("")
  const [trend, setTrend] = useState<"up" | "down">("up")

  const FIB_RETRACEMENTS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
  const FIB_EXTENSIONS = [1.272, 1.618, 2.0, 2.618]

  const results = useMemo(() => {
    const high = parseFloat(swingHigh)
    const low = parseFloat(swingLow)

    if (!high || !low || high <= low) return null

    const range = high - low

    const retracements = FIB_RETRACEMENTS.map((ratio) => {
      const price = trend === "up"
        ? high - range * ratio
        : low + range * ratio
      return { ratio, label: `${(ratio * 100).toFixed(1)}%`, price }
    })

    const extensions = FIB_EXTENSIONS.map((ratio) => {
      const price = trend === "up"
        ? high + range * (ratio - 1)
        : low - range * (ratio - 1)
      return { ratio, label: `${(ratio * 100).toFixed(1)}%`, price }
    })

    return { retracements, extensions, range }
  }, [swingHigh, swingLow, trend])

  const handleReset = useCallback(() => {
    setSwingHigh(""); setSwingLow(""); setTrend("up")
  }, [])

  const isGoldenZone = (ratio: number) => ratio === 0.382 || ratio === 0.618

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inputs</h3>
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
        </div>
        <CalculatorField label="Swing High" value={swingHigh} onChange={setSwingHigh} prefix="$" placeholder="235.00" helperText="The highest price of the move — on TradingView: hover over the swing high candle's wick on any timeframe" />
        <CalculatorField label="Swing Low" value={swingLow} onChange={setSwingLow} prefix="$" placeholder="210.00" helperText="The lowest price of the move — hover over the swing low candle's wick" />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trend Direction</label>
          <div className="flex rounded-lg overflow-hidden border border-slate-700" role="radiogroup">
            {(["up", "down"] as const).map((dir) => (
              <button
                key={dir}
                role="radio"
                aria-checked={trend === dir}
                onClick={() => setTrend(dir)}
                className={classNames(
                  "flex-1 py-2 text-sm font-semibold uppercase transition-colors",
                  trend === dir
                    ? dir === "up" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
                )}
              >
                {dir === "up" ? "↑ Uptrend" : "↓ Downtrend"}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">
            {trend === "up" ? "Measuring pullback from low → high" : "Measuring bounce from high → low"}
          </p>
        </div>

        {swingHigh && swingLow && parseFloat(swingHigh) <= parseFloat(swingLow) && (
          <p className="text-xs text-red-400">Swing High must be greater than Swing Low</p>
        )}
      </div>

      <div className="lg:col-span-3 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Levels</h3>
        {results ? (
          <div className="space-y-4">
            {/* Retracements */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-2">Retracement Levels</p>
              <div className="space-y-0.5">
                {results.retracements.map((level) => (
                  <div
                    key={level.label}
                    className={classNames(
                      "flex items-center justify-between py-1.5 px-2 rounded-md text-sm group",
                      isGoldenZone(level.ratio)
                        ? "bg-amber-500/10 border border-amber-500/20"
                        : "hover:bg-slate-800/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={classNames(
                        "font-mono text-xs w-12",
                        isGoldenZone(level.ratio) ? "text-amber-400 font-semibold" : "text-slate-400"
                      )}>
                        {level.label}
                      </span>
                      {isGoldenZone(level.ratio) && (
                        <span className="text-[9px] text-amber-400/80 uppercase tracking-wider">Golden Zone</span>
                      )}
                    </div>
                    <span className="font-mono text-sm text-slate-100 tabular-nums font-medium">
                      ${level.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Proportional Bar */}
            <div className="my-4 relative h-48 bg-slate-800/40 rounded-lg border border-slate-700/30 overflow-hidden">
              {results.retracements.map((level) => {
                const pct = level.ratio * 100
                return (
                  <div
                    key={level.label}
                    className="absolute left-0 right-0 flex items-center px-3"
                    style={{ top: `${pct}%`, transform: "translateY(-50%)" }}
                  >
                    <div className={classNames(
                      "h-px flex-1",
                      isGoldenZone(level.ratio) ? "bg-amber-500/60" : "bg-slate-600/40"
                    )} />
                    <span className={classNames(
                      "text-[9px] font-mono ml-2 whitespace-nowrap",
                      isGoldenZone(level.ratio) ? "text-amber-400" : "text-slate-500"
                    )}>
                      {level.label} — ${level.price.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Extensions */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-2">Extension Levels</p>
              <div className="space-y-0.5">
                {results.extensions.map((level) => (
                  <div
                    key={level.label}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md text-sm hover:bg-slate-800/30 group"
                  >
                    <span className="font-mono text-xs text-purple-400 w-12">{level.label}</span>
                    <span className="font-mono text-sm text-slate-100 tabular-nums font-medium">
                      ${level.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
            Enter swing high and low to calculate levels
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): implement Fibonacci Levels calculator"
```

---

### Task 15: Implement Break-Even Calculator

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace BreakEvenCalc stub)

- [ ] **Step 1: Replace BreakEvenCalc stub**

```typescript
function BreakEvenCalc() {
  const [winRate, setWinRate] = useState("50")
  const [avgWin, setAvgWin] = useState("")
  const [avgLoss, setAvgLoss] = useState("")
  const [numTrades, setNumTrades] = useState("100")

  const results = useMemo(() => {
    const wr = parseFloat(winRate) / 100
    const aw = parseFloat(avgWin)
    const al = parseFloat(avgLoss)
    const n = parseInt(numTrades, 10)

    if (isNaN(wr) || !aw || !al || !n) return null

    const expectancy = (wr * aw) - ((1 - wr) * al)
    const expectedPnl = expectancy * n
    const requiredWinRate = al / (aw + al)
    const requiredRR = (1 - wr) / wr
    const isProfitable = expectancy > 0

    // Simulate equity curve
    const chartData: { trade: number; equity: number }[] = [{ trade: 0, equity: 0 }]
    let equity = 0
    // Use seeded pseudo-random for consistency
    let seed = 42
    const pseudoRandom = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
    for (let i = 1; i <= Math.min(n, 200); i++) {
      const isWin = pseudoRandom() < wr
      equity += isWin ? aw : -al
      chartData.push({ trade: i, equity })
    }

    return { expectancy, expectedPnl, requiredWinRate, requiredRR, isProfitable, chartData }
  }, [winRate, avgWin, avgLoss, numTrades])

  const handleReset = useCallback(() => {
    setWinRate("50"); setAvgWin(""); setAvgLoss(""); setNumTrades("100")
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inputs</h3>
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
        </div>
        <CalculatorField label="Win Rate" value={winRate} onChange={setWinRate} suffix="%" placeholder="50" helperText="Your historical win rate — check your journal's Insights panel" />
        <CalculatorField label="Average Win" value={avgWin} onChange={setAvgWin} prefix="$" placeholder="500" helperText="Your average winning trade P&L — found in journal Analytics or compute manually from trade history" />
        <CalculatorField label="Average Loss" value={avgLoss} onChange={setAvgLoss} prefix="$" placeholder="250" helperText="Your average losing trade P&L (enter as positive number) — found in journal Analytics" />
        <CalculatorField label="Trades to Simulate" value={numTrades} onChange={setNumTrades} placeholder="100" helperText="How many trades to simulate for the equity projection" />
      </div>

      <div className="lg:col-span-3 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Results</h3>
        {results ? (
          <div className="space-y-4">
            {/* Verdict */}
            <div className={classNames(
              "flex items-center gap-3 p-3 rounded-lg border",
              results.isProfitable
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-red-500/10 border-red-500/30"
            )}>
              {results.isProfitable ? <Check size={20} className="text-emerald-400" /> : <X size={20} className="text-red-400" />}
              <div>
                <p className={classNames("text-sm font-semibold", results.isProfitable ? "text-emerald-400" : "text-red-400")}>
                  {results.isProfitable ? "Profitable System" : "Losing System"}
                </p>
                <p className="text-xs text-slate-400">
                  {results.isProfitable ? "This system has a positive edge over time" : "Adjust your R:R ratio or improve your win rate"}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <CalculatorResultRow label="Expectancy per Trade" value={`${results.expectancy >= 0 ? "+" : ""}$${results.expectancy.toFixed(2)}`} variant={results.expectancy >= 0 ? "profit" : "loss"} large />
              <CalculatorResultRow label={`Expected P&L (${numTrades} trades)`} value={`${results.expectedPnl >= 0 ? "+" : ""}$${results.expectedPnl.toFixed(2)}`} variant={results.expectedPnl >= 0 ? "profit" : "loss"} />
              <CalculatorResultRow label="Required Win Rate" value={`${(results.requiredWinRate * 100).toFixed(1)}%`} subtext="Win rate needed to break even at current R:R" />
              <CalculatorResultRow label="Required R:R" value={`${results.requiredRR.toFixed(2)} : 1`} subtext="R:R needed to break even at current win rate" />
            </div>

            {/* Simulated Equity Chart */}
            <div className="h-40 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="beGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={results.isProfitable ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={results.isProfitable ? "#10b981" : "#ef4444"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="trade" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Equity"]}
                    labelFormatter={(label: number) => `Trade #${label}`}
                  />
                  <Area type="monotone" dataKey="equity" stroke={results.isProfitable ? "#10b981" : "#ef4444"} fill="url(#beGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
            Fill in win rate, average win, and average loss to analyze
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): implement Break-Even Analysis calculator with equity simulation"
```

---

### Task 16: Implement ADR% Calculator

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (replace AdrCalc stub)

- [ ] **Step 1: Replace AdrCalc stub**

```typescript
function AdrCalc() {
  const [symbol, setSymbol] = useState("")
  const [lookback, setLookback] = useState("5")
  const [rows, setRows] = useState<{ high: string; low: string; close: string }[]>(
    Array.from({ length: 5 }, () => ({ high: "", low: "", close: "" }))
  )
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState("")

  const updateRow = useCallback((index: number, field: "high" | "low" | "close", value: string) => {
    setRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }, [])

  // Sync row count with lookback
  useEffect(() => {
    const n = parseInt(lookback, 10) || 5
    setRows((prev) => {
      if (prev.length === n) return prev
      if (prev.length < n) return [...prev, ...Array.from({ length: n - prev.length }, () => ({ high: "", low: "", close: "" }))]
      return prev.slice(0, n)
    })
  }, [lookback])

  const handlePaste = useCallback(() => {
    const lines = pasteText.trim().split("\n")
    const parsed = lines.map((line) => {
      const parts = line.split(/[,\t]+/).map((s) => s.trim())
      return { high: parts[0] || "", low: parts[1] || "", close: parts[2] || "" }
    })
    setRows(parsed)
    setLookback(String(parsed.length))
    setPasteMode(false)
    setPasteText("")
  }, [pasteText])

  const results = useMemo(() => {
    const validRows = rows.filter((r) => {
      const h = parseFloat(r.high)
      const l = parseFloat(r.low)
      return h > 0 && l > 0 && h >= l
    })

    if (validRows.length === 0) return null

    const completeRows = validRows.filter((r) => {
      const c = parseFloat(r.close)
      return c > 0
    })

    const perDay = validRows.map((r, i) => {
      const h = parseFloat(r.high)
      const l = parseFloat(r.low)
      const c = parseFloat(r.close)
      const rangeDollar = h - l
      const rangePct = c > 0 ? (rangeDollar / c) * 100 : null
      return { day: i + 1, high: h, low: l, close: c, rangeDollar, rangePct }
    })

    const adrDollar = perDay.reduce((s, d) => s + d.rangeDollar, 0) / perDay.length
    const pctRows = perDay.filter((d) => d.rangePct !== null)
    const adrPct = pctRows.length > 0 ? pctRows.reduce((s, d) => s + (d.rangePct || 0), 0) / pctRows.length : null

    return { perDay, adrDollar, adrPct, validCount: validRows.length, completeCount: completeRows.length }
  }, [rows])

  const handleReset = useCallback(() => {
    setSymbol("")
    setLookback("5")
    setRows(Array.from({ length: 5 }, () => ({ high: "", low: "", close: "" })))
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Inputs</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setPasteMode(!pasteMode)} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              {pasteMode ? "Cancel" : "Paste Data"}
            </button>
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset</button>
          </div>
        </div>

        <CalculatorField label="Symbol" value={symbol} onChange={setSymbol} type="text" placeholder="AAPL" helperText="The ticker you're analyzing — for reference only, all prices entered manually" />
        <CalculatorField label="Lookback Period" value={lookback} onChange={setLookback} placeholder="5" helperText="Number of trading days to average — 5 (1 week), 10 (2 weeks), or 20 (1 month) are standard" />

        {pasteMode ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Paste High, Low, Close (one row per line, tab or comma separated)</label>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"235.50, 228.00, 232.40\n234.00, 229.50, 231.80\n233.20, 227.80, 230.10"}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono h-32 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            <Button size="sm" onClick={handlePaste}>Apply</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Daily Data</label>
              <button
                className="text-slate-500 hover:text-emerald-400 transition-colors"
                onClick={() => {}}
                aria-label="Info about Daily Data"
              >
                <Info size={13} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mb-2">Find on TradingView: switch to 1D timeframe, hover over each candle. Most recent day first.</p>

            {/* Header */}
            <div className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-1 text-[10px] text-slate-500 uppercase tracking-wider font-medium px-1">
              <span>#</span><span>High</span><span>Low</span><span>Close</span>
            </div>

            {/* Data rows */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-1 items-center">
                  <span className="text-[10px] text-slate-600 text-center">{i + 1}</span>
                  <input
                    type="number"
                    value={row.high}
                    onChange={(e) => updateRow(i, "high", e.target.value)}
                    placeholder="H"
                    className="bg-slate-900/80 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/40 w-full"
                  />
                  <input
                    type="number"
                    value={row.low}
                    onChange={(e) => updateRow(i, "low", e.target.value)}
                    placeholder="L"
                    className="bg-slate-900/80 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/40 w-full"
                  />
                  <input
                    type="number"
                    value={row.close}
                    onChange={(e) => updateRow(i, "close", e.target.value)}
                    placeholder="C"
                    className="bg-slate-900/80 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/40 w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-3 bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Results {symbol && <span className="text-emerald-400 normal-case">— {symbol.toUpperCase()}</span>}
        </h3>
        {results ? (
          <div className="space-y-4">
            {/* Primary metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                {results.adrPct !== null ? (
                  <p className="text-2xl font-bold font-mono tabular-nums text-emerald-400">{results.adrPct.toFixed(2)}%</p>
                ) : (
                  <p className="text-2xl font-bold font-mono tabular-nums text-slate-500">—</p>
                )}
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">ADR%</p>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-100">${results.adrDollar.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">ADR$</p>
              </div>
            </div>

            {/* Today's range usage (if first row has data) */}
            {results.perDay.length > 0 && results.perDay[0].rangeDollar > 0 && (
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Today&apos;s Range Used</span>
                  <span className={classNames(
                    "font-mono font-semibold",
                    (results.perDay[0].rangeDollar / results.adrDollar) * 100 > 100 ? "text-red-400" :
                    (results.perDay[0].rangeDollar / results.adrDollar) * 100 > 80 ? "text-amber-400" : "text-emerald-400"
                  )}>
                    {((results.perDay[0].rangeDollar / results.adrDollar) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={classNames(
                      "h-full rounded-full transition-all",
                      (results.perDay[0].rangeDollar / results.adrDollar) * 100 > 100 ? "bg-red-500" :
                      (results.perDay[0].rangeDollar / results.adrDollar) * 100 > 80 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min(100, (results.perDay[0].rangeDollar / results.adrDollar) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Today: ${results.perDay[0].rangeDollar.toFixed(2)} of ${results.adrDollar.toFixed(2)} avg range
                </p>
              </div>
            )}

            {/* Suggested levels */}
            <div className="space-y-1">
              <CalculatorResultRow label="Suggested Stop (0.5× ADR)" value={`$${(results.adrDollar * 0.5).toFixed(2)}`} subtext="Common rule: don't set stops tighter than half the ADR" variant="warning" />
              <CalculatorResultRow label="Suggested Target (1× ADR)" value={`$${results.adrDollar.toFixed(2)}`} subtext="Full ADR as a realistic daily target" variant="profit" />
            </div>

            {/* Per-day table */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-2">Daily Breakdown</p>
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider grid grid-cols-6 gap-1 px-2 py-1 border-b border-slate-700/50">
                <span>Day</span><span>High</span><span>Low</span><span>Close</span><span>Range $</span><span>Range %</span>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {results.perDay.map((d) => (
                  <div
                    key={d.day}
                    className={classNames(
                      "grid grid-cols-6 gap-1 px-2 py-1 text-xs font-mono text-slate-300 border-b border-slate-800/30",
                      d.rangePct === null && "opacity-50"
                    )}
                  >
                    <span className="text-slate-500">{d.day}</span>
                    <span>${d.high.toFixed(2)}</span>
                    <span>${d.low.toFixed(2)}</span>
                    <span>{d.close > 0 ? `$${d.close.toFixed(2)}` : <span className="text-amber-400 text-[10px]">missing</span>}</span>
                    <span>${d.rangeDollar.toFixed(2)}</span>
                    <span>{d.rangePct !== null ? `${d.rangePct.toFixed(2)}%` : "—"}</span>
                  </div>
                ))}
              </div>
              {/* Average row */}
              <div className="grid grid-cols-6 gap-1 px-2 py-1.5 text-xs font-mono font-semibold text-emerald-400 border-t border-slate-700/50 bg-slate-800/20">
                <span>AVG</span><span></span><span></span><span></span>
                <span>${results.adrDollar.toFixed(2)}</span>
                <span>{results.adrPct !== null ? `${results.adrPct.toFixed(2)}%` : "—"}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-slate-600 text-sm">
            Enter at least one day of High/Low data to calculate ADR
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): implement ADR% calculator with paste-data support"
```

---

## Chunk 6: Final Verification & Deploy

### Task 17: Full build verification and cleanup

**Files:**
- Modify: `src/app/trading-journal-dashboard.tsx` (only if needed to fix build errors)

- [ ] **Step 1: Run full build**

Run: `cd /c/Users/bikra/trading-journal && npx next build 2>&1 | tail -40`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Check for any unused stub functions remaining**

Search for "implementing..." in the file. All 9 stubs should be replaced.

Run: `grep -n "implementing\.\.\." src/app/trading-journal-dashboard.tsx`
Expected: No results.

- [ ] **Step 3: Run dev server and visually verify**

Run: `cd /c/Users/bikra/trading-journal && npx next dev`
Open http://localhost:3000, click Calculators in sidebar, verify:
- All 9 cards render in the grid
- Clicking a card opens a tab
- Each calculator computes results correctly
- Max 3 tabs enforced
- Tab close works
- Reset buttons work

- [ ] **Step 4: Final commit if any cleanup was needed**

```bash
git add src/app/trading-journal-dashboard.tsx
git commit -m "feat(calculators): final cleanup and build verification"
```

---

### Task 18: Deploy to Vercel

- [ ] **Step 1: Push to remote**

Run: `cd /c/Users/bikra/trading-journal && git push origin master`

- [ ] **Step 2: Verify deployment**

Run: `cd /c/Users/bikra/trading-journal && npx vercel --prod`
Or if auto-deploy is configured, check: https://trading-journal-rho-three.vercel.app

- [ ] **Step 3: Verify live site**

Open the live URL and confirm all 9 calculators work in production.
