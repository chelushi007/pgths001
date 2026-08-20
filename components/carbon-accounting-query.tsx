'use client'
import { useMemo, useState } from 'react'
import { Boxes, Download, Recycle, RotateCcw, Search, ShieldCheck, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CarbonCertificate } from '@/components/carbon-certificate'

const BLUE = '#086de0'
type Biz = '资源处置' | '资源出租' | '资源采购' | '钢厂直收'
type Record = {
  id: string
  biz: Biz
  project: string
  resource: string
  unit: string
  weight: number
  distance: number
  emission: number
  reduction: number
  net: number
  cert: string
  date: string
  status: '已核算' | '待复核'
}

const records: Record[] = [
  { id: 'CZDD20260520002', biz: '资源处置', project: '报废工装及边角料处置', resource: '废钢', unit: '中铁十一局一公司', weight: 86.4, distance: 68, emission: 2.12, reduction: 13.86, net: 11.74, cert: 'TC-CZ-20260522-0007', date: '2026-05-22 16:05', status: '已核算' },
  { id: 'ZLDD20260518007', biz: '资源出租', project: '工程钢模板循环租赁', resource: '钢模板', unit: '中铁十一局三公司', weight: 142.6, distance: 36, emission: 3.58, reduction: 28.4, net: 24.82, cert: 'TC-ZL-20260519-0012', date: '2026-05-19 10:20', status: '已核算' },
  { id: 'CGDD20260512021', biz: '资源采购', project: '生产辅材集中采购', resource: '热轧钢板', unit: '中铁十五局一公司', weight: 98.5, distance: 120, emission: 2.36, reduction: 4.32, net: 1.96, cert: 'TC-CG-20260514-0003', date: '2026-05-14 11:40', status: '已核算' },
  { id: 'GCDD20260510015', biz: '钢厂直收', project: '珠江钢厂废钢协议回收', resource: '废钢', unit: '中铁二十局四公司', weight: 56.2, distance: 240, emission: 0.88, reduction: 21.5, net: 20.62, cert: 'TC-GC-20260511-0009', date: '2026-05-11 09:15', status: '已核算' },
]

const types: Biz[] = ['资源处置', '资源出租', '资源采购', '钢厂直收']
const bizStyle: { [K in Biz]: string } = {
  资源处置: 'bg-[#e8f7ee] text-emerald-600',
  资源出租: 'bg-[#e7f1ff] text-[#086de0]',
  资源采购: 'bg-[#f3ecff] text-violet-600',
  钢厂直收: 'bg-[#fff1e6] text-orange-600',
}
const shortBiz: { [K in Biz]: string } = { 资源处置: '处置', 资源出租: '租赁', 资源采购: '采购', 钢厂直收: '直收' }

function Stat({ icon: Icon, tint, label, value, unit }: { icon: typeof Boxes; tint: string; label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
      <div className="flex size-12 items-center justify-center rounded-xl" style={{ backgroundColor: tint }}>
        <Icon className="size-6" style={{ color: BLUE }} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value} <span className="text-sm font-normal text-muted-foreground">{unit}</span></p>
      </div>
    </div>
  )
}

