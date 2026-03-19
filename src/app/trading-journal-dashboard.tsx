"use client"

import React, {
  useState,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  Plus,
  Trash2,
  Edit3,
  Star,
  StarOff,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Clock,
  Filter,
  Search,
  Download,
  Upload,
  Settings,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Copy,
  Heart,
  Target,
  Zap,
  Shield,
  Award,
  BookOpen,
  Hash,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  RefreshCw,
  SlidersHorizontal,
  LayoutDashboard,
  ListOrdered,
  CandlestickChart,
  Wallet,
  Percent,
  Scale,
  Brain,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Menu,
  LogOut,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Crosshair,
  User,
  Bell,
  ExternalLink,
  Calculator,
  Ruler,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Google Fonts
// ---------------------------------------------------------------------------
function GoogleFontsLink() {
  return (
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  )
}

// ---------------------------------------------------------------------------
// TypeScript Types & Interfaces
// ---------------------------------------------------------------------------

interface TradeRecord {
  id: string
  symbol: string
  direction: "long" | "short"
  entryDate: string
  entryTime: string
  entryPrice: number
  exitPrice: number
  quantity: number
  stopLoss?: number
  takeProfit?: number
  fees: number
  strategies: string[]
  setupQuality: number
  emotion: string
  notes: string
  tags: string[]
  isFavorite: boolean
  status: "open" | "closed"
  pnl: number
  pnlPercent: number
  riskReward: number
}

interface TradeFormData {
  symbol: string
  direction: "long" | "short"
  entryDate: string
  entryTime: string
  entryPrice: string
  exitPrice: string
  quantity: string
  stopLoss: string
  takeProfit: string
  fees: string
  strategies: string[]
  setupQuality: number
  emotion: string
  notes: string
  tags: string[]
  status: "open" | "closed"
}

interface FilterState {
  search: string
  direction: "all" | "long" | "short"
  status: "all" | "open" | "closed"
  dateFrom: string
  dateTo: string
  symbols: string[]
  strategies: string[]
  minPnl: string
  maxPnl: string
  tags: string[]
  favorites: boolean
  emotions: string[]
}

interface DashboardStats {
  totalTrades: number
  winRate: number
  totalPnl: number
  averagePnl: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  largestWin: number
  largestLoss: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  averageRiskReward: number
  sharpeRatio: number
  maxDrawdown: number
  expectancy: number
  bestDay: string
  worstDay: string
}

interface ToastMessage {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
}

type SortField =
  | "entryDate"
  | "symbol"
  | "pnl"
  | "pnlPercent"
  | "direction"
  | "quantity"
  | "fees"
  | "setupQuality"
  | "riskReward"

type SortDirection = "asc" | "desc"

interface SortConfig {
  field: SortField
  direction: SortDirection
}

type ViewMode = "dashboard" | "table" | "calendar" | "analytics"

type TradeAction =
  | { type: "ADD_TRADE"; payload: TradeRecord }
  | { type: "UPDATE_TRADE"; payload: TradeRecord }
  | { type: "DELETE_TRADE"; payload: string }
  | { type: "TOGGLE_FAVORITE"; payload: string }

interface TradeState {
  trades: TradeRecord[]
}

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMOTIONS = [
  { value: "confident", label: "Confident", icon: "😎" },
  { value: "calm", label: "Calm", icon: "🧘" },
  { value: "anxious", label: "Anxious", icon: "😰" },
  { value: "fearful", label: "Fearful", icon: "😨" },
  { value: "greedy", label: "Greedy", icon: "🤑" },
  { value: "frustrated", label: "Frustrated", icon: "😤" },
  { value: "euphoric", label: "Euphoric", icon: "🤩" },
  { value: "neutral", label: "Neutral", icon: "😐" },
  { value: "disciplined", label: "Disciplined", icon: "🎯" },
  { value: "impulsive", label: "Impulsive", icon: "⚡" },
  { value: "hesitant", label: "Hesitant", icon: "🤔" },
  { value: "focused", label: "Focused", icon: "🔥" },
] as const

const STRATEGIES = [
  "Breakout",
  "Mean Reversion",
  "Momentum",
  "Scalping",
  "Swing Trade",
  "Trend Following",
  "VWAP Bounce",
  "Gap Fill",
  "Order Block",
  "Supply/Demand",
  "Fibonacci Retracement",
  "Double Bottom",
  "Head & Shoulders",
  "Flag/Pennant",
  "HODL",
] as const

const TAGS = [
  "A+ Setup",
  "Revenge Trade",
  "News Catalyst",
  "Earnings Play",
  "Pre-Market",
  "After Hours",
  "High Volume",
  "Low Float",
  "Crypto",
  "Index",
  "Large Cap",
  "Options",
  "Futures",
  "FOMO",
  "Planned Entry",
  "Oversize",
] as const

const CHART_COLORS = {
  emerald: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
  orange: "#f97316",
  lime: "#84cc16",
  indigo: "#6366f1",
  teal: "#14b8a6",
  rose: "#f43f5e",
} as const

const PIE_COLORS = [
  CHART_COLORS.emerald,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.amber,
  CHART_COLORS.pink,
  CHART_COLORS.cyan,
  CHART_COLORS.orange,
  CHART_COLORS.lime,
]

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

function generateId(): string {
  return `trade_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? "-" : value > 0 ? "+" : ""
  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`
  }
  if (absValue >= 1_000) {
    return `${sign}$${absValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${sign}$${absValue.toFixed(2)}`
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":")
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? "PM" : "AM"
  const displayHour = h % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

function computePnl(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  direction: "long" | "short",
  fees: number
): number {
  const raw = (exitPrice - entryPrice) * quantity * (direction === "long" ? 1 : -1)
  return raw - fees
}

function computePnlPercent(
  entryPrice: number,
  exitPrice: number,
  direction: "long" | "short"
): number {
  if (entryPrice === 0) return 0
  const change = ((exitPrice - entryPrice) / entryPrice) * 100
  return direction === "long" ? change : -change
}

function computeRiskReward(
  entryPrice: number,
  exitPrice: number,
  stopLoss: number | undefined,
  direction: "long" | "short"
): number {
  if (!stopLoss || stopLoss === entryPrice) return 0
  const risk = Math.abs(entryPrice - stopLoss)
  const reward = direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice
  if (risk === 0) return 0
  return reward / risk
}

function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA)
  const b = new Date(dateB)
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function getWinRate(trades: TradeRecord[]): number {
  const closed = trades.filter((t) => t.status === "closed")
  if (closed.length === 0) return 0
  const wins = closed.filter((t) => t.pnl > 0).length
  return (wins / closed.length) * 100
}

function getProfitFactor(trades: TradeRecord[]): number {
  const closed = trades.filter((t) => t.status === "closed")
  const grossProfit = closed.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0)
  const grossLoss = Math.abs(
    closed.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0)
  )
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
  return grossProfit / grossLoss
}

function getExpectancy(trades: TradeRecord[]): number {
  const closed = trades.filter((t) => t.status === "closed")
  if (closed.length === 0) return 0
  const winRate = getWinRate(closed) / 100
  const wins = closed.filter((t) => t.pnl > 0)
  const losses = closed.filter((t) => t.pnl < 0)
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0
  const avgLoss =
    losses.length > 0
      ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length)
      : 0
  return winRate * avgWin - (1 - winRate) * avgLoss
}

function getMaxDrawdown(trades: TradeRecord[]): number {
  const sorted = [...trades]
    .filter((t) => t.status === "closed")
    .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
  let peak = 0
  let cumulative = 0
  let maxDd = 0
  for (const t of sorted) {
    cumulative += t.pnl
    if (cumulative > peak) peak = cumulative
    const dd = peak - cumulative
    if (dd > maxDd) maxDd = dd
  }
  return maxDd
}

// ---------------------------------------------------------------------------
// Math Utilities (Black-Scholes)
// ---------------------------------------------------------------------------

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

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

