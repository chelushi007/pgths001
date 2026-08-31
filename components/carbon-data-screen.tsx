'use client'
import { useEffect, useRef, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Boxes, Factory, Leaf, Maximize2, Minimize2, Recycle, TrendingUp, X } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const BLUE = '#3b9bff'
const ORANGE = '#ff9d4d'
const GREEN = '#2fd699'
const TEAL = '#22c1c9'

const monthly = [
  { m: '1月', reduce: 42.0, emit: 7.0 }, { m: '2月', reduce: 40.0, emit: 8.0 }, { m: '3月', reduce: 54.0, emit: 8.0 },
  { m: '4月', reduce: 61.2, emit: 10.4 }, { m: '5月', reduce: 90.0, emit: 13.0 }, { m: '6月', reduce: 73.0, emit: 11.0 },
]
// 业务类型（保持不变）：资源处置/资源出租/资源采购/钢厂回收
const bizPie = [
  { n: '资源出租', v: 42.26, color: BLUE }, { n: '资源采购', v: 13.92, color: ORANGE },
  { n: '资源处置', v: 34.70, color: GREEN }, { n: '钢厂回收', v: 28.40, color: TEAL },
]
// 两类碳减排贡献：归属主体（采购方13.92 + 回收方28.40）/ 参与方（出租方42.26 + 转让方34.70）
const OWNED_REDUCE = 13.92 + 28.40
const PARTAKER_REDUCE = 42.26 + 34.70
const REDUCE_TOTAL = OWNED_REDUCE + PARTAKER_REDUCE
const contribSplit = [
  { key: 'owner', label: '归属主体减碳', sub: '采购方 / 回收方 · 确权入账', value: OWNED_REDUCE, color: GREEN },
  { key: 'partaker', label: '参与方减碳贡献', sub: '出租方 / 转让方 · 归属对方', value: PARTAKER_REDUCE, color: BLUE },
]
const orgRank = [
  { n: '单位A', v: 268.4 }, { n: '单位B', v: 241.2 }, { n: '单位C', v: 226.6 },
  { n: '单位D', v: 213.1 }, { n: '单位E', v: 198.6 }, { n: '单位F', v: 187.4 }, { n: '单位G', v: 175.9 },
]
const materialRank = [
  { n: '热轧型钢', v: 286.6 }, { n: '钢板桩', v: 254.2 }, { n: '盘扣式脚手架', v: 231.1 },
  { n: '钢管脚手架', v: 208.6 }, { n: '周转扣件', v: 187.4 }, { n: '贝雷片', v: 168.9 },
]
// 废钢等效替代的铁矿石（四大类，单位：吨）
const oreReplace = [
  { n: '磁铁矿', v: 268.4, color: BLUE }, { n: '赤铁矿', v: 154.7, color: ORANGE },
  { n: '褐铁矿', v: 86.2, color: TEAL }, { n: '菱铁矿', v: 42.5, color: GREEN },
]
const oreTotal = oreReplace.reduce((sum, item) => sum + item.v, 0)
const feed = [
  ['16:26', '钢厂回收', '废钢 128.6t', '+229.18'],
  ['16:10', '资源处置', '边角料 42.8t', '+75.62'],
  ['15:46', '资源出租', '钢模板 18.5t', '+21.67'],
  ['15:32', '钢厂回收', '废钢 206.4t', '+367.81'],
]
const config = { reduce: { label: '减碳量', color: BLUE }, emit: { label: '碳排放', color: ORANGE } } satisfies ChartConfig

