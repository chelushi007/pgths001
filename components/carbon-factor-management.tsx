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
  Scale,
  Search,
  Ship,
  TrendingDown,
  Truck,
  Warehouse,
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

type FactorType =
  | '资源因子'
  | '运输因子'
  | '废钢炼钢因子'
  | '废钢回收站因子'
  | '改制加工因子'
  | '整备因子'

type Factor = {
  id: string
  type: FactorType
  category: string
  name: string
  model: string
  measureUnit?: string
  unitWeight?: number
  energy?: string
  // 废钢炼钢因子 / 废钢回收站因子：活动水平计量单位与适用范围
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
  { id: 'TF-004', type: '运输因子', category: '水运', name: '内河货船（1000t级）', model: '燃油', energy: '燃油', value: 0.0285, unit: 'kgCO₂e/(吨·公里)', source: '水运碳因子库', date: '2026-05-07', active: true },
  { id: 'TF-005', type: '运输因子', category: '水运', name: '沿海散货船（5000t级）', model: '燃油', energy: '燃油', value: 0.0156, unit: 'kgCO₂e/(吨·公里)', source: '水运碳因子库', date: '2026-05-07', active: true },
  // 废钢炼钢因子
  { id: 'EF-001', type: '废钢炼钢因子', category: '废钢改制加工', name: '废钢破碎分选', model: '破碎机组', energy: '电力', activityUnit: 't废钢', scope: '改制预处理（范围二）', value: 18.6, unit: 'kgCO₂e/t废钢', source: '再生钢铁原料加工核算', date: '2026-05-12', active: true },
  { id: 'EF-002', type: '废钢炼钢因子', category: '废钢改制加工', name: '废钢剪切打包', model: '龙门剪 / 打包机', energy: '电力', activityUnit: 't废钢', scope: '改制预处理（范围二）', value: 12.4, unit: 'kgCO₂e/t废钢', source: '再生钢铁原料加工核算', date: '2026-05-12', active: true },
  { id: 'EF-003', type: '废钢炼钢因子', category: '废钢改制加工', name: '废钢火焰切割', model: '氧气 / 乙炔切割', energy: '燃气', activityUnit: 't废钢', scope: '改制预处理（范围一）', value: 26.8, unit: 'kgCO₂e/t废钢', source: '再生钢铁原料加工核算', date: '2026-05-12', active: false },
  { id: 'EF-101', type: '废钢炼钢因子', category: '炼钢工序', name: '电炉炼钢（废钢短流程）', model: 'EAF 电弧炉', energy: '电力', activityUnit: 't粗钢', scope: '炼钢工序（废钢入炉）', value: 456, unit: 'kgCO₂e/t粗钢', source: '钢铁行业碳排放核算指南', date: '2026-05-11', active: true },
  { id: 'EF-102', type: '废钢炼钢因子', category: '炼钢工序', name: '转炉炼钢（铁水长流程）', model: 'BOF 顶底复吹', energy: '铁水', activityUnit: 't粗钢', scope: '炼钢工序（铁水入炉）', value: 1892, unit: 'kgCO₂e/t粗钢', source: '钢铁行业碳排放核算指南', date: '2026-05-11', active: true },
  { id: 'EF-103', type: '废钢炼钢因子', category: '炼铁工序', name: '高炉炼铁（铁水）', model: 'BF 高炉', energy: '焦炭', activityUnit: 't铁水', scope: '炼铁工序（范围一）', value: 1612, unit: 'kgCO₂e/t铁水', source: '钢铁行业碳排放核算指南', date: '2026-05-10', active: true },
  { id: 'EF-104', type: '废钢炼钢因子', category: '炼铁工序', name: '烧结矿', model: '烧结工序', energy: '焦粉', activityUnit: 't烧结矿', scope: '烧结工序（范围一）', value: 236, unit: 'kgCO₂e/t烧结矿', source: '钢铁行业碳排放核算指南', date: '2026-05-10', active: true },
  { id: 'EF-105', type: '废钢炼钢因子', category: '能源介质', name: '冶金焦炭', model: '干基', energy: '焦炭', activityUnit: 't', scope: '燃料燃烧（范围一）', value: 3140, unit: 'kgCO₂e/t', source: 'GB/T 2589 综合能耗', date: '2026-05-09', active: true },
  { id: 'EF-106', type: '废钢炼钢因子', category: '能源介质', name: '冶炼用电（华东电网）', model: '', energy: '电力', activityUnit: 'kWh', scope: '外购电力（范围二）', value: 0.5617, unit: 'kgCO₂e/kWh', source: '生态环境部电网基准线', date: '2026-05-09', active: true },
  { id: 'EF-107', type: '废钢炼钢因子', category: '能源介质', name: '天然气', model: '', energy: '天然气', activityUnit: 'm³', scope: '燃料燃烧（范围一）', value: 2.1622, unit: 'kgCO₂e/m³', source: 'GB/T 2589 综合能耗', date: '2026-05-07', active: false },
  // 废钢回收站因子
  { id: 'RS-001', type: '废钢回收站因子', category: '收购计量', name: '地磅智能计量系统', model: '80t 数字地磅', energy: '电力', activityUnit: 't废钢', scope: '站���作业（范围二）', value: 0.8, unit: 'kgCO₂e/t废钢', source: '回收站运营能耗核算', date: '2026-05-13', active: true },
  { id: 'RS-002', type: '废钢回收站因子', category: '装卸搬运', name: '电磁吸盘起重机', model: '10t 桥式', energy: '电力', activityUnit: 't废钢', scope: '站内作业（范围二）', value: 6.2, unit: 'kgCO₂e/t废钢', source: '回收站运营能耗核算', date: '2026-05-13', active: true },
  { id: 'RS-003', type: '废钢回收站因子', category: '装卸搬运', name: '液压抓斗起重机', model: '16t 门座式', energy: '电力', activityUnit: 't废钢', scope: '站内作业（范围二）', value: 5.4, unit: 'kgCO₂e/t废钢', source: '回收站运营能耗核算', date: '2026-05-13', active: true },
  { id: 'RS-004', type: '废钢回收站因子', category: '分拣加工', name: '智能光电分选线', model: 'AI 视觉分选', energy: '电力', activityUnit: 't废钢', scope: '站内作业（范围二）', value: 9.5, unit: 'kgCO₂e/t废钢', source: '回收站运营能耗核算', date: '2026-05-12', active: true },
  { id: 'RS-005', type: '废钢回收站因子', category: '分拣加工', name: '龙门剪切机', model: '1000t 剪切力', energy: '电力', activityUnit: 't废钢', scope: '站内作业（范围二）', value: 11.8, unit: 'kgCO₂e/t废钢', source: '回收站运营能耗核算', date: '2026-05-12', active: true },
  { id: 'RS-006', type: '废钢回收站因子', category: '堆场仓储', name: '堆场照明与排水', model: '光伏 + 市电', energy: '电力', activityUnit: 't废钢', scope: '站内作业（范围二）', value: 1.6, unit: 'kgCO₂e/t废钢', source: '回收站运营能耗核算', date: '2026-05-11', active: true },
  { id: 'RS-007', type: '废钢回收站因子', category: '站内短驳', name: '柴油叉车 / 装载机', model: '5t 叉车', energy: '柴油', activityUnit: 't废钢', scope: '站内作业（范围一）', value: 4.3, unit: 'kgCO₂e/t废钢', source: '回收站运营能耗核算', date: '2026-05-11', active: false },
  // 改制加工因子（针对钢材类）：受让方 / 钢厂对回收钢材的改制加工工序
  { id: 'RP-001', type: '改制加工因子', category: '预处理', name: '人工分拣分类', model: '钢材类', energy: '电力', activityUnit: 't钢材', scope: '改制加工（范围二）', value: 3.6, unit: 'kgCO₂e/t钢材', source: '钢材改制加工能耗核算', date: '2026-05-14', active: true },
  { id: 'RP-002', type: '改制加工因子', category: '预处理', name: '结构拆解', model: '钢材类', energy: '电力', activityUnit: 't钢材', scope: '改制加工（范围二）', value: 8.2, unit: 'kgCO₂e/t钢材', source: '钢材改制加工能耗核算', date: '2026-05-14', active: true },
  { id: 'RP-003', type: '改制加工因子', category: '剪切破碎', name: '龙门剪切', model: '钢材类 / 1000t 剪切力', energy: '电力', activityUnit: 't钢材', scope: '改制加工（范围二）', value: 12.4, unit: 'kgCO₂e/t钢材', source: '钢材改制加工能耗核算', date: '2026-05-14', active: true },
  { id: 'RP-004', type: '改制加工因子', category: '剪切破碎', name: '重型破碎分选', model: '钢材类 / 破碎机组', energy: '电力', activityUnit: 't钢材', scope: '改制加工（范围二）', value: 18.6, unit: 'kgCO₂e/t钢材', source: '钢材改制加工能耗核算', date: '2026-05-13', active: true },
  { id: 'RP-005', type: '改制加工因子', category: '剪切破碎', name: '氧气火焰切割', model: '钢材类 / 氧气·乙炔', energy: '燃气', activityUnit: 't钢材', scope: '改制加工（范围一）', value: 26.8, unit: 'kgCO₂e/t钢材', source: '钢材改制加工能耗核算', date: '2026-05-13', active: false },
  { id: 'RP-006', type: '改制加工因子', category: '压块打包', name: '液压打包压块', model: '钢材类 / 打包机', energy: '电力', activityUnit: 't钢材', scope: '改制加工（范围二）', value: 9.8, unit: 'kgCO₂e/t钢材', source: '钢材改制加工能耗核算', date: '2026-05-12', active: true },
  // 整备因子（针对钢材类）：出租方对周转钢材的整备工序（清洗/除锈/切割/焊接/矫正/喷涂/检测/维修）
  { id: 'PR-001', type: '整备因子', category: '表面处理', name: '高压清洗', model: '钢材类', energy: '电力', activityUnit: 't钢材', scope: '出租整备（范围二）', value: 2.4, unit: 'kgCO₂e/t钢材', source: '钢材整备加工能耗核算', date: '2026-05-15', active: true },
  { id: 'PR-002', type: '整备因子', category: '表面处理', name: '抛丸除锈', model: '钢材类 / 抛丸机', energy: '电力', activityUnit: 't钢材', scope: '出租整备（范围二）', value: 6.8, unit: 'kgCO₂e/t钢材', source: '钢材整备加工能耗核算', date: '2026-05-15', active: true },
  { id: 'PR-003', type: '整备因子', category: '表面处理', name: '防腐喷涂', model: '钢材类 / 环氧涂层', energy: '电力', activityUnit: 't钢材', scope: '出租整备（范围二）', value: 5.2, unit: 'kgCO₂e/t钢材', source: '钢材整备加工能耗核算', date: '2026-05-15', active: true },
  { id: 'PR-004', type: '整备因子', category: '结构加工', name: '定尺切割', model: '钢材类', energy: '电力', activityUnit: 't钢材', scope: '出租整备（范围二）', value: 7.6, unit: 'kgCO₂e/t钢材', source: '钢材整备加工能耗核算', date: '2026-05-14', active: true },
  { id: 'PR-005', type: '整备因子', category: '结构加工', name: '焊接修补', model: '钢材类 / CO₂ 保护焊', energy: '电力', activityUnit: 't钢材', scope: '出租整备（范围二）', value: 9.4, unit: 'kgCO₂e/t钢材', source: '钢材整备加工能耗核算', date: '2026-05-14', active: true },
  { id: 'PR-006', type: '整备因子', category: '结构加工', name: '校直矫正', model: '钢材类 / 液压矫直', energy: '电力', activityUnit: 't钢材', scope: '出租整备（范围二）', value: 4.6, unit: 'kgCO₂e/t钢材', source: '钢材整备加工能耗核算', date: '2026-05-13', active: true },
  { id: 'PR-007', type: '整备因子', category: '检测维修', name: '无损探伤检测', model: '钢材类 / 超声探伤', energy: '电力', activityUnit: 't钢材', scope: '出租整备（范围二）', value: 1.8, unit: 'kgCO₂e/t钢材', source: '钢材整备加工能耗核算', date: '2026-05-13', active: true },
  { id: 'PR-008', type: '整备因子', category: '检测维修', name: '构件维修更换', model: '钢材类', energy: '电力', activityUnit: 't钢材', scope: '出租整备（范围二）', value: 3.2, unit: 'kgCO₂e/t钢材', source: '钢材整备加工能耗核算', date: '2026-05-12', active: false },
]

