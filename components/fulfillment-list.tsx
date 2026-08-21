'use client'

import { useState } from 'react'
import {
  Search,
  RefreshCw,
  Send,
  Eye,
  ShieldCheck,
  FilePlus2,
  X,
  AlertTriangle,
  CircleCheck,
  Leaf,
  Activity,
  MinusCircle,
  FileCheck,
} from 'lucide-react'
import {
  FulfillmentDetail,
  type FulfillmentProject,
} from '@/components/fulfillment-detail'
import {
  CarbonCertificate,
  type CarbonCertProject,
} from '@/components/carbon-certificate'

type CarbonState = 'estimating' | 'accounted' | 'pending'

type ProjectRow = {
  code: string
  title: string
  flowType: string
  stage: string
  stageTone: 'blue' | 'green'
  signupStart: string
  signupEnd: string
  // 'issued' 已核发碳凭证，可直接查看；'generate' 待生成，需先补充信息
  certState?: 'issued' | 'generate'
  pendingItems?: string[]
  // 碳减排：estimating 本条项目预估中；accounted 已核算实际值；pending 信息不全待核算
  carbonState: CarbonState
  carbonValue?: number // tCO₂e
  // 供应商录入提货单时标记为新品：新品无回收再利用减排，采购方履约结束不体现碳减排量与碳凭证
  isNewProduct?: boolean
  // 履约结束后展示的资源名称
  resourceName?: string
  // 出租方履约结束：资源规格、该资源第几次出租、本次退还后重新过磅的重量（吨）
  resourceSpec?: string
  rentalSeq?: number
  weight?: number
}

const ACTIVE_PROJECTS: ProjectRow[] = [
  {
    code: '2089616559671742464',
    title: '盘扣式脚手架周转出租（第三批）',
    flowType: '出租',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-18 15:31:42',
    signupEnd: '2026-08-18 17:00:00',
    carbonState: 'estimating',
    carbonValue: 45.2,
    resourceName: '盘扣式脚手架',
    resourceSpec: 'Q355 / Φ60×3.2mm',
    rentalSeq: 3,
    weight: 130.20,
  },
  {
    code: '2089230162376921088',
    title: '贝雷片出租测试',
    flowType: '出租',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-17 00:00:00',
    signupEnd: '2026-08-17 14:29:00',
    carbonState: 'estimating',
    carbonValue: 12.8,
    resourceName: '贝雷片',
    resourceSpec: '321型 / 3.0m',
    rentalSeq: 5,
    weight: 52.30,
  },
  {
    code: '2088517041526018048',
    title: '8.15出租',
    flowType: '出租',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-15 00:00:00',
    signupEnd: '2026-08-16 00:00:00',
    carbonState: 'estimating',
    carbonValue: 8.6,
    resourceName: '钢管脚手架',
    resourceSpec: 'Φ48×3.5mm',
    rentalSeq: 6,
    weight: 85.40,
  },
]