export function CarbonDataScreen({ onClose }: { onClose?: () => void }) {
  const screenRef = useRef<HTMLElement>(null)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === screenRef.current)
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await screenRef.current?.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      // Preview iframe 和未获授权的浏览器环境会拒绝全屏请求，避免产生未处理的 Promise 错误。
      console.warn('[v0] 全屏展示不可用:', error)
      setFullscreen(document.fullscreenElement === screenRef.current)
    }
  }
  return (
    <main ref={screenRef} className="min-h-screen overflow-y-auto bg-[#0b1a2e] p-4 font-sans text-white lg:p-6">
      <header className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#1bbf7a] text-white"><Leaf className="size-5" /></div>
          <div>
            <h1 className="text-xl font-semibold tracking-wide">碳核算管理大屏</h1>
            <p className="mt-1 text-xs text-white/50">CARBON ACCOUNTING COMMAND CENTER · 数据更新 2026-08-20 16:30</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleFullscreen} className="flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10">{fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}{fullscreen ? '退出全屏' : '全屏展示'}</button>
          {onClose && <button type="button" onClick={onClose} className="flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"><X className="size-4" />关闭大屏</button>}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ScreenKpi icon={Leaf} tint="text-[#2fd699]" label="碳减排量" value="119.28" unit="tCO₂e" />
        <ScreenKpi icon={TrendingUp} tint="text-[#ff9d4d]" label="累计碳排放（参考）" value="18.30" unit="tCO₂e" />
        <ScreenKpi icon={Boxes} tint="text-[#22c1c9]" label="核算物资总量" value="803.10" unit="吨" />
        <ScreenKpi icon={Recycle} tint="text-[#3b9bff]" label="核算订单数" value="7" unit="单" />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="月度减碳趋势">
          <ChartContainer config={config} className="h-72 w-full [&_.recharts-cartesian-axis-tick_text]:fill-white/60">
            <AreaChart data={monthly} margin={{ left: 4, right: 8 }}>
              <defs>
                <linearGradient id="scr-reduce" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BLUE} stopOpacity={0.5} /><stop offset="95%" stopColor={BLUE} stopOpacity={0.03} /></linearGradient>
                <linearGradient id="scr-emit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={ORANGE} stopOpacity={0.4} /><stop offset="95%" stopColor={ORANGE} stopOpacity={0.03} /></linearGradient>
              </defs>
              <CartesianGrid stroke="#ffffff" opacity={0.08} vertical={false} />
              <XAxis dataKey="m" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area dataKey="reduce" name="减碳量" stroke={BLUE} strokeWidth={2.5} fill="url(#scr-reduce)" />
              <Area dataKey="emit" name="碳排放" stroke={ORANGE} strokeWidth={2.5} fill="url(#scr-emit)" />
            </AreaChart>
          </ChartContainer>
        </Panel>
        <Panel title="减碳量业务占比">
          <ChartContainer config={config} className="h-48 w-full">
            <PieChart>
              <Pie data={bizPie} dataKey="v" nameKey="n" innerRadius={44} outerRadius={70} paddingAngle={2}>{bizPie.map((item) => <Cell key={item.n} fill={item.color} stroke="#0b1a2e" />)}</Pie>
              <ChartTooltip content={<ChartTooltipContent nameKey="n" />} />
            </PieChart>
          </ChartContainer>
          <div className="grid grid-cols-2 gap-2">
            {bizPie.map((item) => (
              <div key={item.n} className="flex min-w-0 items-center gap-2 rounded-md border border-white/10 bg-white/[.04] px-2 py-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
                <div className="min-w-0"><p className="truncate text-xs text-white/60">{item.n}</p><p className="text-sm font-semibold tabular-nums">{item.v.toFixed(2)} <span className="text-[10px] font-normal text-white/50">tCO₂e</span></p></div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="实时核算动态">
          <div className="flex flex-col gap-3">
            {feed.map((x) => (
              <div key={x[0]} className="border-b border-white/10 pb-3 last:border-0">
                <div className="flex justify-between text-xs text-white/50"><span>{x[0]} · {x[1]}</span><span className="font-semibold text-[#2fd699]">{x[3]} tCO₂e</span></div>
                <p className="mt-1 text-sm text-white/80">{x[2]}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-4">
        <Panel title="碳减排贡献分类">
          <div className="grid gap-4 sm:grid-cols-2">
            {contribSplit.map((c) => (
              <div key={c.key} className="rounded-lg border border-white/10 bg-white/[.04] p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: c.color }}><span className="size-2.5 rounded-full" style={{ background: c.color }} />{c.label}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/60">{c.key === 'owner' ? '计入本方碳账户' : '碳凭证归属对方'}</span>
                </div>
                <p className="mt-2 flex items-baseline gap-1.5"><b className="text-2xl font-semibold tabular-nums" style={{ color: c.color }}>{c.value.toFixed(2)}</b><span className="text-xs text-white/55">tCO₂e · 占比 {((c.value / REDUCE_TOTAL) * 100).toFixed(1)}%</span></p>
                <p className="mt-1 text-xs text-white/45">{c.sub}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${(c.value / REDUCE_TOTAL) * 100}%`, background: c.color }} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-4">
        <Panel title="废钢替代铁矿石">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_1fr]">
            <div className="flex flex-col justify-center rounded-lg border border-white/10 bg-white/[.04] p-4">
              <p className="inline-flex items-center gap-2 text-xs text-white/55"><Factory className="size-4 text-[#2fd699]" />累计替代铁矿石</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[#2fd699]">{oreTotal.toFixed(1)} <span className="text-sm font-normal text-white/55">吨</span></p>
              <p className="mt-1 text-xs text-white/45">废钢等效替代原生铁矿石开采量</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {oreReplace.map((ore) => (
                <div key={ore.n} className="rounded-lg border border-white/10 bg-white/[.04] p-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs text-white/70"><span className="size-2 rounded-full" style={{ background: ore.color }} />{ore.n}</span>
                    <span className="text-xs text-white/45">{((ore.v / oreTotal) * 100).toFixed(0)}%</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold tabular-nums">{ore.v.toFixed(1)} <span className="text-[10px] font-normal text-white/50">吨</span></p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${(ore.v / oreTotal) * 100}%`, background: ore.color }} /></div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="碳减排排名">
          <ChartContainer config={config} className="h-72 w-full [&_.recharts-cartesian-axis-tick_text]:fill-white/60">
            <BarChart data={orgRank} layout="vertical" margin={{ left: 12, right: 36 }}>
              <CartesianGrid stroke="#ffffff" opacity={0.08} horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="n" type="category" width={64} tickLine={false} axisLine={false} />
              <Bar dataKey="v" radius={[0, 4, 4, 0]} maxBarSize={20} label={{ position: 'right', fontSize: 12, fill: '#ffffff' }}>
                {orgRank.map((_, i) => <Cell key={i} fill={i === 0 ? BLUE : i === 1 ? GREEN : i === 2 ? ORANGE : TEAL} />)}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Panel>
        <Panel title="物资减碳量榜单">
          <ol className="flex flex-col gap-3">
            {materialRank.map((item, i) => (
              <li key={item.n} className="flex items-center gap-3">
                <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold', i === 0 ? 'bg-[#2fd699] text-[#0b1a2e]' : i === 1 ? 'bg-[#3b9bff] text-[#0b1a2e]' : i === 2 ? 'bg-[#2fd699] text-[#0b1a2e]' : 'bg-white/10 text-white/70')}>{i + 1}</span>
                <span className="w-24 shrink-0 truncate text-sm">{item.n}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#3b9bff]" style={{ width: `${(item.v / materialRank[0].v) * 100}%` }} /></div>
                <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums">{item.v.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </section>
    </main>
  )
}

function cn(...cls: (string | false | undefined)[]) { return cls.filter(Boolean).join(' ') }

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[.05] p-4 shadow-xl">
      <h2 className="mb-4 border-l-2 border-[#1bbf7a] pl-3 text-sm font-medium tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function ScreenKpi({ icon: Icon, tint, label, value, unit }: { icon: typeof Leaf; tint: string; label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[.05] p-5">
      <div className={cn('flex size-11 items-center justify-center rounded-lg bg-white/10', tint)}><Icon className="size-5" /></div>
      <div><p className="text-xs text-white/55">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value} <span className="text-xs font-normal text-white/55">{unit}</span></p></div>
    </div>
  )
}