const BLUE = 'text-[#086de0]'

const TAB_META: Record<FactorType, {
  label: string
  idPrefix: string
  categories: string[]
  catLabel: string
  nameLabel: string
  allText: string
  keywordPlaceholder: string
}> = {
  资源因子: { label: '物资因子', idPrefix: 'RF', categories: ['支护类', '脚手架类', '拼装类', '轨道类', '型材类', '电线电缆', '房屋建筑类'], catLabel: '物资类别', nameLabel: '物资名称', allText: '全部类别', keywordPlaceholder: '请输入物资名称' },
  运输因子: { label: '运输因子', idPrefix: 'TF', categories: ['陆运', '水运'], catLabel: '运输方式', nameLabel: '运输工具', allText: '全部方式', keywordPlaceholder: '请输入运输工具/车型' },
  废钢炼钢因子: { label: '废钢炼钢因子', idPrefix: 'EF', categories: ['废钢改制加工', '炼钢工序', '炼铁工序', '能源介质'], catLabel: '能源类别', nameLabel: '能源名称', allText: '全部能源', keywordPlaceholder: '请输入能源/活动名称' },
  废钢回收站因子: { label: '废钢回收站因子', idPrefix: 'RS', categories: ['收购计量', '装卸搬运', '分拣加工', '堆场仓储', '站内短驳'], catLabel: '作业环节', nameLabel: '作业名称', allText: '全部环节', keywordPlaceholder: '请输入作业/设备名称' },
  改制加工因子: { label: '改制加工因子', idPrefix: 'RP', categories: ['预处理', '剪切破碎', '压块打包'], catLabel: '加工环节', nameLabel: '加工工序', allText: '全部环节', keywordPlaceholder: '请输入加工工序/设备名称' },
  整备因子: { label: '整备因子', idPrefix: 'PR', categories: ['表面处理', '结构加工', '检��维修'], catLabel: '整备环节', nameLabel: '整备工序', allText: '全部环节', keywordPlaceholder: '请输入整备工序/设备名称' },
}

