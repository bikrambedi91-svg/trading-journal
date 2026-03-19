# Trading Calculators Feature — Design Spec

**Date:** 2026-03-19
**Status:** Approved
**Scope:** Add 9 trading calculators as a dedicated page in the trading journal dashboard

---

## Overview

Add a "Calculators" page accessible via sidebar navigation. The page uses a card-grid launcher at the top (9 calculator cards) and a tabbed workspace below where up to 3 calculators can be open simultaneously. All calculators are manual-entry with contextual helper text (ⓘ tooltips) explaining where to find each data point in real trading tools.

## Navigation Integration

- Add `{ key: "calculators", label: "Calculators", icon: Calculator }` to `NAV_ITEMS` array (between Analytics and Calendar)
- Add `activeView === "calculators"` branch to the main content switch in `TradingDashboard`
- No new routes — same single-page architecture with view switching

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│  "TRADING CALCULATORS" header + subtitle             │
│  "Professional tools to size, analyze, and plan"     │
├─────────────────────────────────────────────────────┤
│  3×3 card grid (5-col on 2xl, 3 on lg, 2 on md)    │
│  Each card: icon + name + one-line description       │
│  Click → opens in workspace below                    │
├─────────────────────────────────────────────────────┤
│  [Tab: Calc A] [Tab: Calc B] [Tab: ×close]          │
│  ┌─────────────────────────────────────────────────┐│
│  │  Two-panel layout:                               ││
│  │  LEFT (40%): Input fields with ⓘ helpers         ││
│  │  RIGHT (60%): Computed results + visualizations  ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

- Max 3 tabs open simultaneously
- Each tab has a close (×) button
- Cards in grid show a subtle "OPEN" badge when that calculator has an active tab
- Responsive: On mobile, input and results stack vertically

## Shared UX Patterns

- **Instant calculation:** Results update live on every keystroke (no submit button)
- **ⓘ info icons:** Tooltip on hover (desktop) / tap-to-expand (mobile) with helper text explaining where to find the data
- **Sensible defaults:** Pre-filled where a common standard exists
- **Copy result:** Small copy icon next to each computed output
- **Reset button:** Clears all fields to defaults
- **Color-coded results:** Emerald = favorable, Rose = unfavorable, Amber = caution
- **Input validation:** Prevent negative prices, stop loss on wrong side, etc. Inline error messages in rose-400
- **Glassmorphism styling:** Matches existing dashboard cards (bg-slate-900/80 backdrop-blur-xl border border-slate-700/50)

## Calculator Specifications

### 1. Position Size Calculator

**Purpose:** Determine how many shares/contracts to buy given risk tolerance.

**Inputs:**

| Field | Type | Default | Helper Text |
|-------|------|---------|-------------|
| Account Size | $ input | — | "Your total trading account balance — check your broker's account summary page" |
| Risk % | slider + number input | 1% | "% of account you're willing to lose on this trade. Most pros risk 0.5-2% per trade" |
| Entry Price | $ input | — | "The price you plan to enter at — use your broker's Level 2 or TradingView last price" |
| Stop Loss Price | $ input | — | "Your invalidation level — the price where your thesis is wrong" |

**Outputs:**
- Risk Amount = Account Size × Risk %
- Position Size (shares) = Risk Amount / |Entry − Stop Loss|
- Total Position Value = Position Size × Entry Price
- % of Account = Position Value / Account Size × 100

**Validation:**
- Direction is inferred: Stop < Entry → Long, Stop > Entry → Short
- Display inferred direction prominently (e.g., "↑ LONG" in emerald or "↓ SHORT" in rose) so user can catch transposed inputs
- Stop Loss cannot equal Entry Price
- All fields required, must be positive numbers

---

### 2. Risk/Reward Calculator

**Purpose:** Evaluate whether a trade setup has positive expected value.

**Inputs:**

| Field | Type | Default | Helper Text |
|-------|------|---------|-------------|
| Entry Price | $ input | — | "Your planned entry price" |
| Stop Loss | $ input | — | "Price where you'll exit if wrong" |
| Take Profit | $ input | — | "Your target exit price — use key levels, supply/demand zones, or prior highs/lows on chart" |
| Win Rate | % input | 50% | "Your historical win rate — find this on your journal's Insights panel under 'Win Rate'" |