// ---------------------------------------------------------------------------
// Mock Data - 10 realistic trades, prices circa March 2026
// ---------------------------------------------------------------------------

const INITIAL_TRADES: TradeRecord[] = [
  {
    id: "trade_001",
    symbol: "NVDA",
    direction: "long",
    entryDate: "2026-03-04",
    entryTime: "09:42",
    entryPrice: 938.50,
    exitPrice: 967.25,
    quantity: 80,
    stopLoss: 925.00,
    takeProfit: 975.00,
    fees: 12.80,
    strategies: ["Breakout", "Momentum"],
    setupQuality: 5,
    emotion: "Confident",
    notes: "Clean breakout above 940 consolidation zone with heavy volume. Held through minor pullback at 950. Exited near TP.",
    tags: ["A+ Setup", "Large Cap", "High Volume"],
    isFavorite: true,
    status: "closed",
    pnl: computePnl(938.50, 967.25, 80, "long", 12.80),
    pnlPercent: computePnlPercent(938.50, 967.25, "long"),
    riskReward: computeRiskReward(938.50, 967.25, 925.00, "long"),
  },
  {
    id: "trade_002",
    symbol: "BTC",
    direction: "long",
    entryDate: "2026-03-05",
    entryTime: "14:15",
    entryPrice: 85200.00,
    exitPrice: 87450.00,
    quantity: 0.5,
    stopLoss: 83500.00,
    takeProfit: 89000.00,
    fees: 42.50,
    strategies: ["Trend Following", "Supply/Demand"],
    setupQuality: 4,
    emotion: "Calm",
    notes: "BTC bounced off the 85k demand zone. Took half size. Scaled out at 87.4k as momentum stalled near resistance.",
    tags: ["Crypto", "Planned Entry"],
    isFavorite: false,
    status: "closed",
    pnl: computePnl(85200.00, 87450.00, 0.5, "long", 42.50),
    pnlPercent: computePnlPercent(85200.00, 87450.00, "long"),
    riskReward: computeRiskReward(85200.00, 87450.00, 83500.00, "long"),
  },
  {
    id: "trade_003",
    symbol: "AAPL",
    direction: "short",
    entryDate: "2026-03-06",
    entryTime: "10:05",
    entryPrice: 222.40,
    exitPrice: 225.80,
    quantity: 200,
    stopLoss: 224.50,
    takeProfit: 218.00,
    fees: 8.00,
    strategies: ["Mean Reversion"],
    setupQuality: 2,
    emotion: "Impulsive",
    notes: "Shorted AAPL thinking it was overextended. Got squeezed above 224 and stopped out. Poor timing and thesis.",
    tags: ["Revenge Trade", "Large Cap"],
    isFavorite: false,
    status: "closed",
    pnl: computePnl(222.40, 225.80, 200, "short", 8.00),
    pnlPercent: computePnlPercent(222.40, 225.80, "short"),
    riskReward: computeRiskReward(222.40, 225.80, 224.50, "short"),
  },
  {
    id: "trade_004",
    symbol: "ES",
    direction: "long",
    entryDate: "2026-03-07",
    entryTime: "09:35",
    entryPrice: 5885.00,
    exitPrice: 5912.50,
    quantity: 2,
    stopLoss: 5870.00,
    takeProfit: 5920.00,
    fees: 9.40,
    strategies: ["VWAP Bounce", "Gap Fill"],
    setupQuality: 4,
    emotion: "Focused",
    notes: "ES gapped down to VWAP and bounced. Took 2 contracts long, trailed stop. Filled gap by lunch.",
    tags: ["Futures", "Pre-Market", "Planned Entry"],
    isFavorite: true,
    status: "closed",
    pnl: computePnl(5885.00, 5912.50, 2, "long", 9.40),
    pnlPercent: computePnlPercent(5885.00, 5912.50, "long"),
    riskReward: computeRiskReward(5885.00, 5912.50, 5870.00, "long"),
  },
  {
    id: "trade_005",
    symbol: "ETH",
    direction: "short",
    entryDate: "2026-03-10",
    entryTime: "20:30",
    entryPrice: 3850.00,
    exitPrice: 3780.00,
    quantity: 3,
    stopLoss: 3900.00,
    takeProfit: 3720.00,
    fees: 11.55,
    strategies: ["Order Block", "Momentum"],
    setupQuality: 3,
    emotion: "Disciplined",
    notes: "ETH rejected the 3860 order block on the 4H. Shorted with tight stop. Covered partial at 3780, rest trailed.",
    tags: ["Crypto", "After Hours"],
    isFavorite: false,
    status: "closed",
    pnl: computePnl(3850.00, 3780.00, 3, "short", 11.55),
    pnlPercent: computePnlPercent(3850.00, 3780.00, "short"),
    riskReward: computeRiskReward(3850.00, 3780.00, 3900.00, "short"),
  },
  {
    id: "trade_006",
    symbol: "SPY",
    direction: "long",
    entryDate: "2026-03-11",
    entryTime: "10:20",
    entryPrice: 587.30,
    exitPrice: 591.85,
    quantity: 150,
    stopLoss: 585.00,
    takeProfit: 594.00,
    fees: 6.00,
    strategies: ["Trend Following", "Fibonacci Retracement"],
    setupQuality: 4,
    emotion: "Confident",
    notes: "SPY pulled back to the 61.8% fib and held. Entered on the 5-min engulfing candle. Clean ride to 591+.",
    tags: ["Index", "A+ Setup", "Planned Entry"],
    isFavorite: true,
    status: "closed",
    pnl: computePnl(587.30, 591.85, 150, "long", 6.00),
    pnlPercent: computePnlPercent(587.30, 591.85, "long"),
    riskReward: computeRiskReward(587.30, 591.85, 585.00, "long"),
  },
  {
    id: "trade_007",
    symbol: "TSLA",
    direction: "long",
    entryDate: "2026-03-13",
    entryTime: "11:00",
    entryPrice: 276.50,
    exitPrice: 271.20,
    quantity: 100,
    stopLoss: 272.00,
    takeProfit: 290.00,
    fees: 8.00,
    strategies: ["Breakout"],
    setupQuality: 2,
    emotion: "Greedy",
    notes: "Tried to catch a breakout on TSLA. Faded hard below entry, didn't honor stop at 272. Held too long hoping for a bounce.",
    tags: ["Large Cap", "FOMO", "Oversize"],
    isFavorite: false,
    status: "closed",
    pnl: computePnl(276.50, 271.20, 100, "long", 8.00),
    pnlPercent: computePnlPercent(276.50, 271.20, "long"),
    riskReward: computeRiskReward(276.50, 271.20, 272.00, "long"),
  },
  {
    id: "trade_008",
    symbol: "NQ",
    direction: "short",
    entryDate: "2026-03-14",
    entryTime: "13:45",
    entryPrice: 21050.00,
    exitPrice: 20920.00,
    quantity: 1,
    stopLoss: 21120.00,
    takeProfit: 20850.00,
    fees: 4.70,
    strategies: ["Head & Shoulders", "Mean Reversion"],
    setupQuality: 4,
    emotion: "Calm",
    notes: "H&S pattern completed on NQ 15-min chart. Shorted the neckline break. Covered at first support for 130 pts.",
    tags: ["Futures", "Index", "A+ Setup"],
    isFavorite: false,
    status: "closed",
    pnl: computePnl(21050.00, 20920.00, 1, "short", 4.70),
    pnlPercent: computePnlPercent(21050.00, 20920.00, "short"),
    riskReward: computeRiskReward(21050.00, 20920.00, 21120.00, "short"),
  },
  {
    id: "trade_009",
    symbol: "QQQ",
    direction: "long",
    entryDate: "2026-03-17",
    entryTime: "09:50",
    entryPrice: 508.20,
    exitPrice: 0,
    quantity: 100,
    stopLoss: 504.00,
    takeProfit: 518.00,
    fees: 0,
    strategies: ["Swing Trade", "Trend Following"],
    setupQuality: 3,
    emotion: "Neutral",
    notes: "QQQ showing strength off the weekly 20EMA. Swing long with wide stop. Targeting the 518 level.",
    tags: ["Index", "Planned Entry"],
    isFavorite: false,
    status: "open",
    pnl: 0,
    pnlPercent: 0,
    riskReward: 0,
  },
  {
    id: "trade_010",
    symbol: "NVDA",
    direction: "long",
    entryDate: "2026-03-17",
    entryTime: "10:10",
    entryPrice: 948.00,
    exitPrice: 0,
    quantity: 50,
    stopLoss: 935.00,
    takeProfit: 970.00,
    fees: 0,
    strategies: ["Flag/Pennant", "Momentum"],
    setupQuality: 4,
    emotion: "Focused",
    notes: "Bull flag on the daily. Entered on the breakout candle above the flag. Targeting prior highs near 970.",
    tags: ["Large Cap", "A+ Setup", "High Volume"],
    isFavorite: false,
    status: "open",
    pnl: 0,
    pnlPercent: 0,
    riskReward: 0,
  },
]

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function tradeReducer(state: TradeState, action: TradeAction): TradeState {
  switch (action.type) {
    case "ADD_TRADE": {
      const trade = action.payload
      const pnl = computePnl(
        trade.entryPrice,
        trade.exitPrice,
        trade.quantity,
        trade.direction,
        trade.fees
      )
      const pnlPercent = computePnlPercent(
        trade.entryPrice,
        trade.exitPrice,
        trade.direction
      )
      const riskReward = computeRiskReward(
        trade.entryPrice,
        trade.exitPrice,
        trade.stopLoss,
        trade.direction
      )
      return {
        ...state,
        trades: [
          ...state.trades,
          { ...trade, pnl, pnlPercent, riskReward },
        ],
      }
    }

    case "UPDATE_TRADE": {
      const updated = action.payload
      return {
        ...state,
        trades: state.trades.map((t) => {
          if (t.id !== updated.id) return t
          const merged = { ...t, ...updated }
          merged.pnl = computePnl(merged.entryPrice, merged.exitPrice, merged.quantity, merged.direction, merged.fees)
          merged.pnlPercent = computePnlPercent(merged.entryPrice, merged.exitPrice, merged.direction)
          merged.riskReward = computeRiskReward(merged.entryPrice, merged.exitPrice, merged.stopLoss, merged.direction)
          return merged
        }),
      }
    }

    case "DELETE_TRADE": {
      return {
        ...state,
        trades: state.trades.filter((t) => t.id !== action.payload),
      }
    }

    case "TOGGLE_FAVORITE": {
      return {
        ...state,
        trades: state.trades.map((t) =>
          t.id === action.payload ? { ...t, isFavorite: !t.isFavorite } : t
        ),
      }
    }

    default:
      return state
  }
}

