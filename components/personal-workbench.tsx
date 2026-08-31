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

// 减碳贡献角色：
// - owner   碳减排归属主体：减碳确权计入本企业碳账户（如采购方、钢厂回收方）
// - partaker 参与方：促成交易对方减碳，碳凭证归属对方，本企业仅体现减碳贡献（如出租方、转让方）
type ReduceRole = 'owner' | 'partaker'

// 四类业务概览：资源处置 / 资源出租 / 资源采购 / 钢厂回收
const BUSINESSES: Array<{
  key: string
  name: string
  icon: typeof PackageOpen
  color: string
  tint: string
  active: number
  pending: number
  done: number
  tons: number
  reduce: number
  turnover: number
  role: ReduceRole
  roleLabel: string
}> = [
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
    turnover: 5,
    role: 'partaker',
    roleLabel: '转让方',
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
    turnover: 8,
    role: 'partaker',
    roleLabel: '出租方',
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
    turnover: 6,
    role: 'owner',
    roleLabel: '采购方',
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
    turnover: 4,
    role: 'owner',
    roleLabel: '回收方',
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
  reduce: { label: '循环减碳', color: GREEN },
  emit: { label: '碳排放', color: ORANGE },
} satisfies ChartConfig

// 碳账户汇总
const REDUCE_TOTAL = 119.28
const EMIT_TOTAL = 18.3
const NET_TOTAL = REDUCE_TOTAL - EMIT_TOTAL // 净碳效益
const CARBON_CREDIT = 1013 // 碳积分余额
const TREES = Math.round((NET_TOTAL * 1000) / 18.3) // 等效植树（按每棵年固碳约18.3kg）
const COAL = (NET_TOTAL * 0.4).toFixed(1) // 等效节约标煤（吨）
// 减碳率：减碳贡献相对总活动碳基准（减碳 + 排放）的比例
const REDUCE_RATE = ((REDUCE_TOTAL / (REDUCE_TOTAL + EMIT_TOTAL)) * 100).toFixed(1)

// 两类减碳：归属主体减碳（确权入账） / 参与方减碳贡献（促成对方）
const OWNED_REDUCE = BUSINESSES.filter((b) => b.role === 'owner').reduce(
  (s, b) => s + b.reduce,
  0,
)
const PARTAKER_REDUCE = BUSINESSES.filter((b) => b.role === 'partaker').reduce(
  (s, b) => s + b.reduce,
  0,
)