const ENDED_PROJECTS: ProjectRow[] = [
  {
    code: '2087742971482083328',
    title: '常州市鼓楼区综合管廊物资出租',
    flowType: '出租',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-07-13 11:25:05',
    signupEnd: '2026-07-14 00:00:00',
    certState: 'issued',
    carbonState: 'accounted',
    carbonValue: 181.08,
    resourceName: '盘扣式脚手架',
    resourceSpec: 'Q355 / Φ60×3.2mm',
    rentalSeq: 2,
    weight: 126.85,
  },
  {
    code: '2087441038265520128',
    title: '南京地铁5号线管廊物资出租',
    flowType: '出租',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-05-20 10:05:00',
    signupEnd: '2026-05-21 00:00:00',
    certState: 'issued',
    carbonState: 'accounted',
    carbonValue: 172.44,
    resourceName: '盘扣式脚手架',
    resourceSpec: 'Q355 / Φ60×3.2mm',
    rentalSeq: 1,
    weight: 128.60,
  },
  {
    code: '2087111470823018400',
    title: '钢材周转料出租项目',
    flowType: '出租',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-07-05 09:10:00',
    signupEnd: '2026-07-08 00:00:00',
    certState: 'generate',
    pendingItems: [
      '补充各批次运输信息（承运方式、运输距离、能源类型等）',
      '上传对应批次的过磅单附件',
    ],
    carbonState: 'pending',
    resourceName: '钢管脚手架',
    resourceSpec: 'Φ48×3.5mm',
    rentalSeq: 5,
    weight: 83.72,
  },
  {
    code: '2086901355420188160',
    title: '轨枕批量出租（第二批）',
    flowType: '出租',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-06-28 14:00:00',
    signupEnd: '2026-06-30 00:00:00',
    certState: 'generate',
    pendingItems: ['补充开具发票信息（发票抬头、税号、开票金额等）'],
    carbonState: 'pending',
    resourceName: '预应力混凝土轨枕',
    resourceSpec: 'Ⅲ型 / 2.6m',
    rentalSeq: 2,
    weight: 214.00,
  },
  {
    code: '2086331209988110336',
    title: '设备租赁一批',
    flowType: '出租',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-06-15 10:20:00',
    signupEnd: '2026-06-18 00:00:00',
    certState: 'issued',
    carbonState: 'accounted',
    carbonValue: 96.42,
    resourceName: '贝雷片',
    resourceSpec: '321型 / 3.0m',
    rentalSeq: 4,
    weight: 51.05,
  },
]

const DISPOSAL_ACTIVE_PROJECTS: ProjectRow[] = [
  {
    code: '2089891097840062464',
    title: '批量物资处置（5项）',
    flowType: '转让',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-19 09:33:09',
    signupEnd: '2026-08-20 00:00:00',
    carbonState: 'estimating',
    carbonValue: 62.4,
    resourceName: '废旧钢材',
    resourceSpec: 'Q235 / 混合规格',
    weight: 320.50,
  },
  {
    code: '2089616559671742464',
    title: '批量物资处置（3项）',
    flowType: '转让',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-18 15:31:42',
    signupEnd: '2026-08-18 17:00:00',
    carbonState: 'estimating',
    carbonValue: 28.7,
    resourceName: '废旧轨枕',
    resourceSpec: 'Ⅱ型 / 2.5m',
    weight: 186.00,
  },
  {
    code: '2089625006320521216',
    title: '处置0808（废旧钢材转让）',
    flowType: '转让',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-18 16:06:19',
    signupEnd: '2026-08-18 16:24:00',
    carbonState: 'estimating',
    carbonValue: 15.3,
    resourceName: '废旧钢材',
    resourceSpec: 'Q235 / 统料',
    weight: 95.30,
  },
]

const DISPOSAL_ENDED_PROJECTS: ProjectRow[] = [
  {
    code: '2087742971482083328',
    title: '常州市鼓楼区综合管廊物资转让',
    flowType: '转让',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-07-13 11:25:05',
    signupEnd: '2026-07-14 00:00:00',
    certState: 'issued',
    carbonState: 'accounted',
    carbonValue: 154.36,
    resourceName: '废旧钢管',
    resourceSpec: 'Φ60×3.2mm',
    weight: 142.80,
  },
  {
    code: '2086901355420188160',
    title: '轨枕批量转让（第二批）',
    flowType: '转让',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-06-28 14:00:00',
    signupEnd: '2026-06-30 00:00:00',
    certState: 'generate',
    pendingItems: [
      '补充受让方提货运输信息（承运方式、运输距离、能源类型等）',
      '上传交付批次的过磅单与签收单附件',
    ],
    carbonState: 'pending',
    resourceName: '废旧轨枕',
    resourceSpec: 'Ⅲ型 / 2.6m',
    weight: 208.40,
  },
  {
    code: '2086331209988110336',
    title: '废旧设备整体转让一批',
    flowType: '转让',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-06-15 10:20:00',
    signupEnd: '2026-06-18 00:00:00',
    certState: 'issued',
    carbonState: 'accounted',
    carbonValue: 88.15,
    resourceName: '废旧设备',
    resourceSpec: '综合规格',
    weight: 76.20,
  },
]