**Outputs:**
- Risk (pts) = |Entry − Stop Loss|
- Reward (pts) = |Take Profit − Entry|
- R:R Ratio displayed as "2.5 : 1"
- Breakeven Win Rate = 1 / (1 + R:R) × 100
- Expected Value = (Win Rate × Reward) − ((1 − Win Rate) × Risk)
- Visual R:R bar showing risk vs reward proportionally (rose segment vs emerald segment)

**Validation:**
- Take profit must be on correct side of entry relative to stop loss direction

---

### 3. Profit/Loss Calculator

**Purpose:** Calculate exact P&L including all fees.

**Inputs:**

| Field | Type | Default | Helper Text |
|-------|------|---------|-------------|
| Direction | Long/Short toggle | Long | — |
| Entry Price | $ input | — | "Price you bought/shorted at" |
| Exit Price | $ input | — | "Price you sold/covered at" |
| Quantity | number input | 1 | "Number of shares, contracts, or units" |
| Commission (per trade) | $ input | $0.00 | "Check your broker's fee schedule — e.g., IBKR: $0.005/share, Webull/Robinhood: $0" |
| Other Fees | $ input | $0.00 | "SEC fees, exchange fees, ECN fees — usually shown on your trade confirmation" |

**Outputs:**
- Gross P&L = (Exit − Entry) × Qty × direction multiplier (1 for long, -1 for short)
- Total Fees = (Commission × 2) + Other Fees (round-trip)
- Net P&L = Gross P&L − Total Fees
- Return % = Net P&L / (Entry × Qty) × 100
- Breakeven Price = Entry ± (Total Fees / Qty) (+ for long, − for short)

---

### 4. Options Pricing Calculator (Black-Scholes)

**Purpose:** Calculate theoretical option fair value and Greeks.

**Inputs:**

| Field | Type | Default | Helper Text |
|-------|------|---------|-------------|
| Option Type | Call/Put toggle | Call | — |
| Underlying Price | $ input | — | "Current stock price — search the ticker on TradingView or your broker" |
| Strike Price | $ input | — | "The option's strike — found in your broker's options chain" |
| Days to Expiry | number input | 30 | "Calendar days until expiration — shown on the options chain header" |
| Implied Volatility | % input | 30% | "IV is listed per strike in your options chain — Thinkorswim: 'Impl Vol' column, TastyTrade: shown on the trade page" |
| Risk-Free Rate | % input | 4.3% | "US 10-Year Treasury yield — search 'US10Y' on TradingView or google 'treasury yield today'" |

**Formulas (Black-Scholes):**
```
T = DTE / 365
d1 = (ln(S/K) + (r + σ²/2) × T) / (σ × √T)
d2 = d1 − σ × √T

Call = S × N(d1) − K × e^(−rT) × N(d2)
Put  = K × e^(−rT) × N(−d2) − S × N(−d1)

Delta (call) = N(d1),  Delta (put) = N(d1) − 1
Gamma = φ(d1) / (S × σ × √T)
Theta_annual (call) = −(S × φ(d1) × σ) / (2√T) − r × K × e^(−rT) × N(d2)
Theta_per_day (call) = Theta_annual / 365

Theta_annual (put)  = −(S × φ(d1) × σ) / (2√T) + r × K × e^(−rT) × N(−d2)
Theta_per_day (put)  = Theta_annual / 365

Note: The formulas above produce ANNUAL theta. Always divide by 365 for per-day display.
Vega = S × φ(d1) × √T / 100  (per 1% IV change)
Rho (call) = K × T × e^(−rT) × N(d2) / 100
Rho (put)  = −K × T × e^(−rT) × N(−d2) / 100
```

Where N() = standard normal CDF, φ() = standard normal PDF.

**Outputs:**
- Theoretical Price
- Delta, Gamma, Theta (per day), Vega, Rho — each with a brief label
- Intrinsic Value = max(0, S−K) for calls, max(0, K−S) for puts
- Extrinsic Value = Theoretical Price − Intrinsic Value
- Visual breakdown bar: intrinsic vs extrinsic

**Implementation note:** Implement N() (normal CDF) using the rational approximation algorithm — no external math libraries needed.

---

### 5. Compound Growth Calculator

**Purpose:** Project account growth with compounding over time.

**Inputs:**

