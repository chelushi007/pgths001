'use client'

import { useMemo, useState } from 'react'
import {
  Calculator,
  Download,
  Factory,
  Flame,
  Info,
  Package,
  Pencil,
  Plus,
  Power,
  Recycle,
  RotateCcw,
  Search,
  Ship,
  Truck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type Factor = {
  id: string
  type: '资源因子' | '运输因子' | '排放因子'
  category: string
  name: string
  model: string
  measureUnit?: string
  unitWeight?: number
  energy?: string
  // 排放因子：活动水平计量单位（如 kWh / kg / m³ / GJ）与适用范围
  activityUnit?: string
  scope?: string
  value: number
  unit: string
  source: string
  date: string
  active: boolean
  conversionEnabled?: boolean
  conversionTarget?: '磁铁矿' | '赤铁矿' | '褐铁矿' | '菱铁矿'
  scrapBasis?: number
  oreEquivalent?: number
}

const initial: Factor[] = [
  { id: 'RF-001', type: '资源因子', category: '脚手架类', name: '钢管脚手架', model: 'Φ48×3.5mm', measureUnit: '根', unitWeight: 0.0355, value: 2340, unit: 'kgCO₂e/吨', source: 'GB/T 51366 / 钢材', date: '2026-05-10', active: true },
  { id: 'RF-002', type: '资源因子', category: '脚手架类', name: '盘扣式立杆', model: 'Q355 / Φ60×3.2mm', measureUnit: '根', unitWeight: 0.0182, value: 2310, unit: 'kgCO₂e/吨', source: 'GB/T 51366 / 钢材', date: '2026-05-10', active: true },
  { id: 'RF-003', type: '资源因子', category: '支护类', name: '钢支撑', model: 'Φ609×16mm', measureUnit: '米', unitWeight: 0.234, value: 2360, unit: 'kgCO₂e/吨', source: 'GB/T 51366 / 钢材', date: '2026-05-08', active: true },
  { id: 'RF-004', type: '资源因子', category: '模板类', name: '钢模板', model: 'Q235 / 1.5×3.0m', measureUnit: '块', unitWeight: 0.086, value: 2350, unit: 'kgCO₂e/吨', source: 'GB/T 51366 / 钢材', date: '2026-05-08', active: true, conversionEnabled: true, conversionTarget: '磁铁矿', scrapBasis: 100, oreEquivalent: 80 },
  { id: 'RF-005', type: '资源因子', category: '轨道类', name: '钢轨', model: '60kg/m', measureUnit: '米', unitWeight: 0.06, value: 2280, unit: 'kgCO₂e/吨', source: 'GB/T 51366 / 钢材', date: '2026-05-06', active: false },
  { id: 'TF-001', type: '运输因子', category: '陆运', name: '重型柴油货车（≥18t）', model: '柴油', energy: '柴油', value: 0.0962, unit: 'kgCO₂e/(吨·公里)', source: '省级交通碳因子库', date: '2026-05-10', active: true },
  { id: 'TF-002', type: '运输因子', category: '陆运', name: '中型柴油货车（8-18t）', model: '柴油', energy: '柴油', value: 0.1286, unit: 'kgCO₂e/(吨·公里)', source: '省级交通碳因子库', date: '2026-05-10', active: true },
  { id: 'TF-003', type: '运输因子', category: '陆运', name: '新能源电动重卡', model: '电力', energy: '电力', value: 0.0418, unit: 'kgCO₂e/(吨·公里)', source: '省级交通碳因子库', date: '2026-05-09', active: true },
  { id: 'TF-004', type: '运输因子', category: '水运', name: '内河货船（1000t级）', model: '燃油', energy: '燃油', value: 0.0285, unit: 'kgCO₂e/(吨·公里)', source: '水运碳排放因子库', date: '2026-05-07', active: true },
  { id: 'TF-005', type: '运输因子', category: '水运', name: '沿海散货船（5000t级）', model: '燃油', energy: '燃油', value: 0.0156, unit: 'kgCO₂e/(吨·公里)', source: '水运碳排放因子库', date: '2026-05-07', active: true },
  { id: 'EF-001', type: '排放因子', category: '废钢改制加工', name: '废钢破碎分选', model: '破碎机组', energy: '电力', activityUnit: 't废钢', scope: '改制预处理（范围二）', value: 18.6, unit: 'kgCO₂e/t废钢', source: '再生钢铁原料加工核算', date: '2026-05-12', active: true },
  { id: 'EF-002', type: '排放因子', category: '废钢改制加工', name: '废钢剪切打包', model: '龙门剪 / 打包机', energy: '电力', activityUnit: 't废钢', scope: '改制预处理（范围二）', value: 12.4, unit: 'kgCO₂e/t废钢', source: '再生钢铁原料加工核算', date: '2026-05-12', active: true },
  { id: 'EF-003', type: '排放因子', category: '废钢改制加工', name: '废钢火焰切割', model: '氧气 / 乙炔切割', energy: '燃气', activityUnit: 't废钢', scope: '改制预处理（范围一）', value: 26.8, unit: 'kgCO₂e/t废钢', source: '再生钢铁原料加工核算', date: '2026-05-12', active: false },
  { id: 'EF-101', type: '排放因子', category: '炼钢工序', name: '电炉炼钢（废钢短流程）', model: 'EAF 电弧炉', energy: '电力', activityUnit: 't粗钢', scope: '炼钢工序（废钢入炉）', value: 456, unit: 'kgCO₂e/t粗钢', source: '钢铁行业碳排放核算指南', date: '2026-05-11', active: true },
  { id: 'EF-002', type: '排放因子', category: '炼钢工序', name: '转炉炼钢（铁水长流程）', model: 'BOF 顶底复吹', energy: '铁水', activityUnit: 't粗钢', scope: '炼钢工序（铁水入炉）', value: 1892, unit: 'kgCO₂e/t粗钢', source: '钢铁行业碳排放核算指南', date: '2026-05-11', active: true },
  { id: 'EF-003', type: '排放因子', category: '炼铁工序', name: '高炉炼铁（铁水）', model: 'BF 高炉', energy: '焦炭', activityUnit: 't铁水', scope: '炼铁工序（范围一）', value: 1612, unit: 'kgCO₂e/t铁水', source: '钢铁行业碳排放核算指南', date: '2026-05-10', active: true },
  { id: 'EF-004', type: '排放因子', category: '炼铁工序', name: '烧结矿', model: '烧结工序', energy: '焦粉', activityUnit: 't烧结矿', scope: '烧结工序（范围一）', value: 236, unit: 'kgCO₂e/t烧结矿', source: '钢铁行业碳排放核算指南', date: '2026-05-10', active: true },
  { id: 'EF-005', type: '排放因子', category: '能源介质', name: '冶金焦炭', model: '干基', energy: '焦炭', activityUnit: 't', scope: '燃料燃烧（范围一）', value: 3140, unit: 'kgCO₂e/t', source: 'GB/T 2589 综合能耗', date: '2026-05-09', active: true },
  { id: 'EF-006', type: '排放因子', category: '能源介质', name: '冶炼用电（华东电网）', model: '', energy: '电力', activityUnit: 'kWh', scope: '外购电力（范围二）', value: 0.5617, unit: 'kgCO₂e/kWh', source: '生态环境部电网基准线', date: '2026-05-09', active: true },
  { id: 'EF-007', type: '排放因子', category: '能源介质', name: '天然气', model: '', energy: '天然气', activityUnit: 'm³', scope: '燃料燃烧（范围一）', value: 2.1622, unit: 'kgCO₂e/m³', source: 'GB/T 2589 综合能耗', date: '2026-05-07', active: false },
]

const BLUE = 'text-[#086de0]'

export function CarbonFactorManagement() {
  const [rows, setRows] = useState(initial)
  const [tab, setTab] = useState<'资源因子' | '运输因子' | '排放因子'>('资源因子')
  const [category, setCategory] = useState('全部')
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('全部')
  const [filters, setFilters] = useState({ category: '全部', keyword: '', status: '全部' })
  const [editing, setEditing] = useState<Factor | null>(null)

  const visible = useMemo(() => rows.filter((row) => {
    return row.type === tab
      && (filters.category === '全部' || row.category === filters.category)
      && (!filters.keyword || `${row.name}${row.model}`.includes(filters.keyword))
      && (filters.status === '全部' || (filters.status === '启用' ? row.active : !row.active))
  }), [rows, tab, filters])

  const categories = tab === '资源因子'
    ? ['全部', '支护类', '脚手架类', '拼装类', '轨道类', '型材类', '电线电缆', '房屋建筑类']
    : tab === '运输因子'
      ? ['全部', '陆运', '水运']
      : ['全部', '废钢改制加工', '炼钢工序', '炼铁工序', '能源介质']

  const idPrefix = tab === '资源因子' ? 'RF' : tab === '运输因子' ? 'TF' : 'EF'
  const openCreate = () => setEditing({
    id: `${idPrefix}-${String(rows.length + 1).padStart(3, '0')}`,
    type: tab,
    category: tab === '资源因子' ? '脚手架类' : tab === '运输因子' ? '陆运' : '废钢改制加工',
    name: '', model: '', measureUnit: '吨', unitWeight: 0, energy: tab === '排放因子' ? '电力' : '柴油',
    activityUnit: 't废钢', scope: '改制预处理（范围二）', value: 0,
    unit: tab === '资源因子' ? 'kgCO₂e/吨' : tab === '运输因子' ? 'kgCO₂e/(吨·公里)' : 'kgCO₂e/t废钢',
    source: '', date: '2026-08-20', active: true,
    conversionEnabled: false, conversionTarget: '磁铁矿', scrapBasis: 100, oreEquivalent: 80,
  })

  const save = () => {
    if (!editing) return
    setRows((current) => current.some((row) => row.id === editing.id)
      ? current.map((row) => row.id === editing.id ? editing : row)
      : [editing, ...current])
    setEditing(null)
  }

  const reset = () => {
    setCategory('全部'); setKeyword(''); setStatus('全部')
    setFilters({ category: '全部', keyword: '', status: '全部' })
  }

  return <div className="min-h-full bg-[#f5f7fa] font-sans">
    <div className="border-b bg-card px-6">
      <div className="flex h-14 items-end gap-8">
        {(['资源因子', '运输因子', '排放因子'] as const).map((item) => <button
          key={item}
          type="button"
          onClick={() => { setTab(item); reset() }}
          className={cn('h-14 border-b-2 px-1 text-base font-medium transition-colors', tab === item ? 'border-[#086de0] text-[#086de0]' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >{item === '资源因子' ? '物资因子' : item}</button>)}
      </div>
    </div>

    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3 rounded-lg border border-[#9bc4ff] bg-[#eaf3ff] px-5 py-3 text-sm text-[#086de0]">
        {tab === '排放因子' ? <Zap className="size-5 shrink-0" /> : <Package className="size-5 shrink-0" />}
        {tab === '资源因子' && <p>碳因子库覆盖模板类、支护类、脚手架类、拼装类、轨道类、型材类、电线电缆、房屋建筑类共 8 大物资分类；<b className="ml-2">现阶段具体实施物资以钢材类为主</b>，其余分类持续完善中。</p>}
        {tab === '运输因子' && <p>运输因子按陆运、水运两类维护，用于资源回收 / 流转过程的<b className="ml-2">运输环节碳排放</b>核算，因子口径统一为 kgCO₂e/(吨·公里)。</p>}
        {tab === '排放因子' && <p>排放因子以<b className="mx-1">钢铁冶炼</b>为主，覆盖炼钢工序、炼铁工序、能源介质，用于废钢回收再制造的冶炼环节碳排放核算；<b className="ml-1">电炉短流程（废钢）较转炉长流程可显著降碳</b>。</p>}
      </div>

      <section className="bg-card p-4">
        <div className="flex items-center gap-4 px-1 py-1">
          <FilterField label={tab === '资源因子' ? '物资类别' : tab === '运输因子' ? '运输方式' : '能源类别'}>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-44 rounded-lg border bg-background px-3 text-muted-foreground outline-none focus:border-[#086de0]">
              {categories.map((item) => <option key={item} value={item}>{item === '全部' ? (tab === '资源因子' ? '全部类别' : tab === '运输因子' ? '全部方式' : '全部能源') : item}</option>)}
            </select>
          </FilterField>
          <FilterField label={tab === '资源因子' ? '物资名称' : tab === '运输因子' ? '运输工具' : '能源名称'}>
            <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="h-10 w-44" placeholder={tab === '资源因子' ? '请输入物资名称' : tab === '运输因子' ? '请输入运输工具/车型' : '请输入能源/活动名称'} />
          </FilterField>
          <FilterField label="状态">
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-40 rounded-lg border bg-background px-3 text-muted-foreground outline-none focus:border-[#086de0]">
              <option value="全部">全部状态</option><option value="启用">启用</option><option value="停用">停用</option>
            </select>
          </FilterField>
          <div className="ml-auto flex gap-3">
            <Button className="h-10 bg-[#086de0] px-5 hover:bg-[#075fc5]" onClick={() => setFilters({ category, keyword, status })}><Search data-icon="inline-start" />查询</Button>
            <Button variant="outline" className="h-10 px-5" onClick={reset}><RotateCcw data-icon="inline-start" />重置</Button>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button className="h-10 bg-[#086de0] px-5 hover:bg-[#075fc5]" onClick={openCreate}><Plus data-icon="inline-start" />新增因子</Button>
          <Button variant="outline" className="h-10 px-5"><Download data-icon="inline-start" />导出</Button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border">
          {tab === '资源因子'
            ? <ResourceTable rows={visible} onEdit={setEditing} onToggle={(id) => setRows((current) => current.map((row) => row.id === id ? { ...row, active: !row.active } : row))} />
            : tab === '运输因子'
              ? <TransportTable rows={visible} onEdit={setEditing} onToggle={(id) => setRows((current) => current.map((row) => row.id === id ? { ...row, active: !row.active } : row))} />
              : <EmissionTable rows={visible} onEdit={setEditing} onToggle={(id) => setRows((current) => current.map((row) => row.id === id ? { ...row, active: !row.active } : row))} />}
        </div>
      </section>
    </div>

    <FactorDialog editing={editing} setEditing={setEditing} onSave={save} />
  </div>
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex items-center gap-2 text-sm font-medium"><span className="whitespace-nowrap">{label}</span>{children}</label>
}

function ResourceTable({ rows, onEdit, onToggle }: { rows: Factor[]; onEdit: (row: Factor) => void; onToggle: (id: string) => void }) {
  return <table className="w-full min-w-[1180px] whitespace-nowrap text-sm">
    <thead className="bg-[#edf3fa] text-left"><tr>{['序号', '物资类别', '物资名称', '规格型号', '计量单位', '单位重量(吨)', '产品碳因子', '因子单位', '数据来源', '生效日期', '状态', '操作'].map((item) => <th key={item} className="whitespace-nowrap px-3 py-3 font-semibold">{item}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={row.id} className="border-t hover:bg-muted/30">
      <td className="px-3 py-3">{index + 1}</td><td className="px-3 py-3"><span className="rounded bg-[#e7f1ff] px-2 py-1 text-[#086de0]">{row.category}</span></td><td className="px-3 py-3 font-semibold">{row.name}</td><td className="px-3 py-3 text-muted-foreground">{row.model}</td><td className="px-3 py-3 text-center">{row.measureUnit}</td><td className="px-3 py-3 text-right tabular-nums">{row.unitWeight}</td><td className="px-3 py-3 text-right text-base font-semibold tabular-nums">{row.value.toLocaleString()}</td><td className="px-3 py-3 text-muted-foreground">{row.unit}</td><td className="px-3 py-3 text-muted-foreground">{row.source}</td><td className="px-3 py-3 text-muted-foreground">{row.date}</td><Status active={row.active} /><Actions row={row} onEdit={onEdit} onToggle={onToggle} />
    </tr>)}</tbody>
  </table>
}

function TransportTable({ rows, onEdit, onToggle }: { rows: Factor[]; onEdit: (row: Factor) => void; onToggle: (id: string) => void }) {
  return <table className="w-full min-w-[1080px] whitespace-nowrap text-sm">
    <thead className="bg-[#edf3fa] text-left"><tr>{['序号', '运输方式', '运输工具/车型', '能源类型', '碳排放因子(kgCO₂e/吨·公里)', '数据来源', '状态', '更新日期', '操作'].map((item) => <th key={item} className="whitespace-nowrap px-3 py-3 font-semibold">{item}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={row.id} className="border-t hover:bg-muted/30">
      <td className="px-3 py-3">{index + 1}</td><td className="px-3 py-3 font-medium"><span className={cn('inline-flex items-center gap-2', BLUE)}>{row.category === '陆运' ? <Truck className="size-4" /> : <Ship className="size-4" />}<span className="text-foreground">{row.category}</span></span></td><td className="px-3 py-3 font-medium">{row.name}</td><td className="px-3 py-3 text-muted-foreground">{row.energy === '电力' ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-600"><Zap className="size-3" />电力</span> : row.energy}</td><td className="px-3 py-3 text-right text-base font-semibold tabular-nums">{row.value.toFixed(4)}</td><td className="px-3 py-3 text-muted-foreground">{row.source}</td><Status active={row.active} /><td className="px-3 py-3 text-muted-foreground">{row.date}</td><Actions row={row} onEdit={onEdit} onToggle={onToggle} />
    </tr>)}</tbody>
  </table>
}

const EMISSION_META: Record<string, { icon: typeof Zap; badge: string }> = {
  废钢改制加工: { icon: Recycle, badge: 'bg-teal-50 text-teal-600' },
  炼钢工序: { icon: Factory, badge: 'bg-[#e7f1ff] text-[#086de0]' },
  炼铁工序: { icon: Flame, badge: 'bg-amber-50 text-amber-600' },
  能源介质: { icon: Zap, badge: 'bg-emerald-50 text-emerald-600' },
}

function EmissionTable({ rows, onEdit, onToggle }: { rows: Factor[]; onEdit: (row: Factor) => void; onToggle: (id: string) => void }) {
  return <table className="w-full min-w-[1120px] whitespace-nowrap text-sm">
    <thead className="bg-[#edf3fa] text-left"><tr>{['序号', '能源类别', '能源/活动名称', '活动水平单位', '排放因子', '因子单位', '适用范围', '数据来源', '状态', '生效日期', '操作'].map((item) => <th key={item} className="whitespace-nowrap px-3 py-3 font-semibold">{item}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => {
      const meta = EMISSION_META[row.category] ?? EMISSION_META['热力']
      const Icon = meta.icon
      return <tr key={row.id} className="border-t hover:bg-muted/30">
        <td className="px-3 py-3">{index + 1}</td>
        <td className="px-3 py-3"><span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', meta.badge)}><Icon className="size-3" />{row.category}</span></td>
        <td className="px-3 py-3 font-semibold">{row.name}</td>
        <td className="px-3 py-3 text-center text-muted-foreground">{row.activityUnit}</td>
        <td className="px-3 py-3 text-right text-base font-semibold tabular-nums">{row.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
        <td className="px-3 py-3 text-muted-foreground">{row.unit}</td>
        <td className="px-3 py-3 text-muted-foreground">{row.scope}</td>
        <td className="px-3 py-3 text-muted-foreground">{row.source}</td>
        <Status active={row.active} />
        <td className="px-3 py-3 text-muted-foreground">{row.date}</td>
        <Actions row={row} onEdit={onEdit} onToggle={onToggle} />
      </tr>
    })}</tbody>
  </table>
}

function Status({ active }: { active: boolean }) { return <td className="px-3 py-3"><span className={cn('rounded px-2 py-1 text-xs font-medium', active ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground')}>{active ? '启用' : '停用'}</span></td> }
function Actions({ row, onEdit, onToggle }: { row: Factor; onEdit: (row: Factor) => void; onToggle: (id: string) => void }) { return <td className="px-3 py-3"><div className="flex whitespace-nowrap"><Button variant="ghost" size="sm" className="text-[#086de0]" onClick={() => onEdit(row)}><Pencil data-icon="inline-start" />编辑</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => onToggle(row.id)}><Power data-icon="inline-start" />{row.active ? '停用' : '启用'}</Button></div></td> }

function FactorDialog({ editing, setEditing, onSave }: { editing: Factor | null; setEditing: (row: Factor | null) => void; onSave: () => void }) {
  const isResource = editing?.type === '资源因子'
  const isEmission = editing?.type === '排放因子'
  const catOptions = isResource ? ['脚手架类', '支护类', '模板类'] : isEmission ? ['废钢改制加工', '炼钢工序', '炼铁工序', '能源介质'] : ['陆运', '水运', '铁路']
  return <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{editing?.name ? '编辑因子' : '新增因子'}</DialogTitle><DialogDescription>维护因子基础信息、数据来源和适用边界。</DialogDescription></DialogHeader>{editing && <div className="grid gap-4">
    <div className="grid gap-4 sm:grid-cols-2"><Field label={isResource ? '物资类别' : isEmission ? '能源类别' : '运输方式'}><select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} className="h-10 rounded-md border bg-background px-3">{catOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><Field label={isResource ? '物资名称' : isEmission ? '能源/活动名称' : '运输工具/车型'}><Input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></Field></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label={isResource ? '规格型号' : isEmission ? '活动水平单位' : '能源类型'}>{isEmission ? <Input value={editing.activityUnit || ''} onChange={(event) => setEditing({ ...editing, activityUnit: event.target.value })} placeholder="如 t粗钢 / t铁水 / kWh / t" /> : <Input value={editing.model} onChange={(event) => setEditing({ ...editing, model: event.target.value, energy: isResource ? editing.energy : event.target.value })} />}</Field><Field label={isEmission ? '排放因子值' : '碳因子值'}><Input type="number" value={editing.value} onChange={(event) => setEditing({ ...editing, value: Number(event.target.value) })} /></Field></div>
    {isEmission && <div className="grid gap-4 sm:grid-cols-2"><Field label="因子单位"><Input value={editing.unit} onChange={(event) => setEditing({ ...editing, unit: event.target.value })} placeholder="如 kgCO₂e/t粗钢" /></Field><Field label="适用范围"><select value={editing.scope || ''} onChange={(event) => setEditing({ ...editing, scope: event.target.value })} className="h-10 rounded-md border bg-background px-3"><option value="改制预处理（范围一）">改制预处理（范围一）</option><option value="改制预处理（范围二）">改制预处理（范围二）</option><option value="炼钢工序（废钢入炉）">炼钢工序（废钢入炉）</option><option value="炼钢工序（铁水入炉）">炼钢工序（铁水入炉）</option><option value="炼铁工序（范围一）">炼铁工序（范围一）</option><option value="烧结工序（范围一）">烧结工序（范围一）</option><option value="燃料燃烧（范围一）">燃料燃烧（范围一）</option><option value="外购电力（范围二）">外购电力（范围二）</option></select></Field></div>}
    {isResource && <section className="rounded-lg border bg-muted/30 p-4"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-semibold"><Calculator className="size-4 text-[#086de0]" />废钢等效矿石折算</div><p className="mt-1 text-xs text-muted-foreground">默认不折算。仅钢材类资源按需启用。</p></div><Switch checked={editing.conversionEnabled || false} onCheckedChange={(checked) => setEditing({ ...editing, conversionEnabled: checked })} aria-label="启用废钢等效矿石折算" /></div>{editing.conversionEnabled && <div className="mt-4 grid gap-4"><Field label="铁矿石类型"><select value={editing.conversionTarget || '磁铁矿'} onChange={(event) => setEditing({ ...editing, conversionTarget: event.target.value as Factor['conversionTarget'] })} className="h-10 rounded-lg border bg-background px-3 outline-none focus:border-[#086de0]">{['磁铁矿', '赤铁矿', '褐铁矿', '菱铁矿'].map((ore) => <option key={ore} value={ore}>{ore}</option>)}</select></Field><div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3"><Field label="废钢基准量（吨）"><Input type="number" value={editing.scrapBasis || 100} onChange={(event) => setEditing({ ...editing, scrapBasis: Number(event.target.value) })} /></Field><span className="pb-2 text-sm text-muted-foreground">可抵</span><Field label={`${editing.conversionTarget || '磁铁矿'}等效量（吨）`}><Input type="number" value={editing.oreEquivalent || 80} onChange={(event) => setEditing({ ...editing, oreEquivalent: Number(event.target.value) })} /></Field></div><div className="rounded-md border border-[#9bc4ff] bg-[#eaf3ff] p-3 text-sm text-[#086de0]"><Info className="mr-2 inline size-4" />100 吨{editing.name || '废钢'}可折算 {(((editing.oreEquivalent || 0) / (editing.scrapBasis || 1)) * 100).toFixed(2)} 吨{editing.conversionTarget || '磁铁矿'}</div></div>}</section>}
    <Field label="数据来源"><Input value={editing.source} onChange={(event) => setEditing({ ...editing, source: event.target.value })} /></Field>
  </div>}<DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>取消</Button><Button className="bg-[#086de0] hover:bg-[#075fc5]" disabled={!editing?.name} onClick={onSave}>保存</Button></DialogFooter></DialogContent></Dialog>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label> }