const TAB_ORDER: FactorType[] = ['资源因子', '运输因子', '废钢炼钢因子', '废钢回收站因子', '改制加工因子', '整备因子']

// 分作业环节 / 工序的图标与��色
const EMISSION_META: Record<string, { icon: typeof Zap; badge: string }> = {
  废钢改制加工: { icon: Recycle, badge: 'bg-teal-50 text-teal-600' },
  炼钢工序: { icon: Factory, badge: 'bg-[#e7f1ff] text-[#086de0]' },
  炼铁工序: { icon: Flame, badge: 'bg-amber-50 text-amber-600' },
  能源介质: { icon: Zap, badge: 'bg-emerald-50 text-emerald-600' },
}

const STATION_META: Record<string, { icon: typeof Zap; badge: string }> = {
  收购计量: { icon: Scale, badge: 'bg-[#e7f1ff] text-[#086de0]' },
  装卸搬运: { icon: Package, badge: 'bg-amber-50 text-amber-600' },
  分拣加工: { icon: Recycle, badge: 'bg-teal-50 text-teal-600' },
  堆场仓储: { icon: Warehouse, badge: 'bg-emerald-50 text-emerald-600' },
  站内短驳: { icon: Truck, badge: 'bg-indigo-50 text-indigo-600' },
}