export function CarbonAccountingQuery() {
  const [biz, setBiz] = useState<Biz | '全部'>('全部')
  const [q, setQ] = useState('')
  const [unit, setUnit] = useState('股份总公司')
  const [filters, setFilters] = useState({ biz: '全部' as Biz | '全部', q: '' })
  const [detail, setDetail] = useState<Record | null>(null)
  const [certificate, setCertificate] = useState<Record | null>(null)

  const visible = useMemo(
    () => records.filter((r) => (filters.biz === '全部' || r.biz === filters.biz) && (r.project + r.resource + r.id).includes(filters.q)),
    [filters],
  )
  const totalEmission = records.reduce((a, b) => a + b.emission, 0)
  const totalReduction = records.reduce((a, b) => a + b.reduction, 0)

  const runQuery = () => setFilters({ biz, q })
  const reset = () => { setBiz('全部'); setQ(''); setUnit('股份总公司'); setFilters({ biz: '全部', q: '' }) }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Boxes} tint="#e7f1ff" label="碳核算订单" value={String(records.length)} unit="单" />
        <Stat icon={TrendingUp} tint="#fff1e6" label="累计碳排放" value={totalEmission.toFixed(2)} unit="tCO₂e" />
        <Stat icon={Recycle} tint="#e8f7ee" label="累计减碳量" value={totalReduction.toFixed(2)} unit="tCO₂e" />
        <Stat icon={ShieldCheck} tint="#e8f7ee" label="已出具凭证" value={String(records.filter((r) => r.status === '已核算').length)} unit="份" />
      </div>

      <div className="flex items-center gap-8 border-b">
        {(['全部', ...types] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setBiz(t); setFilters({ biz: t, q }) }}
            className={cn('relative -mb-px border-b-2 pb-3 pt-1 text-sm font-medium transition-colors', biz === t ? 'border-[#086de0] text-[#086de0]' : 'border-transparent text-muted-foreground hover:text-foreground')}
          >
            {t === '全部' ? '全部' : `${shortBiz[t]}订单`}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-4 px-1 py-1">
          <label className="flex items-center gap-2 text-sm font-medium"><span className="whitespace-nowrap">订单编号</span>
            <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) runQuery() }} className="h-10 w-64" placeholder="请输入订单编号" />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium"><span className="whitespace-nowrap">归集单位</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="h-10 w-64 rounded-lg border bg-background px-3 text-muted-foreground outline-none focus:border-[#086de0]">
              <option>股份总公司</option><option>中铁十一局一公司</option><option>中铁十一局三公司</option><option>中铁十五局一公司</option><option>中铁二十局四公司</option>
            </select>
          </label>
          <div className="ml-auto flex gap-3">
            <Button className="h-10 bg-[#086de0] px-5 hover:bg-[#075fc5]" onClick={runQuery}><Search data-icon="inline-start" />查询</Button>
            <Button variant="outline" className="h-10 px-5" onClick={reset}><RotateCcw data-icon="inline-start" />重置</Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4">
        <div className="mb-4 flex gap-3">
          <Button variant="outline" className="h-10 px-5"><Download data-icon="inline-start" />导出</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] whitespace-nowrap text-sm">
            <thead className="bg-[#edf3fa] text-left">
              <tr>{['序号', '订单编号', '业务类型', '归集单位', '物资数量(吨)', '碳排放(tCO₂e)', '减碳量(tCO₂e)', '碳凭证编号', '核算时间', '操作'].map((x) => <th key={x} className="whitespace-nowrap px-3 py-3 font-semibold">{x}</th>)}</tr>
            </thead>
            <tbody>
              {visible.map((r, index) => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-4">{index + 1}</td>
                  <td className="px-3 py-4"><button onClick={() => setDetail(r)} className="font-medium hover:underline" style={{ color: BLUE }}>{r.id}</button></td>
                  <td className="px-3 py-4"><span className={cn('rounded px-2 py-1 text-xs font-medium', bizStyle[r.biz])}>{shortBiz[r.biz]}</span></td>
                  <td className="px-3 py-4 text-muted-foreground">{r.unit}</td>
                  <td className="px-3 py-4 text-right tabular-nums">{r.weight.toFixed(2)}</td>
                  <td className="px-3 py-4 text-right font-medium tabular-nums text-orange-600">{r.emission.toFixed(2)}</td>
                  <td className="px-3 py-4 text-right font-medium tabular-nums text-emerald-600">{r.reduction.toFixed(2)}</td>
                  <td className="px-3 py-4 font-mono text-xs text-muted-foreground">{r.cert}</td>
                  <td className="px-3 py-4 text-muted-foreground">{r.date}</td>
                  <td className="px-3 py-4">
                    <button onClick={() => setCertificate(r)} className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:underline"><ShieldCheck className="size-4" />碳凭证</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>核算结果追溯</DialogTitle>
            <DialogDescription>{detail?.id} · {detail?.project}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Trace label="资源活动数据" value={`${detail.weight} t × 对应资源因子`} />
                <Trace label="运输活动数据" value={`${detail.weight} t × ${detail.distance} km × 运输因子`} />
                <Trace label="净减排结果" value={`${detail.net.toFixed(2)} tCO₂e`} />
              </div>
              <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-6">
                <b>核算边界：</b>资源回收、再利用或循环使用相对原生材料生产的替代效益，扣除履约中陆运与水运产生的运输排放。<br />
                <b>数据来源：</b>履约确认重量、物流运输距离、碳因子库有效版本。<br />
                <b>质量控制：</b>因子版本冻结、活动数据留痕、公式与结果支持复核。
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CarbonCertificate
        open={certificate !== null}
        project={certificate ? { code: certificate.id, title: certificate.project } : null}
        mode={certificate?.biz === '资源出租' ? 'rental' : certificate?.biz === '资源处置' ? 'disposal' : 'procurement'}
        onClose={() => setCertificate(null)}
      />
    </div>
  )
}

function Trace({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  )
}
