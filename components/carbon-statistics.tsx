'use client'
import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Leaf, MonitorPlay, Recycle, TrendingUp, Trophy, Boxes, Factory } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { CarbonDataScreen } from '@/components/carbon-data-screen'

const BLUE = '#086de0'
const ORANGE = '#ee7c30'
const GREEN = '#1bbf7a'
const TEAL = '#12a89d'

// 业务类型（保持不变）：资源处置/资源出租/资源采购/钢厂直收
const bizBar = [
  { name: '资源出租', reduce: 42.26, emit: 5.70 },
  { name: '资源采购', reduce: 13.92, emit: 7.40 },
  { name: '资源处置', reduce: 34.70, emit: 1.40 },
  { name: '钢厂直收', reduce: 28.40, emit: 3.80 },
]
const bizPie = [
  { name: '资源处置', value: 34.70, color: GREEN },
  { name: '资源出租', value: 42.26, color: BLUE },
  { name: '资源采购', value: 13.92, color: ORANGE },
  { name: '钢厂直收', value: 28.40, color: TEAL },
]
const monthly = [
  { m: '1月', reduce: 42.0, emit: 7.0 },
  { m: '2月', reduce: 40.0, emit: 8.0 },
  { m: '3月', reduce: 54.0, emit: 8.0 },
  { m: '4月', reduce: 61.2, emit: 10.4 },
  { m: '5月', reduce: 90.0, emit: 13.0 },
  { m: '6月', reduce: 73.0, emit: 11.0 },
]
const orgRank = [
  { name: '单位A', value: 268.4 }, { name: '单位B', value: 241.2 }, { name: '单位C', value: 226.6 },
  { name: '单位D', value: 213.1 }, { name: '单位E', value: 198.6 }, { name: '单位F', value: 187.4 },
  { name: '单位G', value: 175.9 }, { name: '单位H', value: 164.3 }, { name: '单位I', value: 152.7 },
  { name: '单位J', value: 141.4 },
]
const orgColor = (i: number) => (i === 0 ? BLUE : i === 1 ? GREEN : i === 2 ? ORANGE : TEAL)
const materialRank = [
  { name: '热轧型钢', value: 286.6 }, { name: '钢板桩', value: 254.2 }, { name: '盘扣式脚手架', value: 231.1 },
  { name: '钢管脚手架', value: 208.6 }, { name: '周转扣件', value: 187.4 }, { name: '贝雷片', value: 168.9 },
  { name: '钢模板', value: 152.7 }, { name: '周转木方', value: 134.3 }, { name: '二手周转箱', value: 118.4 },
  { name: '工字钢', value: 102.5 },
]
// 废钢等效替代的铁矿石（四大类，单位：吨）
const oreReplace = [
  { name: '磁铁矿', value: 268.4, color: BLUE },
  { name: '赤铁矿', value: 154.7, color: ORANGE },
  { name: '褐铁矿', value: 86.2, color: TEAL },
  { name: '菱铁矿', value: 42.5, color: GREEN },
]
const oreTotal = oreReplace.reduce((sum, item) => sum + item.value, 0)
const detail = [
  { name: '资源出租', color: BLUE, orders: 2, tons: 229.0, emit: 5.70, reduce: 42.26, net: 36.56 },
  { name: '资源采购', color: ORANGE, orders: 2, tons: 308.5, emit: 7.40, reduce: 13.92, net: 6.52 },
  { name: '资源处置', color: GREEN, orders: 2, tons: 91.0, emit: 1.40, reduce: 34.70, net: 33.30 },
  { name: '钢厂直收', color: TEAL, orders: 1, tons: 174.6, emit: 3.80, reduce: 28.40, net: 24.60 },
]
const total = detail.reduce(
  (acc, r) => ({ orders: acc.orders + r.orders, tons: acc.tons + r.tons, emit: acc.emit + r.emit, reduce: acc.reduce + r.reduce, net: acc.net + r.net }),
  { orders: 0, tons: 0, emit: 0, reduce: 0, net: 0 },
)

const config = {
  reduce: { label: '减碳量', color: BLUE },
  emit: { label: '碳排放', color: ORANGE },
} satisfies ChartConfig