const REPROCESS_META: Record<string, { icon: typeof Zap; badge: string }> = {
  预处理: { icon: Recycle, badge: 'bg-teal-50 text-teal-600' },
  剪切破碎: { icon: Factory, badge: 'bg-[#e7f1ff] text-[#086de0]' },
  压块打包: { icon: Package, badge: 'bg-amber-50 text-amber-600' },
}

const PREP_META: Record<string, { icon: typeof Zap; badge: string }> = {
  表面处理: { icon: Recycle, badge: 'bg-[#e7f1ff] text-[#086de0]' },
  结构加工: { icon: Factory, badge: 'bg-amber-50 text-amber-600' },
  检测维修: { icon: Scale, badge: 'bg-emerald-50 text-emerald-600' },
}

export function CarbonFactorManagement() {
  const [rows, setRows] = useState(initial)
  const [tab, setTab] = useState<FactorType>('资源因子')
  const [category, setCategory] = useState('全部')
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('全部')
  const [filters, setFilters] = useState({ category: '全部', keyword: '', status: '全部' })
  const [editing, setEditing] = useState<Factor | null>(null)
  const meta = TAB_META[tab]

  const visible = useMemo(() => rows.filter((row) => {
    return row.type === tab
      && (filters.category === '全部' || row.category === filters.category)
      && (!filters.keyword || `${row.name}${row.model}`.includes(filters.keyword))
      && (filters.status === '全部' || (filters.status === '启用' ? row.active : !row.active))
  }), [rows, tab, filters])

  const categories = ['全部', ...meta.categories]

  const highlights = useMemo(() => buildHighlights(rows, tab), [rows, tab])

  const openCreate = () => {
    const defaults: Record<FactorType, Partial<Factor>> = {
      资源因子: { category: '脚手架类', energy: '柴油', unit: 'kgCO₂e/吨', measureUnit: '吨' },
      运输因子: { category: '陆运', energy: '柴油', unit: 'kgCO₂e/(吨·公里)' },
      废钢炼钢因子: { category: '废钢改制加工', energy: '电力', activityUnit: 't废钢', scope: '改制预处理（范围二）', unit: 'kgCO₂e/t废钢' },
      废钢回收站因子: { category: '收购计量', energy: '电力', activityUnit: 't废钢', scope: '站内作业（范围二）', unit: 'kgCO₂e/t废钢' },
      改制加工因子: { category: '预处理', energy: '电力', activityUnit: 't钢材', scope: '改制加工（范围二）', unit: 'kgCO₂e/t钢材' },
      整备因子: { category: '表面处理', energy: '电力', activityUnit: 't钢材', scope: '出租整备（范围二）', unit: 'kgCO₂e/t钢材' },
    }
    setEditing({
      id: `${meta.idPrefix}-${String(rows.length + 1).padStart(3, '0')}`,
      type: tab, name: '', model: '', unitWeight: 0, value: 0, source: '', date: '2026-08-20', active: true,
      conversionEnabled: false, conversionTarget: '磁铁矿', scrapBasis: 100, oreEquivalent: 80,
      category: '', unit: '', ...defaults[tab],
    })
  }

  const save = () => {
    if (!editing) return
    setRows((current) => current.some((row) => row.id === editing.id)
      ? current.map((row) => row.id === editing.id ? editing : row)
      : [editing, ...current])
    setEditing(null)
  }

  const toggle = (id: string) => setRows((current) => current.map((row) => row.id === id ? { ...row, active: !row.active } : row))

  const reset = () => {
    setCategory('全部'); setKeyword(''); setStatus('全部')
    setFilters({ category: '全部', keyword: '', status: '全部' })
  }

  return <div className="min-h-full bg-[#f5f7fa] font-sans">
    <div className="border-b bg-card px-6">
      <div className="flex h-14 items-end gap-8">
        {TAB_ORDER.map((item) => <button
          key={item}
          type="button"
          onClick={() => { setTab(item); reset() }}
          className={cn('h-14 border-b-2 px-1 text-base font-medium transition-colors', tab === item ? 'border-[#086de0] text-[#086de0]' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >{TAB_META[item].label}</button>)}
      </div>
    </div>

    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3 rounded-lg border border-[#9bc4ff] bg-[#eaf3ff] px-5 py-3 text-sm text-[#086de0]">
        {tab === '废钢回收站因子' || tab === '改制加工因子' ? <Recycle className="size-5 shrink-0" /> : tab === '废钢炼钢因子' ? <Zap className="size-5 shrink-0" /> : tab === '整备因子' ? <Factory className="size-5 shrink-0" /> : <Package className="size-5 shrink-0" />}
        {tab === '资源因子' && <p>碳因子库覆盖模板类、支护类、脚手架类、拼装类、轨道类、型材类、电线电缆、房屋建筑类共 8 大物资分类；<b className="ml-2">现阶段具体实施物资以钢材类为主</b>，其余分类持续完善中。</p>}
        {tab === '运输因子' && <p>运输因子按陆运、水运两类维护，用于资源回收 / 流转过程的<b className="ml-2">运输环节碳排放</b>核算，因子口径统一为 kgCO₂e/(吨·公里)。</p>}
        {tab === '废钢炼钢因子' && <p>废钢炼钢因子以<b className="mx-1">钢铁冶炼</b>为主，覆盖废钢改制加工、炼钢工序、炼铁工序、能源介质，用于废钢回收再制造的冶炼环节碳排放核算；<b className="ml-1">电炉短流程（废钢）较转炉长流程可显著降碳</b>。</p>}
        {tab === '废钢回收站因子' && <p>废钢回收站因子覆盖收购计量、装卸搬运、分拣加工、堆场仓储、站内短驳等<b className="mx-1">站内运营环节</b>，用于废钢从进站回收到出站入炉的运营碳排放核算，能源以<b className="ml-1">电力（范围二）</b>为主。</p>}
        {tab === '改制加工因子' && <p>改制加工因子覆盖预处理、剪切破碎、压块打包等回收物资的改制加工环节，<b className="ml-1">现阶段仅针对钢材类材料</b>，用于受让方 / 钢厂改制加工环节的碳排放核算，因子口径统一为 kgCO₂e/t钢材。</p>}
        {tab === '整备因子' && <p>整备因子覆盖表面处理、结构加工、检测维修等出租周转物资的整备工序（清洗 / 除锈 / 切割 / 焊接 / 矫正 / 喷涂 / 检测 / 维修），<b className="ml-1">现阶段仅针对钢材类材料</b>，用于出租方整备环节的碳排放核算，因子口径统一为 kgCO₂e/t钢材。</p>}
      </div>

      {highlights.length > 0 && <SummaryStrip items={highlights} />}

      <section className="bg-card p-4">
        <div className="flex items-center gap-4 px-1 py-1">
          <FilterField label={meta.catLabel}>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-44 rounded-lg border bg-background px-3 text-muted-foreground outline-none focus:border-[#086de0]">
              {categories.map((item) => <option key={item} value={item}>{item === '全部' ? meta.allText : item}</option>)}
            </select>
          </FilterField>
          <FilterField label={meta.nameLabel}>
            <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="h-10 w-44" placeholder={meta.keywordPlaceholder} />
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
            ? <ResourceTable rows={visible} onEdit={setEditing} onToggle={toggle} />
            : tab === '运输因子'
              ? <TransportTable rows={visible} onEdit={setEditing} onToggle={toggle} />
              : tab === '废钢炼钢因子'
                ? <ScopeTable rows={visible} onEdit={setEditing} onToggle={toggle} meta={EMISSION_META} catLabel="能源类别" nameLabel="能源/活动名称" valueLabel="废钢炼钢因子" />
                : tab === '废钢回收站因子'
                  ? <ScopeTable rows={visible} onEdit={setEditing} onToggle={toggle} meta={STATION_META} catLabel="作业环节" nameLabel="作业/设备名称" valueLabel="回收站因子" />
                  : tab === '改制加工因子'
                    ? <ScopeTable rows={visible} onEdit={setEditing} onToggle={toggle} meta={REPROCESS_META} catLabel="加工环节" nameLabel="加工工序/设备" valueLabel="改制加工因子" />
                    : <ScopeTable rows={visible} onEdit={setEditing} onToggle={toggle} meta={PREP_META} catLabel="整备环节" nameLabel="整备工序/设备" valueLabel="整备因子" />}
        </div>
      </section>
    </div>

    <FactorDialog editing={editing} setEditing={setEditing} onSave={save} />
  </div>
}

type Highlight = { icon: typeof Zap; label: string; value: string; unit: string; tone: 'blue' | 'amber' | 'green' | 'teal'; highlight?: boolean }

function buildHighlights(rows: Factor[], tab: FactorType): Highlight[] {
  if (tab === '废钢炼钢因子') {
    const eaf = rows.find((r) => r.name.includes('电炉炼钢'))?.value ?? 456
    const bof = rows.find((r) => r.name.includes('转炉炼钢'))?.value ?? 1892
    const cut = (((bof - eaf) / bof) * 100).toFixed(0)
    return [
      { icon: Factory, label: '电炉短流程（废钢入炉）', value: eaf.toLocaleString(), unit: 'kgCO₂e/t粗钢', tone: 'blue' },
      { icon: Flame, label: '转炉长流程（铁水入炉）', value: bof.toLocaleString(), unit: 'kgCO₂e/t粗钢', tone: 'amber' },
      { icon: TrendingDown, label: '短流程相对降碳', value: cut, unit: '%', tone: 'green', highlight: true },
    ]
  }
  if (tab === '废钢回收站因子') {
    const active = rows.filter((r) => r.type === '废钢回收站因子' && r.active)
    const total = active.reduce((sum, r) => sum + r.value, 0)
    const stages = new Set(active.map((r) => r.category)).size
    return [
      { icon: Recycle, label: '站内综合因子（启用项合计）', value: total.toFixed(1), unit: 'kgCO₂e/t废钢', tone: 'blue', highlight: true },
      { icon: Zap, label: '主导能源', value: '电力', unit: '范围二为主', tone: 'green' },
      { icon: Warehouse, label: '覆盖作业环节', value: String(stages), unit: '类', tone: 'teal' },
    ]
  }
  if (tab === '改制加工因子') {
    const active = rows.filter((r) => r.type === '改制加工因子' && r.active)
    const total = active.reduce((sum, r) => sum + r.value, 0)
    const stages = new Set(active.map((r) => r.category)).size
    return [
      { icon: Recycle, label: '改制综合因子（启用项合计）', value: total.toFixed(1), unit: 'kgCO₂e/t钢材', tone: 'blue', highlight: true },
      { icon: Factory, label: '适用材料', value: '钢材类', unit: '现阶段', tone: 'amber' },
      { icon: Package, label: '覆盖加工环节', value: String(stages), unit: '类', tone: 'teal' },
    ]
  }
  if (tab === '整备因子') {
    const active = rows.filter((r) => r.type === '整备因子' && r.active)
    const total = active.reduce((sum, r) => sum + r.value, 0)
    const stages = new Set(active.map((r) => r.category)).size
    return [
      { icon: Factory, label: '整备综合因子（启用项合计）', value: total.toFixed(1), unit: 'kgCO₂e/t钢材', tone: 'blue', highlight: true },
      { icon: Recycle, label: '适用材料', value: '钢材类', unit: '现阶段', tone: 'green' },
      { icon: Scale, label: '覆盖整备环节', value: String(stages), unit: '类', tone: 'teal' },
    ]
  }
  return []
}

const TONE: Record<Highlight['tone'], string> = {
  blue: 'bg-[#e7f1ff] text-[#086de0]',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-emerald-50 text-emerald-600',
  teal: 'bg-teal-50 text-teal-600',
}

function SummaryStrip({ items }: { items: Highlight[] }) {
  return <div className="grid gap-4 sm:grid-cols-3">
    {items.map((item) => {
      const Icon = item.icon
      return <div key={item.label} className={cn('flex items-center gap-4 rounded-lg border bg-card p-4', item.highlight && 'border-[#9bc4ff] bg-[#eaf3ff]')}>
        <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-lg', TONE[item.tone])}><Icon className="size-5" /></span>
        <div className="min-w-0">
          <div className="truncate text-sm text-muted-foreground">{item.label}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tabular-nums text-foreground">{item.value}</span>
            <span className="text-xs text-muted-foreground">{item.unit}</span>
          </div>
        </div>
      </div>
    })}
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
    <thead className="bg-[#edf3fa] text-left"><tr>{['序号', '运输方式', '运输工具/车型', '能源类型', '运输因子(kgCO₂e/吨·公里)', '数据来源', '状态', '更新日期', '操作'].map((item) => <th key={item} className="whitespace-nowrap px-3 py-3 font-semibold">{item}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={row.id} className="border-t hover:bg-muted/30">
      <td className="px-3 py-3">{index + 1}</td><td className="px-3 py-3 font-medium"><span className={cn('inline-flex items-center gap-2', BLUE)}>{row.category === '陆运' ? <Truck className="size-4" /> : <Ship className="size-4" />}<span className="text-foreground">{row.category}</span></span></td><td className="px-3 py-3 font-medium">{row.name}</td><td className="px-3 py-3 text-muted-foreground">{row.energy === '电力' ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-600"><Zap className="size-3" />电力</span> : row.energy}</td><td className="px-3 py-3 text-right text-base font-semibold tabular-nums">{row.value.toFixed(4)}</td><td className="px-3 py-3 text-muted-foreground">{row.source}</td><Status active={row.active} /><td className="px-3 py-3 text-muted-foreground">{row.date}</td><Actions row={row} onEdit={onEdit} onToggle={onToggle} />
    </tr>)}</tbody>
  </table>
}

function ScopeTable({ rows, onEdit, onToggle, meta, catLabel, nameLabel, valueLabel }: { rows: Factor[]; onEdit: (row: Factor) => void; onToggle: (id: string) => void; meta: Record<string, { icon: typeof Zap; badge: string }>; catLabel: string; nameLabel: string; valueLabel: string }) {
  const fallback = Object.values(meta)[0]
  return <table className="w-full min-w-[1120px] whitespace-nowrap text-sm">
    <thead className="bg-[#edf3fa] text-left"><tr>{['序号', catLabel, nameLabel, '活动水平单位', valueLabel, '因子单位', '适用范围', '数据来源', '状态', '生效日期', '操作'].map((item) => <th key={item} className="whitespace-nowrap px-3 py-3 font-semibold">{item}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => {
      const m = meta[row.category] ?? fallback
      const Icon = m.icon
      return <tr key={row.id} className="border-t hover:bg-muted/30">
        <td className="px-3 py-3">{index + 1}</td>
        <td className="px-3 py-3"><span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', m.badge)}><Icon className="size-3" />{row.category}</span></td>
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
  const kind = editing?.type
  const isResource = kind === '资源因子'
  const isTransport = kind === '运输因子'
  const isSteel = kind === '废钢炼钢因子'
  const isStation = kind === '废钢回收站因子'
  const isReprocess = kind === '改制加工因子'
  const isPrep = kind === '整备因子'
  const isScopeFactor = isSteel || isStation || isReprocess || isPrep

  const labelMap: Record<FactorType, { cat: string; name: string; third: string; value: string }> = {
    资源因子: { cat: '物资类别', name: '物资名称', third: '规格型号', value: '碳因子值' },
    运输因子: { cat: '运输方式', name: '运输工具/车型', third: '能源类型', value: '碳因子值' },
    废钢炼钢因子: { cat: '能源类别', name: '能源/活动名称', third: '活动水平单位', value: '废钢炼钢因子值' },
    废钢回收站因子: { cat: '作业环节', name: '作业/设备名称', third: '活动水平单位', value: '回收站因子值' },
    改制加工因子: { cat: '加工环节', name: '加工工序/设备', third: '活动水平单位', value: '改制加工因子值' },
    整备因子: { cat: '整备环节', name: '整备工序/设备', third: '活动水平单位', value: '整备因子值' },
  }
  const catOptionsMap: Record<FactorType, string[]> = {
    资源因子: ['脚手架类', '支护类', '模板类'],
    运输因子: ['陆运', '水运', '铁路'],
    废钢炼钢因子: ['废钢改制加工', '炼钢工序', '炼铁工序', '能源介质'],
    废钢回收站因子: ['收购计量', '装卸搬运', '分拣加工', '堆场仓储', '站内短驳'],
    改制加工因子: ['预处理', '剪切破碎', '压块打包'],
    整备因子: ['表面处理', '结构加工', '检测维修'],
  }
  const scopeOptions = isStation
    ? ['站内作业（范围一）', '站内作业（范围二）']
    : isReprocess
      ? ['改制加工（范围一）', '改制加工（范围二）']
      : isPrep
        ? ['出租整备（范围一）', '出租整备（范围二）']
        : ['改制预处理（范围一）', '改制预处理（范围二）', '炼钢工序（废钢入炉）', '炼钢工序（铁水入炉）', '炼铁工序（范围一）', '烧结工序（范围一）', '燃料燃烧（范围一）', '外购电力（范围二）']

  // 运输工具/车型、能源类型：按运输方式联动可选
  const vehicleOptions: Record<string, string[]> = {
    陆运: ['重型柴油货车（≥18t）', '中型柴油货车（8-18t）', '轻型柴油货车（<8t）', '新能源电动重卡', 'LNG 天然气货车'],
    水运: ['内河散货船（1000t级）', '沿海散货船（5000t级）', '江海直达船（万吨级）'],
    铁路: ['铁路敞车（C70）', '铁路平车', '电力机车牵引', '内燃机车牵引'],
  }
  const energyOptions: Record<string, string[]> = {
    陆运: ['柴油', '汽油', '电力', '天然气'],
    水运: ['燃油', '柴油', 'LNG'],
    铁路: ['电力', '柴油'],
  }
  const vehicles = vehicleOptions[editing?.category ?? '陆运'] ?? vehicleOptions['陆运']
  const energies = energyOptions[editing?.category ?? '陆运'] ?? energyOptions['陆运']

  const labels = kind ? labelMap[kind] : labelMap['资源因子']
  const catOptions = kind ? catOptionsMap[kind] : catOptionsMap['资源因子']

  return <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{editing?.name ? '编辑因子' : '新增因子'}</DialogTitle><DialogDescription>维护因子基础信息、数据来源和适用边界。</DialogDescription></DialogHeader>{editing && <div className="grid gap-4">
    <div className="grid gap-4 sm:grid-cols-2"><Field label={labels.cat}><select value={editing.category} onChange={(event) => { const nextCat = event.target.value; if (isTransport) { setEditing({ ...editing, category: nextCat, name: '', model: '', energy: '' }) } else { setEditing({ ...editing, category: nextCat }) } }} className="h-10 rounded-md border bg-background px-3">{catOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><Field label={labels.name}>{isTransport ? <select value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="h-10 rounded-md border bg-background px-3"><option value="">请选择运输工具/车型</option>{vehicles.map((item) => <option key={item} value={item}>{item}</option>)}</select> : <Input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />}</Field></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label={labels.third}>{isScopeFactor ? <Input value={editing.activityUnit || ''} onChange={(event) => setEditing({ ...editing, activityUnit: event.target.value })} placeholder={isStation ? '如 t废钢' : '如 t粗钢 / t铁水 / kWh / t'} /> : isTransport ? <select value={editing.energy || ''} onChange={(event) => setEditing({ ...editing, energy: event.target.value, model: event.target.value })} className="h-10 rounded-md border bg-background px-3"><option value="">请选择能源类型</option>{energies.map((item) => <option key={item} value={item}>{item}</option>)}</select> : <Input value={editing.model} onChange={(event) => setEditing({ ...editing, model: event.target.value, energy: isResource ? editing.energy : event.target.value })} />}</Field><Field label={labels.value}><Input type="number" value={editing.value} onChange={(event) => setEditing({ ...editing, value: Number(event.target.value) })} /></Field></div>
    {isScopeFactor && <div className="grid gap-4 sm:grid-cols-2"><Field label="因子单位"><Input value={editing.unit} onChange={(event) => setEditing({ ...editing, unit: event.target.value })} placeholder={isStation ? '如 kgCO₂e/t废钢' : '如 kgCO₂e/t粗钢'} /></Field><Field label="适用范围"><select value={editing.scope || ''} onChange={(event) => setEditing({ ...editing, scope: event.target.value })} className="h-10 rounded-md border bg-background px-3">{scopeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field></div>}
    {isScopeFactor && <Field label="能源类型"><Input value={editing.energy || ''} onChange={(event) => setEditing({ ...editing, energy: event.target.value })} placeholder="如 电力 / 柴油 / 天然气 / 焦炭" /></Field>}
    {isResource && <section className="rounded-lg border bg-muted/30 p-4"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-semibold"><Calculator className="size-4 text-[#086de0]" />废钢等效矿石折算</div><p className="mt-1 text-xs text-muted-foreground">默认不折算。仅钢材类资源按需启用。</p></div><Switch checked={editing.conversionEnabled || false} onCheckedChange={(checked) => setEditing({ ...editing, conversionEnabled: checked })} aria-label="启用废钢等效矿石折算" /></div>{editing.conversionEnabled && <div className="mt-4 grid gap-4"><Field label="铁矿石类型"><select value={editing.conversionTarget || '磁铁矿'} onChange={(event) => setEditing({ ...editing, conversionTarget: event.target.value as Factor['conversionTarget'] })} className="h-10 rounded-lg border bg-background px-3 outline-none focus:border-[#086de0]">{['磁铁矿', '赤铁矿', '褐铁矿', '菱铁矿'].map((ore) => <option key={ore} value={ore}>{ore}</option>)}</select></Field><div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3"><Field label="废钢基准量（吨）"><Input type="number" value={editing.scrapBasis || 100} onChange={(event) => setEditing({ ...editing, scrapBasis: Number(event.target.value) })} /></Field><span className="pb-2 text-sm text-muted-foreground">可抵</span><Field label={`${editing.conversionTarget || '磁铁矿'}等效量（吨）`}><Input type="number" value={editing.oreEquivalent || 80} onChange={(event) => setEditing({ ...editing, oreEquivalent: Number(event.target.value) })} /></Field></div><div className="rounded-md border border-[#9bc4ff] bg-[#eaf3ff] p-3 text-sm text-[#086de0]"><Info className="mr-2 inline size-4" />100 吨{editing.name || '废钢'}可折算 {(((editing.oreEquivalent || 0) / (editing.scrapBasis || 1)) * 100).toFixed(2)} 吨{editing.conversionTarget || '磁铁矿'}</div></div>}</section>}
    <Field label="数据来源"><Input value={editing.source} onChange={(event) => setEditing({ ...editing, source: event.target.value })} /></Field>
  </div>}<DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>取消</Button><Button className="bg-[#086de0] hover:bg-[#075fc5]" disabled={!editing?.name} onClick={onSave}>保存</Button></DialogFooter></DialogContent></Dialog>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label> }