| Field | Type | Default | Helper Text |
|-------|------|---------|-------------|
| Starting Capital | $ input | — | "Your current account balance" |
| Return per Period | % input | — | "Your average return per period — check your journal's monthly performance chart for a realistic number" |
| Period Type | select | Weekly | Options: Daily, Weekly, Monthly, Yearly |
| Number of Periods | number input | 52 | "How many periods to project — e.g., 52 weeks = 1 year, 12 months = 1 year" |
| Additional Contribution | $ input | $0 | "Extra capital added each period — e.g., monthly deposit from salary" |

**Formulas:**
```
For each period i (1 to N):
  balance[i] = balance[i-1] × (1 + rate) + contribution

Total Return = Final Balance − Starting Capital − Total Contributions
```

**Outputs:**
- Final Balance
- Total Return $ and Total Return %
- Total Contributions vs Total Growth from compounding
- Recharts Area Chart showing equity growth curve (emerald gradient, matching existing style)

---

### 6. Margin Calculator

**Purpose:** Determine margin requirements, buying power, and margin call levels.

**Inputs:**

| Field | Type | Default | Helper Text |
|-------|------|---------|-------------|
| Position Value | $ input | — | "Total value of the position = Price × Quantity" |
| Margin Requirement | % input | 50% | "Your broker's initial margin rate — Reg-T stocks: 50%, Futures: varies by contract. Day trading (PDT): 25%" |
| Account Equity | $ input | — | "Your account's net liquidation value — found on broker's account summary or portfolio page" |
| Maintenance Margin | % input | 25% | "Minimum equity % before margin call — Reg-T default: 25%, but brokers may require 30-40%" |

**Outputs:**
- Required Margin = Position Value × Margin Requirement %
- Buying Power = Account Equity / Margin Requirement %
- Leverage Ratio = Position Value / Account Equity → displayed as "2:1"
- Margin Call Threshold (as total position value) = Loan / (1 − Maintenance Margin %), where Loan = Position Value − Account Equity. Display as "Your position value must stay above $X to avoid a margin call"
- Available Margin = Account Equity − Required Margin
- Radial bar visual showing margin utilization % (emerald <60%, amber 60-80%, rose >80%)

---

### 7. Fibonacci Levels Calculator

**Purpose:** Calculate key retracement and extension levels for a price swing.

**Inputs:**

| Field | Type | Default | Helper Text |
|-------|------|---------|-------------|
| Swing High | $ input | — | "The highest price of the move — on TradingView: hover over the swing high candle's wick on any timeframe" |
| Swing Low | $ input | — | "The lowest price of the move — hover over the swing low candle's wick" |
| Trend Direction | Uptrend/Downtrend toggle | Uptrend | "Uptrend: measuring a pullback from low→high. Downtrend: measuring a bounce from high→low" |

**Formulas:**
```
Range = Swing High − Swing Low

Uptrend retracement from high:
  Level = Swing High − (Range × fib_ratio)

Downtrend retracement from low:
  Level = Swing Low + (Range × fib_ratio)

Extensions (uptrend): Swing High + (Range × ext_ratio)
Extensions (downtrend): Swing Low − (Range × ext_ratio)
```

**Retracement levels:** 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%
**Extension levels:** 127.2%, 161.8%, 200%, 261.8%

**Outputs:**
- Table: Level name | Ratio % | Price — for all retracement + extension levels
- 38.2% and 61.8% rows highlighted amber as "Golden Zone"
- Vertical bar visualization showing proportional placement of each level between high and low

**Validation:**
- Swing High must be greater than Swing Low

---

### 8. Break-Even Calculator

**Purpose:** Determine if a trading system is profitable long-term given win rate and R:R stats.

**Inputs:**

| Field | Type | Default | Helper Text |
|-------|------|---------|-------------|
| Win Rate | % slider + number input | 50% | "Your historical win rate — check your journal's Insights panel" |
| Average Win | $ input | — | "Your average winning trade P&L — found in journal Analytics or compute manually from trade history" |
| Average Loss | $ input | — | "Your average losing trade P&L (enter as positive number) — found in journal Analytics" |
| Number of Trades | number input | 100 | "How many trades to simulate for the equity projection" |

**Formulas:**
```
Expectancy = (Win Rate × Avg Win) − (Loss Rate × Avg Loss)
Expected P&L = Expectancy × N
Required Win Rate (at current R:R) = 1 / (1 + (Avg Win / Avg Loss))
Required R:R (at current win rate) = (1 − Win Rate) / Win Rate
```