export function CarbonStatistics() {
  const [screenOpen, setScreenOpen] = useState(false)
  const [year, setYear] = useState('2026')
  const years = ['2026', '2025', '近12个月']
  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">碳核算统计分析</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {years.map((y) => (
              <button key={y} type="button" onClick={() => setYear(y)} className={cn('h-9 rounded-lg border px-4 text-sm transition-colors', year === y ? 'border-[#086de0] bg-[#086de0] text-white' : 'bg-background text-muted-foreground hover:border-[#086de0]/50')}>{y}</button>
            ))}
          </div>
          <button type="button" onClick={() => setScreenOpen(true)} className="flex h-9 items-center gap-2 rounded-lg bg-[#1bbf7a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#17a86b]"><MonitorPlay className="size-4" />碳核算管理大屏</button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Leaf} tint="bg-[#e8f7ee] text-[#1bbf7a]" label="净减碳量" value="100.98" unit="tCO₂e" />
        <Kpi icon={Recycle} tint="bg-[#e7f1ff] text-[#086de0]" label="累计减碳量" value="119.28" unit="tCO₂e" />
        <Kpi icon={TrendingUp} tint="bg-[#fff1e6] text-[#ee7c30]" label="累计碳排放" value="18.30" unit="tCO₂e" />
        <Kpi icon={Boxes} tint="bg-[#eef3fb] text-[#4b6ea8]" label="核算物资总量" value="803.10" unit="吨" />
      </div>

      <Panel title="废钢替代铁矿石" subtitle="废钢等效替代原生铁矿石开采量（单位：吨）" icon={Factory}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,240px)_1fr]">
          <div className="flex flex-col justify-center rounded-lg bg-[#e7f1ff] p-5">
            <p className="text-sm text-[#086de0]/80">累计替代铁矿石</p>
            <p className="mt-2 flex items-baseline gap-1"><b className="text-3xl tabular-nums text-[#086de0]">{oreTotal.toFixed(1)}</b><span className="text-sm text-[#086de0]/70">吨</span></p>
            <p className="mt-2 text-xs text-muted-foreground">按废钢与各类铁矿石的等效折算系数汇总</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {oreReplace.map((ore) => (
              <div key={ore.name} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-medium"><span className="size-2.5 rounded-full" style={{ background: ore.color }} />{ore.name}</span>
                  <span className="text-sm font-semibold tabular-nums">{ore.value.toFixed(1)} 吨</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${(ore.value / oreTotal) * 100}%`, background: ore.color }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">占比 {((ore.value / oreTotal) * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Panel title="各业务类型碳排放与减碳量" subtitle="单位：tCO₂e">
          <ChartContainer config={config} className="h-72 w-full">
            <BarChart data={bizBar} barGap={6}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="emit" name="碳排放" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={38} />
              <Bar dataKey="reduce" name="减碳量" fill={BLUE} radius={[4, 4, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ChartContainer>
        </Panel>
        <Panel title="减碳量业务占比" subtitle="单位：tCO₂e">
          <ChartContainer config={config} className="h-72 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={bizPie} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
                {bizPie.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ChartContainer>
        </Panel>
      </div>

      <Panel title="月度减碳趋势" subtitle="累计减碳量与碳排放（tCO₂e）">
        <ChartContainer config={config} className="h-72 w-full">
          <AreaChart data={monthly} margin={{ left: 4, right: 8 }}>
            <defs>
              <linearGradient id="stat-reduce" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BLUE} stopOpacity={0.35} /><stop offset="95%" stopColor={BLUE} stopOpacity={0.02} /></linearGradient>
              <linearGradient id="stat-emit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={ORANGE} stopOpacity={0.3} /><stop offset="95%" stopColor={ORANGE} stopOpacity={0.02} /></linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="m" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Area dataKey="reduce" name="减碳量" stroke={BLUE} strokeWidth={2.5} fill="url(#stat-reduce)" />
            <Area dataKey="emit" name="碳排放" stroke={ORANGE} strokeWidth={2.5} fill="url(#stat-emit)" />
          </AreaChart>
        </ChartContainer>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="碳减排排名 · Top 10" subtitle="单位：tCO₂e">
          <ChartContainer config={config} className="h-[26rem] w-full">
            <BarChart data={orgRank} layout="vertical" margin={{ left: 12, right: 40 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 280]} ticks={[0, 70, 140, 210, 280]} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" width={64} tickLine={false} axisLine={false} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22} label={{ position: 'right', fontSize: 12, fill: 'var(--foreground)' }}>
                {orgRank.map((_, i) => <Cell key={i} fill={orgColor(i)} />)}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Panel>
        <Panel title="物资减碳量榜单" icon={Trophy}>
          <ol className="flex flex-col gap-3">
            {materialRank.map((item, i) => (
              <li key={item.name} className="flex items-center gap-3">
                <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold', i === 0 ? 'bg-[#1bbf7a] text-white' : i === 1 ? 'bg-[#086de0] text-white' : i === 2 ? 'bg-[#1bbf7a] text-white' : 'bg-muted text-muted-foreground')}>{i + 1}</span>
                <span className="w-24 shrink-0 truncate text-sm font-medium">{item.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[#086de0]" style={{ width: `${(item.value / materialRank[0].value) * 100}%` }} />
                </div>
                <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums">{item.value.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel title="业务类型核算明细">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead className="bg-[#f5f7fa] text-left text-muted-foreground"><tr>{['业务类型', '订单数(单)', '物资数量(吨)', '碳排放(tCO₂e)', '减碳量(tCO₂e)', '净减碳量(tCO₂e)'].map((h, i) => <th key={h} className={cn('px-4 py-3 font-medium', i === 0 ? 'text-left' : 'text-right')}>{h}</th>)}</tr></thead>
            <tbody>
              {detail.map((r) => (
                <tr key={r.name} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-2 font-medium"><span className="size-2.5 rounded-full" style={{ background: r.color }} />{r.name}</span></td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.orders}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.tons.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-[#ee7c30]">{r.emit.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-[#1bbf7a]">{r.reduce.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{r.net.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t bg-[#f5f7fa] font-semibold">
                <td className="px-4 py-3">合计</td>
                <td className="px-4 py-3 text-right tabular-nums">{total.orders}</td>
                <td className="px-4 py-3 text-right tabular-nums">{total.tons.toFixed(2)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[#ee7c30]">{total.emit.toFixed(2)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[#1bbf7a]">{total.reduce.toFixed(2)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{total.net.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      {screenOpen && <div className="fixed inset-0 z-50 overflow-y-auto"><CarbonDataScreen onClose={() => setScreenOpen(false)} /></div>}
    </div>
  )
}

function cn(...cls: (string | false | undefined)[]) { return cls.filter(Boolean).join(' ') }

function Kpi({ icon: Icon, tint, label, value, unit }: { icon: typeof Leaf; tint: string; label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
      <div className={cn('flex size-11 items-center justify-center rounded-lg', tint)}><Icon className="size-5" /></div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 flex items-baseline gap-1"><b className="text-2xl tabular-nums">{value}</b><span className="text-xs text-muted-foreground">{unit}</span></p>
      </div>
    </div>
  )
}

function Panel({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon?: typeof Leaf; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-base font-semibold">{Icon && <Icon className="size-4 text-[#f2b705]" />}{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}