const initialTradeState: TradeState = {
  trades: INITIAL_TRADES,
}

// ---------------------------------------------------------------------------
// Toast Context
// ---------------------------------------------------------------------------

interface ToastContextValue {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

function useToast() {
  return useContext(ToastContext)
}

// ---------------------------------------------------------------------------
// Inlined UI Primitives
// ---------------------------------------------------------------------------

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg" | "icon"
  children: ReactNode
  className?: string
}

function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none"

  const variantClasses: Record<string, string> = {
    primary:
      "bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 shadow-lg shadow-emerald-500/20",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 focus:ring-slate-500 border border-slate-700",
    ghost:
      "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 focus:ring-slate-500",
    danger:
      "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 shadow-lg shadow-red-500/20",
    outline:
      "bg-transparent border border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 focus:ring-emerald-500",
  }

  const sizeClasses: Record<string, string> = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
    icon: "p-2",
  }

  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
  wrapperClassName?: string
}

function Input({
  label,
  error,
  className = "",
  wrapperClassName = "",
  ...props
}: InputProps) {
  return (
    <div className={classNames("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={classNames(
          "w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200",
          error && "border-red-500 focus:ring-red-500/40 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

// --- Badge ---
interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning" | "info" | "outline"
  size?: "sm" | "md"
  children: ReactNode
  className?: string
  onClick?: () => void
}

function Badge({
  variant = "default",
  size = "sm",
  children,
  className = "",
  onClick,
}: BadgeProps) {
  const variantClasses: Record<string, string> = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    danger: "bg-red-500/15 text-red-400 border-red-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    outline: "bg-transparent text-slate-400 border-slate-600",
  }

  const sizeClasses: Record<string, string> = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  }

  return (
    <span
      className={classNames(
        "inline-flex items-center font-medium border rounded-full whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      {children}
    </span>
  )
}

// --- Tooltip ---
interface TooltipProps {
  content: string
  children: ReactNode
  position?: "top" | "bottom" | "left" | "right"
  className?: string
}

function Tooltip({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false)

  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div
      className={classNames("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={classNames(
            "absolute z-50 px-2.5 py-1.5 text-xs font-medium text-slate-100 bg-slate-800 border border-slate-700 rounded-lg shadow-xl whitespace-nowrap pointer-events-none",
            positionClasses[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}

// --- Dialog ---
interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  maxWidth?: string
}

function Dialog({
  open,
  onClose,
  title,
  children,
  className = "",
  maxWidth = "max-w-2xl",
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={classNames(
          "relative w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden",
          maxWidth,
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80">
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        )}
        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// --- Toast Container ---
function ToastContainer({ toasts, removeToast }: { toasts: ToastMessage[]; removeToast: (id: string) => void }) {
  const iconMap: Record<string, ReactNode> = {
    success: <Check size={16} className="text-emerald-400" />,
    error: <X size={16} className="text-red-400" />,
    warning: <AlertTriangle size={16} className="text-amber-400" />,
    info: <Info size={16} className="text-blue-400" />,
  }

  const borderMap: Record<string, string> = {
    success: "border-l-emerald-500",
    error: "border-l-red-500",
    warning: "border-l-amber-500",
    info: "border-l-blue-500",
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={classNames(
            "flex items-start gap-3 p-4 bg-slate-900 border border-slate-700 border-l-4 rounded-lg shadow-xl animate-slide-in-right",
            borderMap[toast.type]
          )}
        >
          <div className="mt-0.5">{iconMap[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100">{toast.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// --- Toast Provider ---
function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// ═══════════════════════════════════════
// SECTION 2: Sidebar & Trade Form
// ═══════════════════════════════════════

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "journal", label: "Journal", icon: BookOpen },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "calculators", label: "Calculators", icon: Calculator },
  { key: "calendar", label: "Calendar", icon: Calendar },
  { key: "strategies", label: "Strategies", icon: Crosshair },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "export", label: "Export", icon: Download },
]

const SYMBOL_OPTIONS = [
  "AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "GOOGL", "META",
  "BTC/USD", "ETH/USD", "ES", "NQ", "SPY", "QQQ",
]

function Sidebar({
  collapsed,
  onToggle,
  activeView,
  onViewChange,
  isMobile = false,
}: {
  collapsed: boolean
  onToggle: () => void
  activeView: string
  onViewChange: (view: string) => void
  isMobile?: boolean
}) {
  const sidebarContent = (
    <div
      className={classNames(
        "flex flex-col h-full bg-slate-950 border-r border-slate-800/50 transition-all duration-300 ease-in-out",
        collapsed && !isMobile ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800/50">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        {(!collapsed || isMobile) && (
          <span className="text-sm font-bold tracking-wider text-slate-200 uppercase whitespace-nowrap">
            TradeLog
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.key
          const btn = (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className={classNames(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "text-emerald-500 bg-emerald-500/10 border-l-2 border-emerald-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-2 border-transparent"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          )
          return collapsed && !isMobile ? (
            <Tooltip key={item.key} content={item.label} position="right">
              {btn}
            </Tooltip>
          ) : (
            <React.Fragment key={item.key}>{btn}</React.Fragment>
          )
        })}
      </nav>

      <div className="border-t border-slate-800/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            AR
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">Alex Rivera</p>
              <Badge variant="warning" className="text-[10px] mt-0.5">
                Elite Tier
              </Badge>
            </div>
          )}
        </div>
      </div>

      {!isMobile && (
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-10 border-t border-slate-800/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <>
        {!collapsed && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onToggle}
          />
        )}
        <div
          className={classNames(
            "fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out",
            collapsed ? "-translate-x-full" : "translate-x-0"
          )}
        >
          {sidebarContent}
        </div>
      </>
    )
  }

  return sidebarContent
}

function TradeForm({
  onSubmit,
  editingTrade = null,
  onCancelEdit,
}: {
  onSubmit: (trade: TradeRecord) => void
  editingTrade?: TradeRecord | null
  onCancelEdit?: () => void
}) {
  const { addToast } = useToast()
  const isEditing = !!editingTrade

  const emptyForm = {
    symbol: "",
    direction: "" as "long" | "short" | "",
    entryDate: new Date().toISOString().slice(0, 10),
    entryTime: new Date().toTimeString().slice(0, 5),
    entryPrice: "",
    exitPrice: "",
    quantity: "",
    stopLoss: "",
    takeProfit: "",
    fees: "",
    strategies: [] as string[],
    setupQuality: 0,
    emotion: "",
    notes: "",
    tags: [] as string[],
  }

  const [form, setForm] = useState(emptyForm)
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [symbolOpen, setSymbolOpen] = useState(false)
  const [symbolSearch, setSymbolSearch] = useState("")
  const symbolRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editingTrade) {
      setForm({
        symbol: editingTrade.symbol || "",
        direction: editingTrade.direction || "",
        entryDate: editingTrade.entryDate || "",
        entryTime: editingTrade.entryTime || "",
        entryPrice: String(editingTrade.entryPrice ?? ""),
        exitPrice: String(editingTrade.exitPrice ?? ""),
        quantity: String(editingTrade.quantity ?? ""),
        stopLoss: String(editingTrade.stopLoss ?? ""),
        takeProfit: String(editingTrade.takeProfit ?? ""),
        fees: String(editingTrade.fees ?? ""),
        strategies: editingTrade.strategies || [],
        setupQuality: editingTrade.setupQuality || 0,
        emotion: editingTrade.emotion || "",
        notes: editingTrade.notes || "",
        tags: editingTrade.tags || [],
      })
      setErrors({})
      setTouched({})
    }
  }, [editingTrade])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (symbolRef.current && !symbolRef.current.contains(e.target as Node)) {
        setSymbolOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filteredSymbols = useMemo(
    () =>
      SYMBOL_OPTIONS.filter((s) =>
        s.toLowerCase().includes(symbolSearch.toLowerCase())
      ),
    [symbolSearch]
  )

  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    if (!form.symbol) e.symbol = "Symbol is required"
    if (!form.direction) e.direction = "Direction is required"
    if (!form.entryPrice || isNaN(Number(form.entryPrice)))
      e.entryPrice = "Valid entry price is required"
    if (!form.exitPrice || isNaN(Number(form.exitPrice)))
      e.exitPrice = "Valid exit price is required"
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
      e.quantity = "Valid quantity is required"
    return e
  }, [form])

  const validationErrors = useMemo(() => validate(), [validate])
  const isValid = Object.keys(validationErrors).length === 0

  const setField = (key: string, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  const showError = (key: string) => touched[key] && validationErrors[key]

  const computedPnl = useMemo(() => {
    const entry = Number(form.entryPrice)
    const exit = Number(form.exitPrice)
    const qty = Number(form.quantity)
    const fees = Number(form.fees) || 0
    if (!entry || !exit || !qty || !form.direction) return null
    return computePnl(entry, exit, qty, form.direction as "long" | "short", fees)
  }, [form.entryPrice, form.exitPrice, form.quantity, form.direction, form.fees])

  const computedPnlPercent = useMemo(() => {
    const entry = Number(form.entryPrice)
    const exit = Number(form.exitPrice)
    if (!entry || !exit || !form.direction) return null
    return computePnlPercent(entry, exit, form.direction as "long" | "short")
  }, [form.entryPrice, form.exitPrice, form.direction])

  const computedRR = useMemo(() => {
    const entry = Number(form.entryPrice)
    const exit = Number(form.exitPrice)
    const sl = Number(form.stopLoss)
    if (!entry || !exit || !sl || !form.direction) return null
    return computeRiskReward(entry, exit, sl, form.direction as "long" | "short")
  }, [form.entryPrice, form.exitPrice, form.stopLoss, form.direction])

  const resetForm = () => {
    setForm(emptyForm)
    setTagInput("")
    setErrors({})
    setTouched({})
  }

  const handleSubmit = (andAddAnother = false) => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setTouched(Object.keys(errs).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
      return
    }

    const entry = Number(form.entryPrice)
    const exit = Number(form.exitPrice)
    const qty = Number(form.quantity)
    const fees = Number(form.fees) || 0
    const dir = form.direction as "long" | "short"

    const trade: TradeRecord = {
      id: editingTrade?.id || generateId(),
      symbol: form.symbol,
      direction: dir,
      entryDate: form.entryDate,
      entryTime: form.entryTime,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      stopLoss: form.stopLoss ? Number(form.stopLoss) : undefined,
      takeProfit: form.takeProfit ? Number(form.takeProfit) : undefined,
      fees,
      strategies: form.strategies,
      setupQuality: form.setupQuality,
      emotion: form.emotion,
      notes: form.notes,
      tags: form.tags,
      isFavorite: editingTrade?.isFavorite ?? false,
      status: "closed",
      pnl: computePnl(entry, exit, qty, dir, fees),
      pnlPercent: computePnlPercent(entry, exit, dir),
      riskReward: form.stopLoss ? computeRiskReward(entry, exit, Number(form.stopLoss), dir) : 0,
    }

    onSubmit(trade)
    addToast({
      type: "success",
      title: isEditing ? "Trade Updated" : "Trade Logged",
      message: `${trade.symbol} ${trade.direction} ${formatCurrency(trade.pnl)}`,
    })

    if (!andAddAnother) {
      resetForm()
    } else {
      setForm((prev) => ({
        ...prev,
        entryPrice: "",
        exitPrice: "",
        quantity: "",
        stopLoss: "",
        takeProfit: "",
        fees: "",
        notes: "",
        tags: [],
        setupQuality: 0,
        emotion: "",
      }))
      setTouched({})
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!form.tags.includes(tagInput.trim())) {
        setField("tags", [...form.tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setField("tags", form.tags.filter((t) => t !== tag))
  }

  const toggleStrategy = (strat: string) => {
    setField(
      "strategies",
      form.strategies.includes(strat)
        ? form.strategies.filter((s) => s !== strat)
        : [...form.strategies, strat]
    )
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-300">
            {isEditing ? "Update Trade" : "Log New Trade"}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Capture every trade. Build your edge.</p>
        </div>
        {isEditing && onCancelEdit && (
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
        )}
      </div>

      <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {/* Symbol Combobox */}
        <div ref={symbolRef} className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Symbol <span className="text-rose-400">*</span>
          </label>
          <div
            className={classNames(
              "flex items-center bg-slate-800 border rounded-lg px-3 py-2 cursor-pointer transition-colors",
              showError("symbol") ? "border-rose-400" : "border-slate-700 focus-within:border-emerald-500"
            )}
            onClick={() => setSymbolOpen(!symbolOpen)}
          >
            <Search className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={symbolOpen ? symbolSearch : form.symbol}
              onChange={(e) => {
                setSymbolSearch(e.target.value)
                if (!symbolOpen) setSymbolOpen(true)
              }}
              onFocus={() => setSymbolOpen(true)}
              className="bg-transparent text-sm text-slate-200 outline-none flex-1 placeholder-slate-600"
            />
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
          {symbolOpen && (
            <div className="absolute z-30 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {filteredSymbols.map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    setField("symbol", sym)
                    setSymbolSearch("")
                    setSymbolOpen(false)
                  }}
                  className={classNames(
                    "w-full text-left px-3 py-2 text-sm transition-colors",
                    form.symbol === sym
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-slate-300 hover:bg-slate-700/50"
                  )}
                >
                  {sym}
                </button>
              ))}
              {filteredSymbols.length === 0 && (
                <p className="px-3 py-2 text-sm text-slate-500">No matches</p>
              )}
            </div>
          )}
          {showError("symbol") && (
            <p className="mt-1 text-xs text-rose-400">{validationErrors.symbol}</p>
          )}
        </div>

        {/* Direction Toggle */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Direction <span className="text-rose-400">*</span>
          </label>
          <div className="flex gap-2">
            {(["long", "short"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setField("direction", dir)}
                className={classNames(
                  "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  form.direction === dir
                    ? dir === "long"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/50"
                    : "bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-600"
                )}
              >
                {dir === "long" ? (
                  <TrendingUp className="w-4 h-4 inline mr-1.5" />
                ) : (
                  <TrendingDown className="w-4 h-4 inline mr-1.5" />
                )}
                {dir.toUpperCase()}
              </button>
            ))}
          </div>
          {showError("direction") && (
            <p className="mt-1 text-xs text-rose-400">{validationErrors.direction}</p>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Entry Date" type="date" value={form.entryDate} onChange={(e) => setField("entryDate", e.target.value)} />
          <Input label="Entry Time" type="time" value={form.entryTime} onChange={(e) => setField("entryTime", e.target.value)} />
        </div>

        {/* Price Row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Entry Price *"
            type="number"
            step="any"
            placeholder="0.00"
            value={form.entryPrice}
            onChange={(e) => setField("entryPrice", e.target.value)}
            error={showError("entryPrice") ? validationErrors.entryPrice : undefined}
          />
          <Input
            label="Exit Price *"
            type="number"
            step="any"
            placeholder="0.00"
            value={form.exitPrice}
            onChange={(e) => setField("exitPrice", e.target.value)}
            error={showError("exitPrice") ? validationErrors.exitPrice : undefined}
          />
        </div>

        {/* Qty, SL, TP */}
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Quantity *"
            type="number"
            step="any"
            placeholder="0"
            value={form.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
            error={showError("quantity") ? validationErrors.quantity : undefined}
          />
          <Input label="Stop Loss" type="number" step="any" placeholder="0.00" value={form.stopLoss} onChange={(e) => setField("stopLoss", e.target.value)} />
          <Input label="Take Profit" type="number" step="any" placeholder="0.00" value={form.takeProfit} onChange={(e) => setField("takeProfit", e.target.value)} />
        </div>

        {/* Fees */}
        <Input label="Fees / Commission" type="number" step="any" placeholder="0.00" value={form.fees} onChange={(e) => setField("fees", e.target.value)} />

        {/* Strategy Chips */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Strategy</label>
          <div className="flex flex-wrap gap-2">
            {STRATEGIES.map((strat) => (
              <button
                key={strat}
                onClick={() => toggleStrategy(strat)}
                className={classNames(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  form.strategies.includes(strat)
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                    : "bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600 hover:text-slate-300"
                )}
              >
                {strat}
              </button>
            ))}
          </div>
        </div>

        {/* Setup Quality */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Setup Quality</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button key={rating} onClick={() => setField("setupQuality", form.setupQuality === rating ? 0 : rating)} className="p-0.5 transition-transform hover:scale-110">
                <Star className={classNames("w-6 h-6 transition-colors", rating <= form.setupQuality ? "text-amber-400 fill-amber-400" : "text-slate-700")} />
              </button>
            ))}
          </div>
        </div>

        {/* Emotion */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Emotion</label>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((emo) => (
              <button
                key={emo.value}
                onClick={() => setField("emotion", form.emotion === emo.value ? "" : emo.value)}
                className={classNames(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
                  form.emotion === emo.value
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                    : "bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600"
                )}
              >
                <span>{emo.icon}</span>
                {emo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="What was your thesis? What did you learn?"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Tags</label>
          <div className="flex flex-wrap items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus-within:border-emerald-500 transition-colors">
            {form.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-slate-500 hover:text-rose-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={form.tags.length === 0 ? "Type and press Enter..." : ""}
              className="bg-transparent text-sm text-slate-200 outline-none flex-1 min-w-[100px] placeholder-slate-600"
            />
          </div>
        </div>

        {/* Computed Summary */}
        {(computedPnl !== null || computedRR !== null || computedPnlPercent !== null) && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Computed Summary</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {computedPnl !== null && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">P&L</p>
                  <p className={classNames("text-lg font-bold font-mono", computedPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>{formatCurrency(computedPnl)}</p>
                </div>
              )}
              {computedPnlPercent !== null && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Return</p>
                  <p className={classNames("text-lg font-bold font-mono", computedPnlPercent >= 0 ? "text-emerald-400" : "text-rose-400")}>{formatPercent(computedPnlPercent)}</p>
                </div>
              )}
              {computedRR !== null && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">R:R</p>
                  <p className="text-lg font-bold font-mono text-cyan-400">{computedRR.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <Button variant="primary" size="lg" className="w-full shadow-lg shadow-emerald-500/20" disabled={!isValid} onClick={() => handleSubmit(false)}>
            {isEditing ? "UPDATE TRADE" : "SAVE TRADE"}
          </Button>
          {!isEditing && (
            <Button variant="outline" size="md" className="w-full" disabled={!isValid} onClick={() => handleSubmit(true)}>
              Save & Add Another
            </Button>
          )}
          <button onClick={resetForm} className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-1">
            Clear Form
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// SECTION 3: Journal Table
// ═══════════════════════════════════════

const JOURNAL_TABS = ["All Trades", "Open", "Closed", "This Week", "Favorites"] as const
type JournalTab = (typeof JOURNAL_TABS)[number]

type JournalSortField = "date" | "pnl" | "symbol" | "rr"
type JournalSortDir = "asc" | "desc"

const ROWS_PER_PAGE = 10

function getSymbolType(symbol: string): "crypto" | "stock" | "futures" {
  if (/BTC|ETH|SOL|BNB|XRP|DOGE|ADA|AVAX|DOT/i.test(symbol)) return "crypto"
  if (/^(ES|NQ|CL|GC|SI|ZB|RTY|YM|MES|MNQ|MCL)\d?$/i.test(symbol)) return "futures"
  return "stock"
}

const symbolBadgeVariant: Record<ReturnType<typeof getSymbolType>, "info" | "warning" | "outline"> = {
  crypto: "info",
  stock: "warning",
  futures: "outline",
}

function isThisWeek(dateStr: string): boolean {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  const d = new Date(dateStr)
  return d >= monday && d <= sunday
}

function JournalTable({
  trades,
  onDelete,
  onEdit,
  onToggleFavorite,
}: {
  trades: TradeRecord[]
  onDelete: (id: string) => void
  onEdit: (trade: TradeRecord) => void
  onToggleFavorite: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState<JournalTab>("All Trades")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [sortField, setSortField] = useState<JournalSortField>("date")
  const [sortDir, setSortDir] = useState<JournalSortDir>("desc")
  const [page, setPage] = useState(0)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TradeRecord | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => { setPage(0) }, [activeTab, debouncedQuery, sortField, sortDir])

  const tabCounts: Record<JournalTab, number> = useMemo(() => ({
    "All Trades": trades.length,
    "Open": trades.filter((t) => t.status === "open").length,
    "Closed": trades.filter((t) => t.status === "closed").length,
    "This Week": trades.filter((t) => isThisWeek(t.entryDate)).length,
    "Favorites": trades.filter((t) => t.isFavorite).length,
  }), [trades])

  const filtered = useMemo(() => {
    let result = [...trades]
    switch (activeTab) {
      case "Open": result = result.filter((t) => t.status === "open"); break
      case "Closed": result = result.filter((t) => t.status === "closed"); break
      case "This Week": result = result.filter((t) => isThisWeek(t.entryDate)); break
      case "Favorites": result = result.filter((t) => t.isFavorite); break
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase()
      result = result.filter((t) => t.symbol.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "date": cmp = new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(); break
        case "pnl": cmp = a.pnl - b.pnl; break
        case "symbol": cmp = a.symbol.localeCompare(b.symbol); break
        case "rr": cmp = a.riskReward - b.riskReward; break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return result
  }, [trades, activeTab, debouncedQuery, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const paginated = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE)
  const showingStart = filtered.length === 0 ? 0 : page * ROWS_PER_PAGE + 1
  const showingEnd = Math.min((page + 1) * ROWS_PER_PAGE, filtered.length)

  const handleColumnSort = (field: JournalSortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("desc") }
  }

  const clearFilters = () => {
    setSearchQuery(""); setDebouncedQuery(""); setSortField("date"); setSortDir("desc"); setActiveTab("All Trades")
  }

  const handleExportCSV = () => {
    const headers = ["Date", "Time", "Symbol", "Direction", "Entry", "Exit", "Qty", "P&L", "P&L %", "Strategy", "R:R", "Notes"]
    const rows = filtered.map((t) => [
      t.entryDate, t.entryTime, t.symbol, t.direction, t.entryPrice, t.exitPrice, t.quantity,
      t.pnl, t.pnlPercent, t.strategies.join("; "), t.riskReward, `"${(t.notes || "").replace(/"/g, '""')}"`
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `journal_export_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const SortIndicator = ({ field }: { field: JournalSortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 ml-1 text-emerald-400" /> : <ArrowDown className="w-3 h-3 ml-1 text-emerald-400" />
  }

  const renderStars = (quality: number) => (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={classNames("w-3.5 h-3.5", i <= quality ? "fill-amber-400 text-amber-400" : "text-slate-600")} />
      ))}
    </span>
  )

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-4 border-b border-slate-700/50 overflow-x-auto">
        {JOURNAL_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={classNames(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeTab === tab ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {tab} ({tabCounts[tab]})
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-700/50">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            placeholder="Search symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort:</span>
          <select value={sortField} onChange={(e) => setSortField(e.target.value as JournalSortField)} className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500">
            <option value="date">Date</option>
            <option value="pnl">P&L</option>
            <option value="symbol">Symbol</option>
            <option value="rr">R:R</option>
          </select>
          <Button variant="ghost" size="icon" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
            {sortDir === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </Button>
        </div>
        <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-emerald-400 transition-colors ml-auto">Clear Filters</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              {[
                { label: "Date", field: "date" as JournalSortField, sortable: true },
                { label: "Symbol", field: "symbol" as JournalSortField, sortable: true },
                { label: "Dir", field: null, sortable: false },
                { label: "Entry", field: null, sortable: false },
                { label: "Exit", field: null, sortable: false },
                { label: "Qty", field: null, sortable: false },
                { label: "P&L ($)", field: "pnl" as JournalSortField, sortable: true },
                { label: "P&L (%)", field: null, sortable: false },
                { label: "Strategy", field: null, sortable: false },
                { label: "R:R", field: "rr" as JournalSortField, sortable: true },
                { label: "Actions", field: null, sortable: false },
              ].map((col) => (
                <th
                  key={col.label}
                  onClick={() => col.sortable && col.field && handleColumnSort(col.field)}
                  className={classNames(
                    "px-4 py-3 text-left uppercase tracking-wider text-xs text-slate-400 font-medium",
                    col.sortable && "cursor-pointer hover:text-slate-200 select-none"
                  )}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && col.field && <SortIndicator field={col.field} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No trades found
                </td>
              </tr>
            )}
            {paginated.map((trade) => {
              const isExpanded = expandedRowId === trade.id
              const isPositive = trade.pnl >= 0
              const symbolType = getSymbolType(trade.symbol)
              return (
                <React.Fragment key={trade.id}>
                  <tr
                    onClick={() => setExpandedRowId(isExpanded ? null : trade.id)}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-slate-200">{formatDate(trade.entryDate)}</div>
                      <div className="text-xs text-slate-500">{formatTime(trade.entryTime)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{trade.symbol}</span>
                        <Badge variant={symbolBadgeVariant[symbolType]} className="text-[10px] px-1.5 py-0">{symbolType}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={classNames("inline-flex items-center gap-1 text-xs font-medium", trade.direction === "long" ? "text-emerald-400" : "text-rose-400")}>
                        {trade.direction === "long" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {trade.direction === "long" ? "Long" : "Short"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{formatCurrency(trade.entryPrice)}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{trade.exitPrice ? formatCurrency(trade.exitPrice) : "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{trade.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={classNames("font-bold font-mono", isPositive ? "text-emerald-400" : "text-rose-400")}>
                        {formatCurrency(trade.pnl)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={classNames("font-mono", isPositive ? "text-emerald-400" : "text-rose-400")}>
                        {formatPercent(trade.pnlPercent)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {trade.strategies.length > 0 && (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/40">
                          {trade.strategies[0]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium font-mono">
                      {trade.riskReward ? `${trade.riskReward.toFixed(1)}R` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Tooltip content="Edit">
                          <Button variant="ghost" size="icon" onClick={() => onEdit(trade)}>
                            <Edit3 className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(trade)}>
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                          </Button>
                        </Tooltip>
                        <Tooltip content={trade.isFavorite ? "Unfavorite" : "Favorite"}>
                          <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(trade.id)}>
                            <Star className={classNames("w-4 h-4", trade.isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-400 hover:text-amber-400")} />
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-800/20">
                      <td colSpan={11} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 space-y-3">
                            {trade.notes && (
                              <div>
                                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Notes</h4>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
                              </div>
                            )}
                            {trade.tags.length > 0 && (
                              <div>
                                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Tags</h4>
                                <div className="flex flex-wrap gap-1.5">{trade.tags.map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}</div>
                              </div>
                            )}
                            {trade.strategies.length > 0 && (
                              <div>
                                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Strategies</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {trade.strategies.map((s) => <span key={s} className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{s}</span>)}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Setup Quality</h4>
                              {renderStars(trade.setupQuality)}
                            </div>
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Emotion</h4>
                              <span className="text-sm text-slate-300 capitalize">{trade.emotion || "—"}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div><span className="text-slate-500">Stop Loss</span><div className="text-slate-300 font-mono">{trade.stopLoss != null ? formatCurrency(trade.stopLoss) : "—"}</div></div>
                              <div><span className="text-slate-500">Take Profit</span><div className="text-slate-300 font-mono">{trade.takeProfit != null ? formatCurrency(trade.takeProfit) : "—"}</div></div>
                              <div><span className="text-slate-500">Fees</span><div className="text-slate-300 font-mono">{formatCurrency(trade.fees)}</div></div>
                              <div><span className="text-slate-500">R:R</span><div className="text-slate-300 font-medium">{trade.riskReward ? `${trade.riskReward.toFixed(2)}R` : "—"}</div></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
        <span className="text-xs text-slate-400">Showing {showingStart}–{showingEnd} of {filtered.length} trades</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" />Prev
          </Button>
          <span className="text-xs text-slate-400">{page + 1} / {totalPages}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
            Next<ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-900/40">
        <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        <span className="text-xs text-slate-500">{filtered.length} trade{filtered.length !== 1 ? "s" : ""} total</span>
      </div>

      {/* Delete Dialog */}
      {deleteTarget && (
        <Dialog open onClose={() => setDeleteTarget(null)}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Delete Trade</h3>
              <p className="text-sm text-slate-400">Delete this <span className="font-bold text-slate-200">{deleteTarget.symbol}</span> trade? This cannot be undone.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { onDelete(deleteTarget.id); setDeleteTarget(null) }}>
              <Trash2 className="w-4 h-4 mr-2" />Delete
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// SECTION 4: Insights, Navbar, Footer & Main App
// ═══════════════════════════════════════

function InsightsDashboard({ trades }: { trades: TradeRecord[] }) {
  const [equityRange, setEquityRange] = useState<string>("ALL")

  const closedTrades = useMemo(() => trades.filter((t) => t.status === "closed"), [trades])

  const totalPnl = useMemo(() => closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0), [closedTrades])
  const winRate = useMemo(() => getWinRate(closedTrades), [closedTrades])
  const avgRR = useMemo(() => {
    const withRR = closedTrades.filter((t) => t.riskReward != null && t.riskReward > 0)
    if (withRR.length === 0) return 0
    return withRR.reduce((s, t) => s + (t.riskReward ?? 0), 0) / withRR.length
  }, [closedTrades])
  const maxDD = useMemo(() => getMaxDrawdown(closedTrades), [closedTrades])

  const equityData = useMemo(() => {
    const points: { date: string; equity: number }[] = []
    let val = 50000
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      const label = `${d.getMonth() + 1}/${d.getDate()}`
      if (i === 10) val -= 2100
      else if (i === 21) val -= 1800
      else val += (12847 + 2100 + 1800) / 28 * (0.6 + Math.random() * 0.8)
      points.push({ date: label, equity: Math.round(val) })
    }
    points[29].equity = 62847
    points[28].equity = Math.round(points[28].equity + (62847 - points[29].equity) * 0.5)
    return points
  }, [])

  const monthlyData = useMemo(() => {
    const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
    const vals = [2340, -890, 4120, 1560, -420, 3280]
    return months.map((m, i) => ({ month: m, pnl: vals[i] }))
  }, [])

  const winLossData = useMemo(() => {
    const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0).length
    const losses = closedTrades.length - wins
    return [
      { name: "Wins", value: wins || 1 },
      { name: "Losses", value: losses || 1 },
    ]
  }, [closedTrades])

  const strategyPerformance = useMemo(() => {
    const map: Record<string, { pnl: number; count: number }> = {}
    closedTrades.forEach((t) => {
      t.strategies.forEach((strat) => {
        if (!map[strat]) map[strat] = { pnl: 0, count: 0 }
        map[strat].pnl += t.pnl ?? 0
        map[strat].count += 1
      })
    })
    return Object.entries(map)
      .map(([strategy, data]) => ({ strategy, ...data }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
      .slice(0, 5)
  }, [closedTrades])

  const maxStratPnl = useMemo(() => Math.max(...strategyPerformance.map((s) => Math.abs(s.pnl)), 1), [strategyPerformance])

  const riskData = useMemo(() => [{ name: "Risk", value: 42, fill: CHART_COLORS.emerald }], [])

  const kpis = [
    { label: "Total P&L", value: formatCurrency(totalPnl), detail: `${closedTrades.length} closed trades`, icon: DollarSign, color: totalPnl >= 0 ? CHART_COLORS.emerald : CHART_COLORS.rose },
    { label: "Win Rate", value: formatPercent(winRate), detail: `${closedTrades.filter((t) => (t.pnl ?? 0) > 0).length} wins`, icon: Target, color: winRate > 55 ? CHART_COLORS.emerald : CHART_COLORS.rose },
    { label: "Avg R:R", value: avgRR.toFixed(2), detail: "risk to reward", icon: TrendingUp, color: CHART_COLORS.blue },
    { label: "Max Drawdown", value: formatCurrency(maxDD), detail: "peak to trough", icon: TrendingDown, color: CHART_COLORS.rose },
  ]

  const rangeOptions = ["1W", "1M", "3M", "ALL"]

  return (
    <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-8rem)] pr-1 pb-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: kpi.color + "20" }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <span className="text-xs text-slate-400 font-medium">{kpi.label}</span>
              </div>
              <div className="font-mono text-xl font-bold text-white tabular-nums">{kpi.value}</div>
              <div className="text-[11px] text-slate-500">{kpi.detail}</div>
            </div>
          )
        })}
      </div>

      {/* Equity Curve */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Equity Curve</h3>
          <div className="flex gap-1">
            {rangeOptions.map((r) => (
              <button key={r} onClick={() => setEquityRange(r)} className={classNames("px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors", equityRange === r ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300")}>{r}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={equityData}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.emerald} stopOpacity={0.2} />
                <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`} width={45} />
            <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }} formatter={(value) => [formatCurrency(Number(value)), "Equity"]} />
            <Area type="monotone" dataKey="equity" stroke={CHART_COLORS.emerald} strokeWidth={2} fill="url(#equityGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly P&L */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Monthly Performance</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={50} />
            <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }} formatter={(value) => [formatCurrency(Number(value)), "P&L"]} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {monthlyData.map((entry, idx) => <Cell key={idx} fill={entry.pnl >= 0 ? CHART_COLORS.emerald : CHART_COLORS.rose} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Win/Loss Donut */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Win/Loss Ratio</h3>
        <div className="relative">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={winLossData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                <Cell fill={CHART_COLORS.emerald} />
                <Cell fill={CHART_COLORS.rose} />
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-white tabular-nums">{formatPercent(winRate)}</div>
              <div className="text-[10px] text-slate-500">WIN RATE</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs text-slate-400">Wins ({winLossData[0].value})</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-xs text-slate-400">Losses ({winLossData[1].value})</span></div>
        </div>
      </div>

      {/* Strategy Performance */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Strategy Performance</h3>
        <div className="flex flex-col gap-3">
          {strategyPerformance.map((s) => (
            <div key={s.strategy} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{s.strategy}</span>
                <div className="flex items-center gap-2">
                  <span className={classNames("text-xs font-mono font-semibold", s.pnl >= 0 ? "text-emerald-400" : "text-rose-400")}>{formatCurrency(s.pnl)}</span>
                  <span className="text-[10px] text-slate-500">{s.count} trades</span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={classNames("h-full rounded-full transition-all", s.pnl >= 0 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${(Math.abs(s.pnl) / maxStratPnl) * 100}%` }} />
              </div>
            </div>
          ))}
          {strategyPerformance.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No strategy data yet</p>}
        </div>
      </div>

      {/* Risk Meter */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Daily Risk Usage</h3>
        <div className="relative">
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={12} data={riskData} startAngle={210} endAngle={-30}>
              <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#1e293b" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">42%</div>
              <div className="text-[10px] text-slate-500 leading-tight">of $5,000<br />daily limit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Navbar({
  trades,
  onNewTrade,
  onMenuToggle,
}: {
  trades: TradeRecord[]
  onNewTrade: () => void
  onMenuToggle: () => void
}) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayTrades = useMemo(() => trades.filter((t) => t.entryDate === todayStr), [trades, todayStr])
  const todayPnl = useMemo(() => todayTrades.filter((t) => t.status === "closed").reduce((s, t) => s + (t.pnl ?? 0), 0), [todayTrades])
  const overallWinRate = useMemo(() => getWinRate(trades.filter((t) => t.status === "closed")), [trades])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const notifications = [
    { id: 1, text: "AAPL hit your take-profit target at $189.50", time: "2m ago", unread: true },
    { id: 2, text: "Daily risk limit 75% reached — consider slowing down", time: "18m ago", unread: true },
    { id: 3, text: "Weekly journal summary is ready to review", time: "2h ago", unread: false },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden text-slate-400 hover:text-white p-1"><Menu className="w-5 h-5" /></button>
        <span className="text-lg font-bold text-white tracking-tight">TRADERLOG</span>
        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/10">PRO</span>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/50 rounded-full px-4 py-1.5">
          <span className="text-[11px] text-slate-500">Today P&L</span>
          <span className={classNames("text-sm font-mono font-semibold tabular-nums", todayPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>{formatCurrency(todayPnl)}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/50 rounded-full px-4 py-1.5">
          <span className="text-[11px] text-slate-500">Win Rate</span>
          <span className="text-sm font-mono font-semibold text-white tabular-nums">{formatPercent(overallWinRate)}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/50 rounded-full px-4 py-1.5">
          <span className="text-[11px] text-slate-500">Trades Today</span>
          <span className="text-sm font-mono font-semibold text-white tabular-nums">{todayTrades.length}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onNewTrade} variant="primary" size="sm" className="shadow-lg shadow-emerald-500/20">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">New Trade</span>
        </Button>

        <div ref={notifRef} className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setAvatarOpen(false) }} className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <Badge className="bg-rose-500/20 text-rose-400 text-[10px]">2 new</Badge>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className={classNames("px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer", n.unread && "bg-emerald-500/5")}>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.text}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={avatarRef} className="relative">
          <button onClick={() => { setAvatarOpen(!avatarOpen); setNotifOpen(false) }} className="w-9 h-9 rounded-full bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center text-xs font-bold text-white hover:border-emerald-400 transition-colors">AR</button>
          {avatarOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-white">Bikram</p>
                <p className="text-[11px] text-slate-500">Professional Tier</p>
              </div>
              {[{ icon: User, label: "Profile" }, { icon: Settings, label: "Settings" }, { icon: LogOut, label: "Logout" }].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <item.icon className="w-4 h-4" />{item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="h-10 bg-slate-950/80 border-t border-slate-800/50 flex items-center justify-between px-6 text-[11px] text-slate-500 flex-shrink-0">
      <div className="hidden md:flex items-center gap-3">
        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 font-mono">⌘K</kbd><span>Quick search</span></span>
        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 font-mono">⌘N</kbd><span>New trade</span></span>
      </div>
      <div className="text-center">Built for Bikram &bull; March 2026 &bull; Professional Tier</div>
      <div className="hidden md:flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>All Systems Operational</span>
      </div>
    </footer>
  )
}

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

// --- Calculator stubs (replaced in Tasks 8-16) ---
function PositionSizeCalc() { return <p className="text-slate-400 text-sm">Position Size Calculator — implementing...</p> }
function RiskRewardCalc() { return <p className="text-slate-400 text-sm">Risk/Reward Calculator — implementing...</p> }
function PnlCalc() { return <p className="text-slate-400 text-sm">P&amp;L Calculator — implementing...</p> }
function OptionsCalc() { return <p className="text-slate-400 text-sm">Options Pricing Calculator — implementing...</p> }
function CompoundGrowthCalc() { return <p className="text-slate-400 text-sm">Compound Growth Calculator — implementing...</p> }
function MarginCalc() { return <p className="text-slate-400 text-sm">Margin Calculator — implementing...</p> }
function FibonacciCalc() { return <p className="text-slate-400 text-sm">Fibonacci Levels Calculator — implementing...</p> }
function BreakEvenCalc() { return <p className="text-slate-400 text-sm">Break-Even Calculator — implementing...</p> }
function AdrCalc() { return <p className="text-slate-400 text-sm">ADR% Calculator — implementing...</p> }

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
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Trading Calculators</h1>
        <p className="text-sm text-slate-400 mt-1">Professional tools to size, analyze, and plan your trades</p>
      </div>

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

      {openTabs.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
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

          <div className="p-5" role="tabpanel">
            {activeTabId && renderCalculator(activeTabId)}
          </div>
        </div>
      )}

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

// ═══════════════════════════════════════
// MAIN APP — Default Export
// ═══════════════════════════════════════

export default function TradingDashboard() {
  const [state, dispatch] = useReducer(tradeReducer, initialTradeState)
  const trades = state.trades
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [editingTrade, setEditingTrade] = useState<TradeRecord | null>(null)
  const [activeView, setActiveView] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNewTradeForm, setShowNewTradeForm] = useState(true)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)")
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (e.matches) setSidebarCollapsed(true)
    }
    handler(mql)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        const symbolInput = document.querySelector<HTMLInputElement>('input[placeholder*="symbol" i], input[placeholder*="Search symbol"]')
        symbolInput?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault()
        setShowNewTradeForm(true)
        setActiveView("dashboard")
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSubmit = useCallback((trade: TradeRecord) => {
    if (editingTrade) {
      dispatch({ type: "UPDATE_TRADE", payload: trade })
      setEditingTrade(null)
    } else {
      dispatch({ type: "ADD_TRADE", payload: trade })
    }
    setShowNewTradeForm(false)
  }, [editingTrade])

  const handleDelete = useCallback((id: string) => {
    dispatch({ type: "DELETE_TRADE", payload: id })
  }, [])

  const handleEdit = useCallback((trade: TradeRecord) => {
    setEditingTrade(trade)
    setActiveView("dashboard")
    setShowNewTradeForm(true)
  }, [])

  const handleToggleFavorite = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_FAVORITE", payload: id })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingTrade(null)
    setShowNewTradeForm(false)
  }, [])

  return (
    <ToastProvider>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
      `}</style>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar
          trades={trades}
          onNewTrade={() => { setShowNewTradeForm(true); setEditingTrade(null); setActiveView("dashboard") }}
          onMenuToggle={() => { if (isMobile) setMobileMenuOpen(!mobileMenuOpen); else setSidebarCollapsed(!sidebarCollapsed) }}
        />

        <div className="flex flex-1 pt-16">
          {/* Sidebar */}
          {isMobile ? (
            <Sidebar
              collapsed={!mobileMenuOpen}
              onToggle={() => setMobileMenuOpen(false)}
              activeView={activeView}
              onViewChange={(view: string) => { setActiveView(view); setMobileMenuOpen(false) }}
              isMobile
            />
          ) : (
            <div className={classNames("transition-all duration-300 ease-in-out flex-shrink-0", sidebarCollapsed ? "w-16" : "w-56")}>
              <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                activeView={activeView}
                onViewChange={setActiveView}
              />
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              {activeView === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[28%_44%_28%] gap-5">
                  <div className={classNames("order-1 lg:order-1", !showNewTradeForm && !editingTrade && "hidden xl:block")}>
                    <div className="sticky top-0">
                      <TradeForm onSubmit={handleSubmit} editingTrade={editingTrade} onCancelEdit={handleCancelEdit} />
                    </div>
                  </div>
                  <div className="order-3 lg:order-2 xl:order-2 min-h-0">
                    <JournalTable trades={trades} onDelete={handleDelete} onEdit={handleEdit} onToggleFavorite={handleToggleFavorite} />
                  </div>
                  <div className="order-2 lg:order-3 xl:order-3">
                    <InsightsDashboard trades={trades} />
                  </div>
                </div>
              )}

              {activeView === "journal" && (
                <div className="max-w-6xl mx-auto">
                  <JournalTable trades={trades} onDelete={handleDelete} onEdit={handleEdit} onToggleFavorite={handleToggleFavorite} />
                </div>
              )}

              {activeView === "analytics" && (
                <div className="max-w-4xl mx-auto">
                  <InsightsDashboard trades={trades} />
                </div>
              )}

              {activeView === "calculators" && (
                <div className="max-w-7xl mx-auto">
                  <CalculatorsPage />
                </div>
              )}

              {activeView !== "dashboard" && activeView !== "journal" && activeView !== "analytics" && activeView !== "calculators" && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm capitalize">{activeView} view coming soon</p>
                  </div>
                </div>
              )}
            </div>

            <Footer />
          </main>
        </div>

        {/* Mobile FAB */}
        {isMobile && (
          <button
            onClick={() => { setShowNewTradeForm(true); setEditingTrade(null); setActiveView("dashboard") }}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/25 flex items-center justify-center transition-colors"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </ToastProvider>
  )
}