**Outputs:**
- Expectancy per Trade ($ amount, color-coded)
- Expected P&L over N trades
- Required Win Rate at current R:R to break even
- Required R:R at current Win Rate to break even
- System Verdict: "Profitable System" (emerald + check icon) or "Losing System — adjust R:R or win rate" (rose + X icon)
- Simulated equity curve: Recharts line chart showing randomized but expectancy-driven equity path over N trades

---

### 9. ADR% Calculator (Average Daily Range)

**Purpose:** Calculate typical daily price volatility for setting realistic targets and stops.

**Reference:** Based on TradingView indicator by MikeC/TheScrutiniser — corrected ADR% formula.

**Inputs:**

| Field | Type | Default | Helper Text |
|-------|------|---------|-------------|
| Symbol | text input | — | "The ticker you're analyzing — for reference only (label), all prices entered manually" |
| Lookback Period | number input | 5 | "Number of trading days to average — 5 (1 week), 10 (2 weeks), or 20 (1 month) are standard" |
| Daily Data | editable table: rows of High, Low, Close | — | "Enter each day's High, Low, and Close — find on TradingView: switch to 1D timeframe, hover over each candle. Most recent day first." |

**Quick-fill feature:** "Paste Data" button that accepts tab/comma-separated values (High, Low, Close per line) for bulk entry from a spreadsheet.

**Formulas:**
```
Per day: Daily Range % = (High − Low) / Close × 100
         Daily Range $ = High − Low

ADR% = Average of Daily Range % over lookback period
ADR$ = Average of Daily Range $ over lookback period
```

**Outputs:**
- ADR% (the primary metric, large display)
- ADR$ (absolute dollar range)
- Per-day table: Date label | High | Low | Close | Range $ | Range %
- Average row at bottom (highlighted)
- Suggested Stop Loss = ADR × 0.5 — "Common rule: don't set stops tighter than half the ADR"
- Suggested Target = ADR × 1.0
- If today's data entered: "Today has used X% of average range" with progress bar

**Validation:**
- High must be ≥ Low for each row
- Close must be between Low and High (warn but don't block — after-hours can cause this)
- At least 1 complete row of data required (all three: High, Low, Close)
- Incomplete rows (e.g., only High and Low, no Close): use for ADR$ calculation, skip from ADR% calculation. Show muted row styling with "missing Close" indicator

---

## Component Architecture

All calculator code lives in the existing single-file `trading-journal-dashboard.tsx`.

**New components (functions within the file):**
- `CalculatorsPage` — page container with card grid + tabbed workspace
- `CalculatorCard` — individual card in the launcher grid
- `CalculatorWorkspace` — tabbed workspace manager (max 3 tabs)
- `CalculatorField` — reusable input wrapper with ⓘ tooltip, label, validation
- `PositionSizeCalc`, `RiskRewardCalc`, `PnlCalc`, `OptionsCalc`, `CompoundGrowthCalc`, `MarginCalc`, `FibonacciCalc`, `BreakEvenCalc`, `AdrCalc` — one component per calculator

**Shared utilities:**
- `normalCDF(x)` — for Black-Scholes
- `normalPDF(x)` — for Black-Scholes Greeks
- `formatCurrency(n)` — already exists in the file
- `formatPercent(n)` — already exists in the file

**State:** Each calculator manages its own local `useState` for inputs. No global state needed — calculators are independent of the trade journal data.

## Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| ≥1536px (2xl) | 5-column card grid, workspace: 40/60 split |
| ≥1280px (xl) | 4-column card grid, workspace: 40/60 split |
| ≥1024px (lg) | 3-column card grid, workspace: 40/60 split |
| ≥768px (md) | 2-column card grid, workspace: stacked (inputs on top, results below) |
| <768px (sm) | 1-column card grid, workspace: stacked, tabs scroll horizontally |

## Animations

- Card hover: translateY(-2px) + shadow deepen (200ms ease)
- Tab open: slide-in from right (300ms)
- Tab close: fade out (200ms)
- Result values: Count-up animation on first calculation (400ms)
- Input → output: Results panel fades/transitions on value changes (150ms)

## Accessibility

- All ⓘ tooltips accessible via keyboard (Tab to focus, Enter/Space to toggle)
- Calculator inputs properly labeled with `<label>` + `htmlFor`
- Results announced to screen readers via `aria-live="polite"` region
- Toggle buttons (Long/Short, Call/Put) use `role="radiogroup"` + `role="radio"` + `aria-checked`
- Tab bar uses `role="tablist"` / `role="tab"` / `role="tabpanel"` with proper aria attributes
