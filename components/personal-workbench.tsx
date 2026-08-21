'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  Factory,
  FileCheck,
  KeyRound,
  Leaf,
  PackageOpen,
  Recycle,
  ShoppingCart,
  Sprout,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const BLUE = '#086de0'
const GREEN = '#1bbf7a'
const ORANGE = '#ee7c30'
const TEAL = '#12a89d'

function cn(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(' ')
}

// 四类业务概览：资源处置 / 资源出租 / 资源采购 / 钢厂回收
const BUSINESSES = [
  {
    key: 'disposal',
    name: '资源处置',
    icon: PackageOpen,
    color: GREEN,
    tint: 'bg-[#e8f7ee] text-[#1bbf7a]',
    active: 3,
    pending: 1,
    done: 2,
    tons: 91.0,
    reduce: 34.7,
  },
  {
    key: 'rental',
    name: '资源出租',
    icon: KeyRound,
    color: BLUE,
    tint: 'bg-[#e7f1ff] text-[#086de0]',
    active: 4,
    pending: 2,
    done: 2,
    tons: 229.0,
    reduce: 42.26,
  },
  {
    key: 'procurement',
    name: '资源采购',
    icon: ShoppingCart,
    color: ORANGE,
    tint: 'bg-[#fff1e6] text-[#ee7c30]',
    active: 2,
    pending: 1,
    done: 2,
    tons: 308.5,
    reduce: 13.92,
  },
  {
    key: 'steel',
    name: '钢厂回收',
    icon: Factory,
    color: TEAL,
    tint: 'bg-[#e6f6f4] text-[#12a89d]',
    active: 2,
    pending: 0,
    done: 1,
    tons: 174.6,
    reduce: 28.4,
  },
]

// 碳账户月度趋势（tCO₂e）
const carbonTrend = [
  { m: '1月', reduce: 42.0, emit: 7.0 },
  { m: '2月', reduce: 40.0, emit: 8.0 },
  { m: '3月', reduce: 54.0, emit: 8.0 },
  { m: '4月', reduce: 61.2, emit: 10.4 },
  { m: '5月', reduce: 90.0, emit: 13.0 },
  { m: '6月', reduce: 119.28, emit: 18.3 },
]

const todos = [
  {
    key: 't1',
    biz: '资源采购',
    title: '采购订单 CGDD20260520008 待确认收货',
    tag: '待收货',
    tone: 'bg-[#fff1e6] text-[#ee7c30]',
    icon: ShoppingCart,
  },
  {
    key: 't2',
    biz: '资源出租',
    title: '出租订单 ZLDD20260520006 待录入提货单',
    tag: '待提货',
    tone: 'bg-[#e7f1ff] text-[#086de0]',
    icon: KeyRound,
  },
  {
    key: 't3',
    biz: '钢厂回收',
    title: '竞价回收 GHHS20260519003 待过磅计量',
    tag: '待过磅',
    tone: 'bg-[#e6f6f4] text-[#12a89d]',
    icon: Factory,
  },
  {
    key: 't4',
    biz: '资源处置',
    title: '转让订单 ZRDD20260518002 待生成碳凭证',
    tag: '待出证',
    tone: 'bg-[#e8f7ee] text-[#1bbf7a]',
    icon: PackageOpen,
  },
]

const activities = [
  {
    key: 'a1',
    title: '资源出租订单 ZLDD20260520002 履约完成',
    desc: '核发循环利用碳减排凭证 182.05 tCO₂e，归属承租方',
    time: '今天 09:24',
    color: BLUE,
  },
  {
    key: 'a2',
    title: '钢厂竞价回收 GHHS20260519001 完成过磅入炉',
    desc: '废钢 174.6 吨，等效替代铁矿石开采 139.7 吨',
    time: '昨天 16:40',
    color: TEAL,
  },
  {
    key: 'a3',
    title: '资源处置转让 ZRDD20260520002 货权转移完成',
    desc: '碳减排贡献 183.57 tCO₂e，碳凭证归属受让方',
    time: '昨天 11:08',
    color: GREEN,
  },
  {
    key: 'a4',
    title: '资源采购订单 CGDD20260520002 验收入库',
    desc: '再生资源 86.4 吨，回收利用减排 198.48 tCO₂e',
    time: '05-19 15:32',
    color: ORANGE,
  },
]