const PROCUREMENT_ACTIVE_PROJECTS: ProjectRow[] = [
  {
    code: '2089901220553201664',
    title: '葫芦再生资源采购项目标段02（废旧钢轨）',
    flowType: '网上询价',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-19 10:12:33',
    signupEnd: '2026-08-20 12:00:00',
    carbonState: 'estimating',
    carbonValue: 52.6,
    resourceName: '废旧钢轨',
    resourceSpec: '43kg/m',
    weight: 245.60,
  },
  {
    code: '2089733048921640960',
    title: '废旧周转材料回收采购（第一批）',
    flowType: '公开招标',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-18 09:00:00',
    signupEnd: '2026-08-19 18:00:00',
    carbonState: 'estimating',
    carbonValue: 33.9,
    resourceName: '废旧周转料',
    resourceSpec: '混合规格',
    weight: 132.40,
  },
  {
    code: '2089610033982070784',
    title: '拆解废钢定向采购',
    flowType: '定向采购',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-17 14:20:00',
    signupEnd: '2026-08-18 14:20:00',
    carbonState: 'estimating',
    carbonValue: 18.4,
    resourceName: '拆解废钢',
    resourceSpec: '统料',
    weight: 88.70,
  },
]

const PROCUREMENT_ENDED_PROJECTS: ProjectRow[] = [
  {
    code: '2088930561120388096',
    title: '轨道备品备件新件集中采购',
    flowType: '网上询价',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-07-25 09:00:00',
    signupEnd: '2026-07-26 12:00:00',
    carbonState: 'pending',
    isNewProduct: true,
    resourceName: '轨道备品备件（新件）',
    resourceSpec: '标准件',
    weight: 64.20,
  },
  {
    code: '2088521470033289216',
    title: '轨道拆换废旧钢轨集中采购（第二批）',
    flowType: '公开招标',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-07-20 09:30:00',
    signupEnd: '2026-07-22 12:00:00',
    certState: 'generate',
    pendingItems: [
      '补充供货方过磅信息（供货重量、过磅单、验收单等）',
      '补充送货运输信息（承运方式、运输距离、能源类型等）',
      '补充物资回收利用去向信息（再利用方式、回收企业等）',
    ],
    carbonState: 'pending',
    resourceName: '废旧钢轨',
    resourceSpec: '50kg/m',
    weight: 312.50,
  },
  {
    code: '2087760012480083200',
    title: '综合管廊废旧物资回收采购',
    flowType: '网上询价',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-07-12 10:00:00',
    signupEnd: '2026-07-13 12:00:00',
    certState: 'issued',
    carbonState: 'accounted',
    carbonValue: 168.72,
    resourceName: '废旧金属管材',
    resourceSpec: 'DN200 混合',
    weight: 158.30,
  },
  {
    code: '2087009471823018100',
    title: '废旧钢材竞争性谈判采购',
    flowType: '竞争性谈判',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-07-04 09:10:00',
    signupEnd: '2026-07-06 00:00:00',
    certState: 'generate',
    pendingItems: [
      '补充供货方过磅信息（供货重量、过磅单、验收单等）',
      '补充送货运输信息（承运方式、运输距离、能源类型等）',
    ],
    carbonState: 'pending',
    resourceName: '废旧钢材',
    resourceSpec: 'Q235 混合',
    weight: 276.40,
  },
  {
    code: '2086208209988110300',
    title: '再生金属集中采购一批',
    flowType: '公开招标',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-06-14 10:20:00',
    signupEnd: '2026-06-17 00:00:00',
    certState: 'issued',
    carbonState: 'accounted',
    carbonValue: 102.35,
    resourceName: '再生金属',
    resourceSpec: '统料',
    weight: 189.60,
  },
]