// 企业碳排放来源构成（tCO₂e，合计 = EMIT_TOTAL）
const EMISSION_SOURCES = [
  { key: 'process', name: '废钢改制加工', value: 8.6, color: ORANGE },
  { key: 'transport', name: '运输物流', value: 4.2, color: BLUE },
  { key: 'energy', name: '能源消耗', value: 5.5, color: TEAL },
]

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

        {/* 三大核心账户数值：减碳贡献 / 碳排放 / 净碳效益 */}
        <div className="grid gap-4 sm:grid-cols-3">
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
              含归属主体减碳 {OWNED_REDUCE.toFixed(2)} + 参与方贡献{' '}
              {PARTAKER_REDUCE.toFixed(2)} tCO₂e
            </p>
          </div>
          <div className="rounded-xl bg-[#fff1e6] p-5">
            <div className="flex items-center gap-2 text-sm text-[#ee7c30]">
              <TrendingUp className="size-4" />
              企业碳排放（累计）
            </div>
            <p className="mt-2 flex items-baseline gap-1.5">
              <b className="text-3xl tabular-nums text-[#c85f1e]">
                {EMIT_TOTAL.toFixed(2)}
              </b>
              <span className="text-sm text-[#ee7c30]">tCO₂e</span>
            </p>
            <p className="mt-1.5 text-xs text-[#ee7c30]/80">
              改制加工 / 运输 / 能源等环节自身排放
            </p>
          </div>
          <div className="rounded-xl bg-[#e7f1ff] p-5">
            <div className="flex items-center gap-2 text-sm text-[#086de0]">
              <Leaf className="size-4" />
              净碳效益
            </div>
            <p className="mt-2 flex items-baseline gap-1.5">
              <b className="text-3xl tabular-nums text-[#0a58b0]">
                {NET_TOTAL.toFixed(2)}
              </b>
              <span className="text-sm text-[#086de0]">tCO₂e</span>
            </p>
            <p className="mt-1.5 text-xs text-[#086de0]/80">
              减碳贡献扣除自身排放，减碳率 {REDUCE_RATE}%
            </p>
          </div>
        </div>

        {/* 减碳贡献分类：归属主体减碳 / 参与方减碳贡献 */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#1bbf7a]/35 bg-[#f4fbf7] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-[#128a56]">
                <Leaf className="size-4" />
                归属主体减碳（确权入账）
              </div>
              <span className="rounded-full bg-[#e8f7ee] px-2.5 py-0.5 text-[11px] font-medium text-[#1bbf7a]">
                计入本企业碳账户
              </span>
            </div>
            <p className="mt-2 flex items-baseline gap-1.5">
              <b className="text-2xl tabular-nums text-[#128a56]">
                {OWNED_REDUCE.toFixed(2)}
              </b>
              <span className="text-xs text-[#1bbf7a]">
                tCO₂e · ���比 {((OWNED_REDUCE / REDUCE_TOTAL) * 100).toFixed(1)}%
              </span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              本企业作为采购方 / 钢厂回收方，减碳量确权归属并计入自身碳资产
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {BUSINESSES.filter((b) => b.role === 'owner').map((b) => (
                <span
                  key={b.key}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] text-muted-foreground"
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: b.color }}
                  />
                  {b.name}（{b.roleLabel}）{b.reduce.toFixed(2)}t
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#086de0]/30 bg-[#eff5ff] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0a58b0]">
                <Recycle className="size-4" />
                参与方减碳贡献（促成对方）
              </div>
              <span className="rounded-full bg-[#e0ecff] px-2.5 py-0.5 text-[11px] font-medium text-[#086de0]">
                碳凭证归属交易对方
              </span>
            </div>
            <p className="mt-2 flex items-baseline gap-1.5">
              <b className="text-2xl tabular-nums text-[#0a58b0]">
                {PARTAKER_REDUCE.toFixed(2)}
              </b>
              <span className="text-xs text-[#086de0]">
                tCO₂e · 占比 {((PARTAKER_REDUCE / REDUCE_TOTAL) * 100).toFixed(1)}%
              </span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              本企业作为出租方 / 转让方，促成承租方 / 受让方减碳，仅体现贡献
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {BUSINESSES.filter((b) => b.role === 'partaker').map((b) => (
                <span
                  key={b.key}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] text-muted-foreground"
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: b.color }}
                  />
                  {b.name}（{b.roleLabel}）{b.reduce.toFixed(2)}t
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 碳台账对比条：减碳贡献 vs 企业碳排放 */}
        <div className="mt-4 rounded-xl border p-5">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-[#128a56]">
              <span className="size-2.5 rounded-full bg-[#1bbf7a]" />
              循环减碳贡献 {REDUCE_TOTAL.toFixed(2)} tCO₂e
            </span>
            <span className="flex items-center gap-1.5 text-[#ee7c30]">
              <span className="size-2.5 rounded-full bg-[#ee7c30]" />
              企业碳排放 {EMIT_TOTAL.toFixed(2)} tCO₂e
            </span>
          </div>
          <div className="flex h-4 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-[#1bbf7a]"
              style={{ width: `${REDUCE_RATE}%` }}
            />
            <div className="h-full flex-1 bg-[#ee7c30]" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            每产生 1 吨自身碳排放，即为社会创造约{' '}
            <b className="text-[#128a56]">
              {(REDUCE_TOTAL / EMIT_TOTAL).toFixed(1)}
            </b>{' '}
            吨循环减碳效益
          </p>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_1.3fr]">
          {/* 左：减碳贡献构成 + 碳排放构成 */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">减碳贡献构成（按业务）</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-[#1bbf7a]" />
                    归属主体
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full border border-[#086de0]" />
                    参与方
                  </span>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {BUSINESSES.map((b) => (
                  <li key={b.key} className="flex items-center gap-3">
                    <span className="flex w-24 shrink-0 flex-col text-xs text-muted-foreground">
                      {b.name}
                      <span
                        className={cn(
                          'mt-0.5 inline-flex w-fit items-center rounded px-1 text-[10px]',
                          b.role === 'owner'
                            ? 'bg-[#e8f7ee] text-[#1bbf7a]'
                            : 'bg-[#eff5ff] text-[#086de0]',
                        )}
                      >
                        {b.role === 'owner' ? '归属主体' : '参与方'}·{b.roleLabel}
                      </span>
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          b.role === 'partaker' && 'opacity-55',
                        )}
                        style={{
                          width: `${(b.reduce / REDUCE_TOTAL) * 100}%`,
                          background: b.color,
                        }}
                      />
                    </div>
                    <span
                      className="w-20 shrink-0 text-right text-xs font-medium tabular-nums"
                      style={{ color: b.color }}
                    >
                      {b.reduce.toFixed(2)} t
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border p-5">
              <p className="mb-3 text-sm font-medium">碳排放来源构成</p>
              <div className="mb-3 flex h-3 overflow-hidden rounded-full">
                {EMISSION_SOURCES.map((s) => (
                  <div
                    key={s.key}
                    className="h-full"
                    style={{
                      width: `${(s.value / EMIT_TOTAL) * 100}%`,
                      background: s.color,
                    }}
                  />
                ))}
              </div>
              <ul className="grid grid-cols-3 gap-2">
                {EMISSION_SOURCES.map((s) => (
                  <li key={s.key}>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: s.color }}
                      />
                      {s.name}
                    </span>
                    <p className="mt-0.5 text-sm font-medium tabular-nums">
                      {s.value.toFixed(1)}
                      <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
                        t
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
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
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <AreaChart data={carbonTrend} margin={{ left: 4, right: 8 }}>
                <defs>
                  <linearGradient id="wb-reduce" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0.02} />
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
                  stroke={GREEN}
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
                    <span>{(b.key === 'rental' || b.key === 'procurement') ? `周转 ${b.turnover} 次` : `物资 ${b.tons.toFixed(1)} 吨`}</span>
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