const chartConfig = {
  reduce: { label: '循环减碳', color: BLUE },
  emit: { label: '碳排放', color: ORANGE },
} satisfies ChartConfig

// 碳账户汇总
const REDUCE_TOTAL = 119.28
const EMIT_TOTAL = 18.3
const NET_TOTAL = REDUCE_TOTAL - EMIT_TOTAL // 净碳效益
const CARBON_CREDIT = 1013 // 碳积分余额
const TREES = Math.round((NET_TOTAL * 1000) / 18.3) // 等效植树（按每棵年固碳约18.3kg）
const COAL = (NET_TOTAL * 0.4).toFixed(1) // 等效节约标煤（吨）

export function PersonalWorkbench() {
  const totalActive = BUSINESSES.reduce((s, b) => s + b.active, 0)
  const totalPending = BUSINESSES.reduce((s, b) => s + b.pending, 0)
  const totalDone = BUSINESSES.reduce((s, b) => s + b.done, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* 欢迎栏 */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
            管
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-balance">
              您好，管理员 · 欢迎回到个人工作台
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              盘古资源平台 · 广州帝隆科技股份有限公司 · 今日 2026-08-21
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#e8f7ee] px-4 py-2.5 text-sm text-[#1bbf7a]">
            <Leaf className="size-4" />
            <span className="font-medium">碳账户等级 A · 循环减碳先锋</span>
          </div>
        </div>
      </header>

      {/* 待办 / 履约概览 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          icon={ClipboardList}
          tint="bg-[#fff1e6] text-[#ee7c30]"
          label="待办事项"
          value={String(todos.length)}
          unit="项"
          hint="需及时处理"
        />
        <OverviewCard
          icon={FileCheck}
          tint="bg-[#e7f1ff] text-[#086de0]"
          label="进行中履约"
          value={String(totalActive)}
          unit="单"
          hint={`待履约 ${totalPending} 单`}
        />
        <OverviewCard
          icon={CheckCircle2}
          tint="bg-[#e8f7ee] text-[#1bbf7a]"
          label="本月已完成"
          value={String(totalDone)}
          unit="单"
          hint="履约结束订单"
        />
        <OverviewCard
          icon={Recycle}
          tint="bg-[#e6f6f4] text-[#12a89d]"
          label="本月循环减碳"
          value={REDUCE_TOTAL.toFixed(1)}
          unit="tCO₂e"
          hint="较上月 +32.5%"
        />
      </div>

      {/* 碳账户 —— 签名区块 */}
      <section className="rounded-xl border bg-card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Wallet className="size-4 text-[#1bbf7a]" />
            企业碳账户
          </h2>
          <span className="rounded-full bg-[#e8f7ee] px-3 py-1 text-xs font-medium text-[#1bbf7a]">
            碳积分余额 {CARBON_CREDIT.toLocaleString()} 分
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_1.3fr]">
          {/* 左：核心账户数值 */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-[#e8f7ee] p-5">
              <div className="flex items-center gap-2 text-sm text-[#1bbf7a]">
                <TrendingDown className="size-4" />
                循环减碳贡献（累计）
              </div>
              <p className="mt-2 flex items-baseline gap-1.5">
                <b className="text-3xl tabular-nums text-[#128a56]">
                  {REDUCE_TOTAL.toFixed(2)}
                </b>
                <span className="text-sm text-[#1bbf7a]">tCO₂e</span>
              </p>
              <p className="mt-1.5 text-xs text-[#1bbf7a]/80">
                资源循环利用相对新品生产的碳减排总量
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="size-3.5 text-[#ee7c30]" />
                  企业碳排放
                </div>
                <p className="mt-2 flex items-baseline gap-1">
                  <b className="text-xl tabular-nums text-[#ee7c30]">
                    {EMIT_TOTAL.toFixed(2)}
                  </b>
                  <span className="text-xs text-muted-foreground">tCO₂e</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  改制 / 运输等环节排放
                </p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Leaf className="size-3.5 text-[#086de0]" />
                  净碳效益
                </div>
                <p className="mt-2 flex items-baseline gap-1">
                  <b className="text-xl tabular-nums text-[#086de0]">
                    {NET_TOTAL.toFixed(2)}
                  </b>
                  <span className="text-xs text-muted-foreground">tCO₂e</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  减碳贡献扣除自身排放
                </p>
              </div>
            </div>

            {/* 等效换算 */}
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#1bbf7a]/40 bg-[#f4fbf7] p-4">
              <div className="flex items-center gap-2 text-sm text-[#128a56]">
                <Sprout className="size-4" />
                <span className="font-medium">等效环境效益</span>
              </div>
              <div className="ml-auto flex gap-6 text-right">
                <div>
                  <p className="text-lg font-semibold tabular-nums text-[#128a56]">
                    {TREES.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">等效植树（棵）</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums text-[#128a56]">
                    {COAL}
                  </p>
                  <p className="text-[11px] text-muted-foreground">节约标煤（吨）</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右：碳账户趋势 */}
          <div className="rounded-xl border p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">碳账户月度趋势</p>
              <p className="text-xs text-muted-foreground">
                循环减碳 vs 碳排放（tCO₂e）
              </p>
            </div>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={carbonTrend} margin={{ left: 4, right: 8 }}>
                <defs>
                  <linearGradient id="wb-reduce" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="wb-emit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ORANGE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="reduce"
                  name="循环减碳"
                  stroke={BLUE}
                  strokeWidth={2.5}
                  fill="url(#wb-reduce)"
                />
                <Area
                  dataKey="emit"
                  name="碳排放"
                  stroke={ORANGE}
                  strokeWidth={2.5}
                  fill="url(#wb-emit)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </section>

      {/* 业务概览：四类业务 */}
      <section className="rounded-xl border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold">业务概览</h2>
          <p className="text-xs text-muted-foreground">
            资源处置 · 资源出租 · 资源采购 · 钢厂回收
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BUSINESSES.map((b) => {
            const Icon = b.icon
            return (
              <div
                key={b.key}
                className="flex flex-col gap-4 rounded-xl border p-5 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-lg',
                        b.tint,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span className="font-medium">{b.name}</span>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <Stat label="进行中" value={b.active} accent={BLUE} />
                  <Stat label="待履约" value={b.pending} accent={ORANGE} />
                  <Stat label="已完成" value={b.done} accent={GREEN} />
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>循环减碳贡献</span>
                    <span>物资 {b.tons.toFixed(1)} 吨</span>
                  </div>
                  <p className="mt-1 flex items-baseline gap-1">
                    <b
                      className="text-lg tabular-nums"
                      style={{ color: b.color }}
                    >
                      {b.reduce.toFixed(2)}
                    </b>
                    <span className="text-xs text-muted-foreground">tCO₂e</span>
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(b.reduce / REDUCE_TOTAL) * 100}%`,
                        background: b.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 待办 + 动态 */}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <ClipboardList className="size-4 text-[#ee7c30]" />
              待办事项
            </h2>
            <span className="rounded-full bg-[#fff1e6] px-2.5 py-0.5 text-xs font-medium text-[#ee7c30]">
              {todos.length} 项待处理
            </span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {todos.map((t) => {
              const Icon = t.icon
              return (
                <li
                  key={t.key}
                  className="flex items-center gap-3 rounded-lg border p-3.5 transition-colors hover:bg-muted/40"
                >
                  <div
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg',
                      t.tone,
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t.biz}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                      t.tone,
                    )}
                  >
                    {t.tag}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Bell className="size-4 text-[#086de0]" />
              最近动态
            </h2>
            <button
              type="button"
              className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              查看全部
            </button>
          </div>
          <ol className="relative flex flex-col gap-5 pl-1">
            {activities.map((a, i) => (
              <li key={a.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className="mt-1 size-2.5 shrink-0 rounded-full ring-4 ring-background"
                    style={{ background: a.color }}
                  />
                  {i < activities.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium leading-snug">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.desc}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {a.time}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

function OverviewCard({
  icon: Icon,
  tint,
  label,
  value,
  unit,
  hint,
}: {
  icon: typeof Leaf
  tint: string
  label: string
  value: string
  unit: string
  hint: string
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div
          className={cn('flex size-10 items-center justify-center rounded-lg', tint)}
        >
          <Icon className="size-5" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 flex items-baseline gap-1">
        <b className="text-2xl tabular-nums">{value}</b>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="rounded-lg bg-muted/50 py-2">
      <p className="text-base font-semibold tabular-nums" style={{ color: accent }}>
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}