const STAGE_TONE: Record<ProjectRow['stageTone'], string> = {
  blue: 'bg-chart-4/15 text-chart-4',
  green: 'bg-primary/12 text-primary',
}

export function FulfillmentList({
  variant,
  mode = 'rental',
}: {
  variant: 'active' | 'ended'
  mode?:
    | 'rental'
    | 'disposal'
    | 'procurement'
    | 'procurement-buyer'
    | 'disposal-transferee'
    | 'rental-lessee'
    | 'procurement-scrap'
    | 'procurement-scrap-buyer'
}) {
  const isEnded = variant === 'ended'
  // 受让方（处置收货方）：使用处置数据与处置方式筛选，但以收货视角履约
  const isTransferee = mode === 'disposal-transferee'
  // 承租方（出租收货方）：使用出租数据与流转方式筛选，但以收货视角履约
  const isLessee = mode === 'rental-lessee'
  // 受让方 / 承租方共用「收货方」行为：进行中显示履约、结束显示查看
  // 承租方展示碳减排量但无碳凭证；受让方碳凭证归属受让方（见下方 isTransferor）
  const isSelfReceiver = isTransferee || isLessee
  const isDisposal = mode === 'disposal' || isTransferee
  // 转让方（发起处置转让的一方）：仅体现碳减排贡献，碳凭证归属受让方、不再由转让方核发
  const isTransferor = mode === 'disposal'
  // 钢厂回收：实质为采购废钢（再生资源），复用采购模式的全部行为
  const isScrap =
    mode === 'procurement-scrap' || mode === 'procurement-scrap-buyer'
  const isBuyer = mode === 'procurement-buyer' || mode === 'procurement-scrap-buyer'
  // 供应商（供货方）展示「碳减排贡献」，采购方（收货方）展示「碳减排量」，均需碳核算
  const isSupplier = mode === 'procurement' || mode === 'procurement-scrap'
  const isProcurement = isSupplier || isBuyer
  const hideCarbon = false
  // 出租方（发起出租的一方）：非采购、非收货方、非处置
  const isLessor = !isProcurement && !isSelfReceiver && !isDisposal
  // 全部角色在履约与履约结束均展示：资源名称、资源规格、重量（吨）
  const showResourceCol = true
  const rawProjects = isProcurement
    ? isEnded
      ? PROCUREMENT_ENDED_PROJECTS
      : PROCUREMENT_ACTIVE_PROJECTS
    : isDisposal
      ? isEnded
        ? DISPOSAL_ENDED_PROJECTS
        : DISPOSAL_ACTIVE_PROJECTS
      : isEnded
        ? ENDED_PROJECTS
        : ACTIVE_PROJECTS
  // 所有模块统一隐藏指定项目编号的行信息
  const HIDDEN_CODES = ['2088930561120388096']
  const projects = rawProjects.filter((p) => !HIDDEN_CODES.includes(p.code))
  const stageLabel = isEnded ? '履约结束' : '履约'

  const [detailProject, setDetailProject] =
    useState<FulfillmentProject | null>(null)
  const [certProject, setCertProject] = useState<CarbonCertProject | null>(null)
  const [generateProject, setGenerateProject] = useState<ProjectRow | null>(
    null,
  )

  const openDetail = (p: ProjectRow) => {
    setDetailProject({
      code: p.code,
      title: p.title,
      flowType: p.flowType,
      buyer: isLessee
        ? '广州铁路设备租赁有限公司'
        : isTransferee
          ? '中国铁路广州局集团有限公司'
          : isBuyer
            ? '中铁物资物流集团华南有限公司'
            : isProcurement
              ? '葫芦再生资源有限公司'
              : '广州资源回收有限公司',
      buyerUnitId: isLessee
        ? '2084471203355600896'
        : isTransferee
          ? '2083390561200410880'
          : isBuyer
            ? '2085512034789001120'
            : isProcurement
              ? '2089900011456320011'
              : '2087787291144753153',
      status: isEnded ? '履约结束' : '履约通过',
      period: `${p.signupStart} ~ ${p.signupEnd}`,
    })
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* 筛选区 */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <FilterField label="项目编号">
            <input
              placeholder="请输入"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </FilterField>
          <FilterField label="项目标题">
            <input
              placeholder="请输入"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </FilterField>
          <FilterField
            label={
              isProcurement ? '采购方式' : isDisposal ? '处置方式' : '流转方式'
            }
          >
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground outline-none">
              {isProcurement ? (
                <>
                  <option>全部</option>
                  <option>网上询价</option>
                  <option>公开招标</option>
                  <option>竞争性谈判</option>
                  <option>定向采购</option>
                </>
              ) : isDisposal ? (
                <>
                  <option>全部</option>
                  <option>整体转让</option>
                  <option>拆分转让</option>
                  <option>报废处置</option>
                </>
              ) : (
                <>
                  <option>全部</option>
                  <option>网络竞价</option>
                  <option>定向出租</option>
                </>
              )}
            </select>
          </FilterField>
          <FilterField label="当前环节">
            <select
              defaultValue={stageLabel}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            >
              <option>挂牌待审核</option>
              <option>报名</option>
              <option>成交确认</option>
              <option>履约</option>
              <option>履约结束</option>
            </select>
          </FilterField>
          <FilterField label="是否终结">
            <select
              defaultValue={isEnded ? '是' : '全部'}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground outline-none"
            >
              <option>全部</option>
              <option>是</option>
              <option>否</option>
            </select>
          </FilterField>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="size-4" />
            查询
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <RefreshCw className="size-4" />
            重置
          </button>
        </div>
      </section>

      {/* 列表区 */}
      <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card shadow-sm">
        {/* 操作按钮：仅发起方（出租方 / 转让方 / 采购方）显示发起入口；
            收货方（受让方 / 承租方 / 供应商）不显示 */}
        {((!isEnded && ((!isProcurement && !isSelfReceiver) || isBuyer)) ||
          (isEnded && isLessor)) && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <button
              type="button"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Send className="size-4" />
              {isBuyer ? '发起采购' : isDisposal ? '发起自主转让' : '发起自主出租'}
            </button>
          </div>
        )}

        {/* 表格 */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">项目编号</th>
                <th className="px-4 py-3 font-medium">项目标题</th>
                {showResourceCol && (
                  <th className="px-4 py-3 font-medium">资源名称</th>
                )}
                <th className="px-4 py-3 font-medium">
                  {isProcurement ? '采购方式' : isDisposal ? '处置方式' : '流转方式'}
                </th>
                <th className="px-4 py-3 font-medium">当前环节</th>
                {showResourceCol && (
                  <th className="px-4 py-3 font-medium">资源规格</th>
                )}
                {showResourceCol && (
                  <th className="px-4 py-3 font-medium">重量(吨)</th>
                )}
                <th className="px-4 py-3 font-medium">报名开始</th>
                <th className="px-4 py-3 font-medium">报名截止</th>
                {!hideCarbon && (
                  <th className="px-4 py-3 font-medium">
                    {isTransferor || isLessor || isSupplier ? '碳减排贡献' : '碳减排量'}
                  </th>
                )}
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      (hideCarbon ? 7 : 8) +
                      (showResourceCol ? 3 : 0)
                    }
                    className="px-4 py-16 text-center text-sm text-muted-foreground"
                  >
                    暂无符合条件的项目
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr
                    key={p.code}
                    className="border-t border-border transition-colors hover:bg-accent/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">
                      {p.code}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">{p.title}</td>
                    {showResourceCol && (
                      <td className="whitespace-nowrap px-4 py-3 text-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          {p.resourceName ?? '—'}
                          {p.isNewProduct && !isScrap && (
                            <span
                              className="inline-flex size-4 items-center justify-center rounded bg-chart-5/15 text-[10px] font-semibold text-chart-5"
                              title="新品"
                              aria-label="新品"
                            >
                              新
                            </span>
                          )}
                        </span>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">{p.flowType}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${STAGE_TONE[p.stageTone]}`}
                      >
                        {p.stage}
                      </span>
                    </td>
                    {showResourceCol && (
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {p.resourceSpec ?? '—'}
                      </td>
                    )}
                    {showResourceCol && (
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums font-medium text-foreground">
                        {p.weight?.toFixed(2) ?? '—'}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                      {p.signupStart}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                      {p.signupEnd}
                    </td>
                    {!hideCarbon && (
                      <td className="whitespace-nowrap px-4 py-3">
                        {p.isNewProduct && !isScrap ? (
                          <span className="inline-flex w-fit items-center rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            新品 · 不核算
                          </span>
                        ) : (
                          <CarbonCell
                            state={p.carbonState}
                            value={p.carbonValue}
                          />
                        )}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* 采购方履约结束仅展示碳凭证，不再有查看入口 */}
                        {!(isBuyer && isEnded) && (
                          <button
                            type="button"
                            onClick={() => openDetail(p)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            {(isProcurement && !isEnded) ||
                            (isSelfReceiver && !isEnded) ? (
                              <FileCheck className="size-3.5" />
                            ) : (
                              <Eye className="size-3.5" />
                            )}
                            {isProcurement
                              ? isEnded
                                ? '查看'
                                : '履约'
                              : isSelfReceiver
                                ? isEnded
                                  ? '查看'
                                  : '履约'
                                : '管理项目'}
                          </button>
                        )}
                        {/* 出租方碳凭证归属承租方、转让方碳凭证归属受让方，此处均不核发；承租方（收货方）碳凭证见下方入口 */}
                        {isEnded &&
                          !isProcurement &&
                          !isSelfReceiver &&
                          !isTransferor &&
                          !isLessor &&
                          (p.certState === 'generate' ? (
                            <button
                              type="button"
                              onClick={() => setGenerateProject(p)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-chart-5 transition-colors hover:text-chart-5/80"
                            >
                              <FilePlus2 className="size-3.5" />
                              生成碳凭证
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setCertProject({ code: p.code, title: p.title })
                              }
                              className="inline-flex items-center gap-1 text-sm font-medium text-chart-4 transition-colors hover:text-chart-4/80"
                            >
                              <ShieldCheck className="size-3.5" />
                              碳凭证
                            </button>
                          ))}
                        {/* 采购方（收货方）履约结束的碳凭证入口：新品不核算碳，不体现碳凭证 */}
                        {isEnded &&
                          isBuyer &&
                          (!p.isNewProduct || isScrap) &&
                          (p.certState === 'generate' ? (
                            <button
                              type="button"
                              onClick={() => setGenerateProject(p)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-chart-5 transition-colors hover:text-chart-5/80"
                            >
                              <FilePlus2 className="size-3.5" />
                              生成碳凭证
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setCertProject({ code: p.code, title: p.title })
                              }
                              className="inline-flex items-center gap-1 text-sm font-medium text-chart-4 transition-colors hover:text-chart-4/80"
                            >
                              <ShieldCheck className="size-3.5" />
                              碳凭证
                            </button>
                          ))}
                        {/* 收货方（受让方 / 承租方）履约结束的碳凭证入口：转让/出租业务碳凭证分别归属受让方 / 承租方 */}
                        {isEnded &&
                          isSelfReceiver &&
                          (p.certState === 'generate' ? (
                            <button
                              type="button"
                              onClick={() => setGenerateProject(p)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-chart-5 transition-colors hover:text-chart-5/80"
                            >
                              <FilePlus2 className="size-3.5" />
                              生成碳凭证
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setCertProject({ code: p.code, title: p.title })
                              }
                              className="inline-flex items-center gap-1 text-sm font-medium text-chart-4 transition-colors hover:text-chart-4/80"
                            >
                              <ShieldCheck className="size-3.5" />
                              碳凭证
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>共 {projects.length} 条</span>
          <select className="rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none">
            <option>10条/页</option>
            <option>20条/页</option>
            <option>50条/页</option>
          </select>
          <div className="flex items-center gap-1">
            <PageBtn disabled>‹</PageBtn>
            <PageBtn active>1</PageBtn>
            <PageBtn disabled>›</PageBtn>
          </div>
          <div className="flex items-center gap-1.5">
            <span>前往</span>
            <input
              defaultValue={1}
              className="w-12 rounded-md border border-input bg-background px-2 py-1 text-center text-sm outline-none"
              aria-label="跳转页码"
            />
            <span>页</span>
          </div>
        </div>
      </section>

      <FulfillmentDetail
        open={detailProject !== null}
        project={detailProject}
        mode={mode}
        onClose={() => setDetailProject(null)}
      />

      <CarbonCertificate
        open={certProject !== null}
        project={certProject}
        mode={
          isProcurement
            ? 'procurement'
            : isTransferee
              ? 'disposal'
              : isLessee
                ? 'rental'
                : mode
        }
        onClose={() => setCertProject(null)}
      />

      <GenerateCertPrompt
        project={generateProject}
        onClose={() => setGenerateProject(null)}
      />
    </div>
  )
}

function GenerateCertPrompt({
  project,
  onClose,
}: {
  project: ProjectRow | null
  onClose: () => void
}) {
  if (!project) return null
  const items = project.pendingItems ?? []

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="生成碳凭证"
    >
      <button
        type="button"
        aria-label="关闭弹窗"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <FilePlus2 className="size-4 text-chart-5" />
            <h2 className="text-base font-semibold text-foreground">
              生成碳凭证
            </h2>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">关联项目</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {project.title}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {project.code}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-chart-5/30 bg-chart-5/10 px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-chart-5" />
            <div className="text-sm text-foreground">
              <p className="font-medium">该项目暂不满足碳凭证生成条件</p>
              <p className="mt-0.5 text-muted-foreground">
                生成碳凭证前，请先补充以下信息：
              </p>
            </div>
          </div>

          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it} className="flex items-start gap-2 text-sm">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-foreground">{it}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            稍后处理
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            去补充信息
          </button>
        </div>
      </div>
    </div>
  )
}

function CarbonCell({
  state,
  value,
}: {
  state: CarbonState
  value?: number
}) {
  const fmt = (v: number) =>
    v.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  if (state === 'accounted') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1 font-medium text-primary">
          <Leaf className="size-3.5 shrink-0 translate-y-0.5" />
          <span className="tabular-nums">{fmt(value ?? 0)}</span>
          <span className="text-xs font-normal text-muted-foreground">
            tCO₂e
          </span>
        </div>
        <span className="inline-flex w-fit items-center rounded bg-primary/12 px-1.5 py-0.5 text-[11px] font-medium text-primary">
          已核算
        </span>
      </div>
    )
  }

  if (state === 'estimating') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1 font-medium text-chart-4">
          <Activity className="size-3.5 shrink-0 translate-y-0.5" />
          <span className="tabular-nums">≈ {fmt(value ?? 0)}</span>
          <span className="text-xs font-normal text-muted-foreground">
            tCO₂e
          </span>
        </div>
        <span className="inline-flex w-fit items-center rounded bg-chart-4/15 px-1.5 py-0.5 text-[11px] font-medium text-chart-4">
          预估中
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-muted-foreground">
        <MinusCircle className="size-3.5 shrink-0" />
        <span className="text-sm">待核算</span>
      </div>
      <span className="inline-flex w-fit items-center rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
        待补充信息
      </span>
    </div>
  )
}

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[5rem_1fr] items-center gap-3">
      <label className="text-right text-sm text-muted-foreground">
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function PageBtn({
  children,
  active,
  disabled,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex size-8 items-center justify-center rounded-md border text-sm transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background text-foreground hover:bg-accent disabled:opacity-40 disabled:hover:bg-background'
      }`}
    >
      {children}
    </button>
  )
}
