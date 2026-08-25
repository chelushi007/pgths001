'use client'

import { useEffect, useRef, useState } from 'react'
import {
  X,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  FileText,
  Truck,
  Scale,
  MapPin,
  Navigation,
  CircleDot,
  Recycle,
} from 'lucide-react'

export type FulfillmentProject = {
  code: string
  title: string
  flowType: string
  buyer: string
  buyerUnitId: string
  status: string
  period: string
}

// 废钢等效矿石折算：以磁铁矿 100:80 为基准，按各类矿石平均含铁品位换算等效开采重量
// 品位越低，等效开采的矿石重量越多（factor = 单位净重废钢对应的矿石吨数）
const ORE_TYPES = [
  { type: '磁铁矿', grade: 72, factor: 0.80 },
  { type: '赤铁矿', grade: 70, factor: 0.82 },
  { type: '褐铁矿', grade: 58, factor: 0.99 },
  { type: '菱铁矿', grade: 48, factor: 1.20 },
] as const
type OreType = (typeof ORE_TYPES)[number]['type']

// 受让方「改制加工」板块选项
const REPROCESS_TYPES = ['分拣', '剪切', '打包', '破碎', '拆解', '其他'] as const
const REPROCESS_DESTINATIONS = [
  '钢厂',
  '再生资源加工厂',
  '铸造厂',
  '其他企业',
  '暂不确定',
] as const
const REPROCESS_TRANSPORTS = ['陆运', '水运', '铁路运输'] as const

const STEPS = ['正式挂牌', '报名审核', '报价', '成交确认', '履约']

type PaymentRow = {
  no: string
  amount: string
  payer: string
  payee: string
  method: string
  status: string
  time: string
  remark: string
}

type ContractRow = {
  no: string
  partyA: string
  partyB: string
  amount: string
  remark: string
  status: string
  statusTone: 'amber' | 'green'
}

type TransportType = '陆运' | '水运'

export type LogisticsRow = {
  id: string
  type: TransportType
  logisticsNo: string
  carrier: string
  contact: string
  phone: string
  distance: string
  departureAt: string
  arrivalAt: string
  plateNo: string
  driverName: string
  vesselName: string
  vesselId: string
}

type PickupRow = {
  no: string
  buyer: string
  logistics: LogisticsRow[]
  createdAt: string
  pickupAt: string
  status: string
  statusTone: 'green' | 'amber'
}

const PAYMENTS: PaymentRow[] = [
  {
    no: '2089619545626100000',
    amount: '¥20',
    payer: '广州资源回收有限公司',
    payee: '演示集团',
    method: '线下支付',
    status: '已确认',
    time: '2026-08-18 15:44:58',
    remark: '成交款',
  },
]

const CONTRACTS: ContractRow[] = [
  {
    no: '2089619847951552512',
    partyA: '演示集团',
    partyB: '广州资源回收有限公司',
    amount: '¥20',
    remark: '-',
    status: '待乙方签署',
    statusTone: 'amber',
  },
]

const INITIAL_PICKUPS: PickupRow[] = [
  {
    no: '2089619994710070400',
    buyer: '广州资源回收有限公司',
    logistics: [
      {
        id: 'logistics-1',
        type: '陆运',
        logisticsNo: 'YD20260818000041',
        carrier: '粤运物流有限公司',
        contact: '李师傅',
        phone: '13800001234',
        distance: '68',
        departureAt: '2026-08-18 08:12',
        arrivalAt: '2026-08-18 15:38',
        plateNo: '粤A·D8856',
        driverName: '李建国',
        vesselName: '',
        vesselId: '',
      },
      {
        id: 'logistics-2',
        type: '水运',
        logisticsNo: 'SY20260818000009',
        carrier: '珠江航运有限公司',
        contact: '陈船长',
        phone: '13900005678',
        distance: '120',
        departureAt: '2026-08-18 16:00',
        arrivalAt: '2026-08-19 09:20',
        plateNo: '',
        driverName: '',
        vesselName: '珠航货0231',
        vesselId: 'CN2026080231',
      },
    ],
    createdAt: '2026-08-18 15:46:33',
    pickupAt: '2026-08-18 15:46:51',
    status: '已完成',
    statusTone: 'green',
  },
  {
    no: '2089620399548665000',
    buyer: '广州资源回收有限公司',
    logistics: [
      {
        id: 'logistics-3',
        type: '陆运',
        logisticsNo: 'YD20260818000053',
        carrier: '粤运物流有限公司',
        contact: '王师傅',
        phone: '13700004321',
        distance: '120',
        departureAt: '2026-08-18 15:48',
        arrivalAt: '',
        plateNo: '粤A·F2103',
        driverName: '王海',
        vesselName: '',
        vesselId: '',
      },
    ],
    createdAt: '2026-08-18 15:48:21',
    pickupAt: '-',
    status: '待提货',
    statusTone: 'amber',
  },
]

const TONE: Record<string, string> = {
  amber: 'bg-chart-5/15 text-chart-5',
  green: 'bg-primary/12 text-primary',
}

export function FulfillmentDetail({
  open,
  project,
  mode = 'rental',
  onClose,
}: {
  open: boolean
  project: FulfillmentProject | null
  mode?:
    | 'rental'
    | 'disposal'
    | 'procurement'
    | 'procurement-buyer'
    | 'disposal-transferee'
    | 'rental-lessee'
    | 'procurement-scrap'
    | 'procurement-scrap-buyer'
  onClose: () => void
}) {
  const isDisposal = mode === 'disposal'
  // 钢厂回收：实质为采购废钢（再生资源），复用采购模式，供货方不做新品判断
  const isScrap =
    mode === 'procurement-scrap' || mode === 'procurement-scrap-buyer'
  const isBuyer = mode === 'procurement-buyer' || mode === 'procurement-scrap-buyer'
  const isProcurement =
    mode === 'procurement' || mode === 'procurement-scrap' || isBuyer
  // 受让方（处置收货方）：与采购方共用收货视角，但业务字段为处置口径
  const isTransferee = mode === 'disposal-transferee'
  // 承租方（出租收货方）：收货视角，业务字段为出租口径（对手方为出租方、款项为租金）
  const isLessee = mode === 'rental-lessee'
  const isReceiver = isBuyer || isTransferee || isLessee
  const [tab, setTab] = useState<'perform' | 'passed'>('passed')
  const [pickups, setPickups] = useState<PickupRow[]>(INITIAL_PICKUPS)
  const [pickupOpen, setPickupOpen] = useState(false)
  const [trackRow, setTrackRow] = useState<PickupRow | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pickupOpen && !trackRow) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, pickupOpen, trackRow])

  if (!open || !project) return null

  // 供应商（采购/钢厂回收的供货方，非收货方）
  const isSupplier = isProcurement && !isBuyer
  // 受让方 / 承租方 / 供应商履约结束：履约单为一张只读详情单，去掉各种确认/新增/录入等操作
  const readOnly =
    (isTransferee || isLessee || isSupplier) &&
    project.status === '履约结束'

  const handleSavePickup = (buyer: string, logistics: LogisticsRow[]) => {
    const now = new Date()
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setPickups((prev) => [
      {
        no: String(Math.floor(Math.random() * 9e18 + 1e18)),
        buyer,
        logistics,
        createdAt: stamp,
        pickupAt: '-',
        status: '待提货',
        statusTone: 'amber',
      },
      ...prev,
    ])
    setPickupOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="项目履约管理"
    >
      <button
        type="button"
        aria-label="关闭弹窗"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-foreground">
              项目管理 — {project.title}
            </h2>
            <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {isLessee
                ? '承租收货'
                : isTransferee
                  ? '受让收货'
                  : isBuyer
                    ? '采购收货'
                    : isProcurement
                      ? '采购供货'
                      : project.flowType === '出租'
                        ? '自主出租'
                        : '自主转让'}
            </span>
            <span className="rounded bg-chart-4/15 px-2 py-0.5 text-xs font-medium text-chart-4">
              {readOnly ? '履约结束' : '履约阶段'}
            </span>
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

        {/* 可滚动主体 */}
        <div className="flex-1 overflow-y-auto bg-background/40 p-6">
          {/* 步骤条 */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <ol className="flex items-center">
              {STEPS.map((step, i) => {
                const isLast = i === STEPS.length - 1
                const isActive = i === STEPS.length - 1
                const done = i < STEPS.length - 1
                return (
                  <li
                    key={step}
                    className={`flex items-center ${isLast ? '' : 'flex-1'}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span
                        className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold ${
                          isActive
                            ? 'bg-chart-4 text-primary-foreground ring-4 ring-chart-4/20'
                            : 'bg-chart-4 text-primary-foreground'
                        }`}
                      >
                        {done ? <Check className="size-4" /> : i + 1}
                      </span>
                      <span
                        className={`text-xs ${isActive ? 'font-semibold text-chart-4' : 'text-muted-foreground'}`}
                      >
                        {step}
                      </span>
                    </div>
                    {!isLast && (
                      <span className="mx-2 mb-6 h-0.5 flex-1 bg-chart-4/50" />
                    )}
                  </li>
                )
              })}
            </ol>
          </section>

          {/* 履约标签页 */}
          <div className="mt-5 flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab('perform')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === 'perform'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              履约
            </button>
            <button
              type="button"
              onClick={() => setTab('passed')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === 'passed'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              履约通过
            </button>
          </div>

          {/* 履约信息 */}
          <Card
            title="履约信息"
            actions={
              <>
                <PrimaryBtn>
                  <FileText className="size-3.5" />
                  {isLessee
                    ? '查看收货单'
                    : isTransferee
                      ? '查看交割单'
                      : isBuyer
                        ? '查看验收单'
                        : '查看履约单'}
                </PrimaryBtn>
                {!readOnly && (
                  <PrimaryBtn>
                    <Check className="size-3.5" />
                    {isLessee
                      ? '确认收货'
                      : isTransferee
                        ? '确认交割'
                        : isBuyer
                          ? '确认验收'
                          : '完成履约单'}
                  </PrimaryBtn>
                )}
              </>
            }
          >
            <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-border md:grid-cols-2">
              <InfoCell label="项目编号" value={project.code} mono />
              <InfoCell label="项目标题" value={project.title} />
              <InfoCell
                label={
                  isLessee
                    ? '出租方名称'
                    : isTransferee
                      ? '转让方名称'
                      : isBuyer
                        ? '供货方名称'
                        : isProcurement
                          ? '采购方名称'
                          : isDisposal
                            ? '受让方名称'
                            : '承租方名称'
                }
                value={project.buyer}
              />
              <InfoCell
                label={
                  isLessee
                    ? '出租方单位ID'
                    : isTransferee
                      ? '转让方单位ID'
                      : isBuyer
                        ? '供货方单位ID'
                        : isProcurement
                          ? '采购方单位ID'
                          : isDisposal
                            ? '受让方单位ID'
                            : '承租方单位ID'
                }
                value={project.buyerUnitId}
                mono
              />
              <InfoCell label="履约状态" value={project.status} />
              <InfoCell
                label={
                  isDisposal || isProcurement || isTransferee || isLessee
                    ? '交付期限'
                    : '履约期限'
                }
                value={project.period}
              />
              <InfoCell label="履约备注" value="无" />
              <InfoCell label="关闭履约备注" value="无" />
            </div>
          </Card>

          {/* 款项 */}
          <Card
            title={
              isLessee
                ? '租金支付'
                : isTransferee
                  ? '转让款支付'
                  : isBuyer
                    ? '货款支付'
                    : isProcurement
                      ? '货款收取'
                      : isDisposal
                        ? '转让款收取'
                        : '成交款收取'
            }
            actions={
              <>
                <GhostBtn>
                  <RefreshCw className="size-3.5" />
                  刷新
                </GhostBtn>
                {!readOnly && (
                  <PrimaryBtn>
                    <Plus className="size-3.5" />
                    {isReceiver ? '新增付款' : '新增收款'}
                  </PrimaryBtn>
                )}
              </>
            }
          >
            <TableShell
              headers={[
                isReceiver ? '付款编号' : '收款编号',
                '金额',
                '付款方',
                '收款方',
                '付款方式',
                '状态',
                '发起时间',
                isReceiver ? '付款备注' : '收款备注',
                '操作',
              ]}
            >
              {PAYMENTS.map((r) => (
                <tr
                  key={r.no}
                  className="border-t border-border hover:bg-accent/30"
                >
                  <td className="px-3 py-3 font-mono text-xs">{r.no}</td>
                  <td className="px-3 py-3 tabular-nums">{r.amount}</td>
                  <td className="px-3 py-3">{r.payer}</td>
                  <td className="px-3 py-3">{r.payee}</td>
                  <td className="px-3 py-3">{r.method}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">
                    {r.time}
                  </td>
                  <td className="px-3 py-3">{r.remark}</td>
                  <td className="px-3 py-3">
                    <LinkBtn>查看</LinkBtn>
                  </td>
                </tr>
              ))}
            </TableShell>
            <MiniPager total={PAYMENTS.length} />
          </Card>

          {/* 合同签署 */}
          <Card
            title="合同签署"
            actions={
              <GhostBtn>
                <RefreshCw className="size-3.5" />
                刷新
              </GhostBtn>
            }
          >
            <TableShell
              headers={[
                '合同编号',
                '合同甲方',
                '合同乙方',
                '合同金额',
                '合同备注',
                '状态',
                '操作',
              ]}
            >
              {CONTRACTS.map((r) => (
                <tr
                  key={r.no}
                  className="border-t border-border hover:bg-accent/30"
                >
                  <td className="px-3 py-3 font-mono text-xs">{r.no}</td>
                  <td className="px-3 py-3">{r.partyA}</td>
                  <td className="px-3 py-3">{r.partyB}</td>
                  <td className="px-3 py-3 tabular-nums">{r.amount}</td>
                  <td className="px-3 py-3">{r.remark}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${TONE[r.statusTone]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <LinkBtn>查看</LinkBtn>
                  </td>
                </tr>
              ))}
            </TableShell>
            <MiniPager total={CONTRACTS.length} />
          </Card>

          {/* 提货 / 收货情况 */}
          <Card
            title={isReceiver ? '收货情况' : '提货情况'}
            actions={
              <>
                <select className="rounded-md border border-input bg-background px-2 py-1.5 text-xs text-muted-foreground outline-none">
                  <option>状态筛选</option>
                  <option>{isReceiver ? '待收货' : '待提货'}</option>
                  <option>已完成</option>
                </select>
                <GhostBtn>
                  <RefreshCw className="size-3.5" />
                  刷新
                </GhostBtn>
                {!readOnly && (
                  <PrimaryBtn onClick={() => setPickupOpen(true)}>
                    <Plus className="size-3.5" />
                    {isReceiver ? '确认收货' : '录入提货单'}
                  </PrimaryBtn>
                )}
              </>
            }
          >
            <TableShell
              headers={[
                isReceiver ? '收货单编号' : '提货单编号',
                isLessee
                  ? '出租方名称'
                  : isTransferee
                    ? '转让方名称'
                    : isBuyer
                      ? '供货方名称'
                      : isDisposal
                        ? '受让方名称'
                        : '承租方名称',
                '物流信息',
                '创建时间',
                isReceiver ? '收货时间' : '提货时间',
                '状态',
                '操作',
              ]}
            >
              {pickups.map((r) => (
                <tr
                  key={r.no}
                  className="border-t border-border hover:bg-accent/30"
                >
                  <td className="px-3 py-3 font-mono text-xs">{r.no}</td>
                  <td className="px-3 py-3">
                    {isBuyer
                      ? '中铁物资物流集团华南有限公司'
                      : isTransferee || isLessee
                        ? project.buyer
                        : r.buyer}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => setTrackRow(r)}
                      className="inline-flex items-center gap-1 font-mono text-xs font-medium text-primary underline-offset-2 transition-colors hover:underline"
                    >
                      <MapPin className="size-3.5" />
                      <span>
                        {r.logistics[0]?.type} {r.logistics[0]?.logisticsNo || '待补充'}
                        {r.logistics.length > 1 ? ` 等 ${r.logistics.length} 条` : ''}
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">
                    {r.createdAt}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-muted-foreground">
                    {r.pickupAt}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${TONE[r.statusTone]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <LinkBtn>查看</LinkBtn>
                      {!readOnly && r.status === '待提货' && (
                        <button
                          type="button"
                          onClick={() =>
                            setPickups((prev) =>
                              prev.filter((p) => p.no !== r.no),
                            )
                          }
                          className="text-sm font-medium text-destructive transition-colors hover:opacity-80"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </TableShell>
            <MiniPager total={pickups.length} />
          </Card>
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            关闭
          </button>
        </div>
      </div>

      <PickupOrderDialog
        open={pickupOpen}
        project={project}
        isBuyer={isReceiver}
        isTransferee={isTransferee}
        isLessee={isLessee}
        isSupplier={isProcurement && !isBuyer}
        isScrap={isScrap}
        onClose={() => setPickupOpen(false)}
        onSave={handleSavePickup}
      />

      <TransportTrackDialog
        open={trackRow !== null}
        logistics={trackRow?.logistics ?? []}
        onClose={() => setTrackRow(null)}
      />
    </div>
  )
}

/* ------------------------- 录入提货单弹窗 ------------------------- */

type DetailLine = {
  id: string
  resource: string
  resourceName: string
  quantity: string
}

function PickupOrderDialog({
  open,
  project,
  isBuyer = false,
  isTransferee = false,
  isLessee = false,
  isSupplier = false,
  isScrap = false,
  onClose,
  onSave,
}: {
  open: boolean
  project: FulfillmentProject
  isBuyer?: boolean
  isTransferee?: boolean
  isLessee?: boolean
  isSupplier?: boolean
  isScrap?: boolean
  onClose: () => void
  onSave: (buyer: string, logistics: LogisticsRow[]) => void
}) {
  const createLogisticsRow = (): LogisticsRow => ({
    id: crypto.randomUUID(),
    type: '陆运',
    logisticsNo: '',
    carrier: '',
    contact: '',
    phone: '',
    distance: '',
    departureAt: '',
    arrivalAt: '',
    plateNo: '',
    driverName: '',
    vesselName: '',
    vesselId: '',
  })
  const [lines, setLines] = useState<DetailLine[]>([])
  const [grossWeight, setGrossWeight] = useState('')
  const [tareWeight, setTareWeight] = useState('')
  const [weighFile, setWeighFile] = useState<string | null>(null)
  // 钢厂回收：按净重自动折算为对应铁矿石类型的等效重量
  const [oreType, setOreType] = useState<OreType>('磁铁矿')
  const [remark, setRemark] = useState('')
  // 收货方（采购方 / 承租方）确认收货时填写资源去向与用途，非必填（受让方改用「改制加工」板块）
  const [resourceDestination, setResourceDestination] = useState('')
  const [resourceUsage, setResourceUsage] = useState('')
  // 受让方确认收货时的「改制加工」板块（非强制项）
  const [reprocessTypes, setReprocessTypes] = useState<string[]>([])
  const [reprocessWeight, setReprocessWeight] = useState('')
  const [reprocessWeighFile, setReprocessWeighFile] = useState<string | null>(null)
  const [reprocessDest, setReprocessDest] = useState('')
  const [reprocessDistance, setReprocessDistance] = useState('')
  const [reprocessTransport, setReprocessTransport] = useState('陆运')
  const reprocessFileRef = useRef<HTMLInputElement | null>(null)
  const [logistics, setLogistics] = useState<LogisticsRow[]>([])
  const [trackLogistics, setTrackLogistics] = useState<LogisticsRow | null>(null)
  const [isNewProduct, setIsNewProduct] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    // 收货 / 提货明细默认带出订单资源数据，便于收货方直接确认
    setLines((current) =>
      current.length > 0
        ? current
        : [
            { id: 'line-1', resource: 'WZ-2026-0512-01', resourceName: '热轧型钢', quantity: '32.500' },
            { id: 'line-2', resource: 'WZ-2026-0512-02', resourceName: '钢板桩', quantity: '18.200' },
            { id: 'line-3', resource: 'WZ-2026-0512-03', resourceName: '周转扣件', quantity: '13.500' },
          ],
    )
    setLogistics((current) =>
      current.length > 0
        ? current
        : isBuyer
          ? [
              // 收货单：反显发货方（提货单）已登记的物流信息
              {
                id: crypto.randomUUID(),
                type: '陆运',
                logisticsNo: 'YD20260820000123',
                carrier: '中铁物流华南分公司',
                contact: '李国强',
                phone: '138 0013 8000',
                distance: '120',
                departureAt: '2026-08-20T08:12',
                arrivalAt: '2026-08-20T15:40',
                plateNo: '粤A·8H63Z',
                driverName: '陈志明',
                vesselName: '',
                vesselId: '',
              },
            ]
          : [
              {
                id: crypto.randomUUID(),
                type: '陆运',
                logisticsNo: '',
                carrier: '',
                contact: '',
                phone: '',
                distance: '',
                departureAt: '',
                arrivalAt: '',
                plateNo: '',
                driverName: '',
                vesselName: '',
                vesselId: '',
              },
            ],
    )
    // 收货单：反显发货方过磅结果与过磅单附件（净重 = 毛重 - 皮重）
    if (isBuyer) {
      setGrossWeight((v) => v || '64.45')
      setTareWeight((v) => v || '0.25')
      setWeighFile((v) => v || '发货过磅单-YD20260820000123.pdf')
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !trackLogistics) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, trackLogistics, isBuyer])

  if (!open) return null

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        resource: '',
        resourceName: '',
        quantity: '',
      },
    ])

  const updateLine = (id: string, patch: Partial<DetailLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const removeLine = (id: string) =>
    setLines((prev) => prev.filter((l) => l.id !== id))

  // 收货确认方（采购方 / 受让方 / 承租方）：不再重复过磅，重量以交付方过磅单为准，去掉收货过磅单功能
  const isReceiver = isBuyer || isTransferee || isLessee

  const netWeight =
    grossWeight && tareWeight
      ? (parseFloat(grossWeight) - parseFloat(tareWeight)).toFixed(2)
      : ''

  // 普通采购业务（供应商发货 / 采购方收货，非钢厂回收、非受让承租流转）
  const isProcurementDeal = (isSupplier || isBuyer) && !isScrap && !isTransferee && !isLessee
  // 二手资源：普通采购业务中标记为非新品的资源，等同再生资源纳入回收利用碳核算
  const isSecondHand = isProcurementDeal && !isNewProduct
  // 发货方（供应商）过磅时展示折算：钢厂回收（废钢）或二手资源采购
  const showOreConversion = isScrap || (!isReceiver && isSecondHand)
  // 等效矿石重量（用于发货方过磅与收货单反显）
  const oreEquivalent = netWeight
    ? (parseFloat(netWeight) * (ORE_TYPES.find((o) => o.type === oreType)?.factor ?? 0)).toFixed(2)
    : ''

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isBuyer ? '确认收货单' : '录入提货单'}
    >
      <button
        type="button"
        aria-label="关闭弹窗"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isBuyer ? '确认收货单' : '录入提货单'}
          </h2>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* 关联项目 */}
          <FormSection title="关联项目">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              <ReadonlyField label="项目编号" value={project.code} />
              <ReadonlyField label="项目名称" value={project.title} />
            </div>
          </FormSection>

          {/* 资源属性（供应商视角）：判断是否为新品；钢厂回收为废钢回收，无新品概念，不展示该区 */}
          {isSupplier && !isScrap && (
            <FormSection
              title="资源属性"
              icon={<Recycle className="size-4 text-primary" />}
            >
              <div className="flex flex-col gap-3 rounded-md border border-border bg-secondary/40 p-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <FieldLabel label="本次出售资源是否为新品" required />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewProduct(false)}
                      className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors md:flex-none ${
                        !isNewProduct
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      二手资源
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewProduct(true)}
                      className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors md:flex-none ${
                        isNewProduct
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      新品
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {isNewProduct
                  ? '已标记为新品：新品不涉及资源回收再利用减排，采购方履约结束列表将不体现碳减排量与碳凭证。'
                  : '二手资源将纳入资源回收利用碳核算，采购方履约结束后可查看碳减排量与碳凭证。'}
              </p>
            </FormSection>
          )}

          {/* 提货方 / 供货方信息 */}
          <FormSection
            title={
              isLessee
                ? '出租方信息'
                : isTransferee
                  ? '转让方信息'
                  : isBuyer
                    ? '供货方信息'
                    : '提货方信息'
            }
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              <ReadonlyField
                label={
                  isLessee
                    ? '出租方'
                    : isTransferee
                      ? '转让方'
                      : isBuyer
                        ? '供货方'
                        : project.flowType === '出租'
                          ? '承租方'
                          : '受让方'
                }
                value={project.buyer}
                required
              />
            </div>
          </FormSection>

          {/* 物流信息登记 */}
          <FormSection
            title={isBuyer ? '到货物流登记' : '物流信息登记'}
            icon={<Truck className="size-4 text-primary" />}
          >
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[1680px] border-collapse text-sm">
                <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                  <tr>
                    {['运输类型', '物流单号', '承运单位', '联系人', '联系电话', '运输距离(km)', '车辆/船舶名称', '司机/船舶识别号', '装运时间', '到货时间', '操作'].map((header) => (
                      <th key={header} className="px-2 py-2.5 font-medium">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logistics.map((row, index) => {
                    const update = (patch: Partial<LogisticsRow>) =>
                      setLogistics((current) =>
                        current.map((item) =>
                          item.id === row.id ? { ...item, ...patch } : item,
                        ),
                      )
                    const inputClass = isBuyer
                      ? 'w-full rounded-md border border-input bg-muted px-2 py-1.5 text-sm text-muted-foreground outline-none cursor-default'
                      : 'w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20'
                    return (
                      <tr key={row.id} className="border-t border-border align-top">
                        <td className="w-28 px-2 py-2">
                          <select
                            value={row.type}
                            disabled={isBuyer}
                            onChange={(event) =>
                              update({
                                type: event.target.value as TransportType,
                                plateNo: '',
                                driverName: '',
                                vesselName: '',
                                vesselId: '',
                              })
                            }
                            className={inputClass}
                            aria-label={`第 ${index + 1} 条运输类型`}
                          >
                            <option value="陆运">陆运</option>
                            <option value="水运">水运</option>
                          </select>
                        </td>
                        <td className="w-44 px-2 py-2">
                          <input value={row.logisticsNo} readOnly={isBuyer} onChange={(e) => update({ logisticsNo: e.target.value })} placeholder={row.type === '陆运' ? '如 YD20260820000123' : '如 SY20260820000123'} className={inputClass} />
                        </td>
                        <td className="w-44 px-2 py-2"><input value={row.carrier} readOnly={isBuyer} onChange={(e) => update({ carrier: e.target.value })} placeholder="承运单位" className={inputClass} /></td>
                        <td className="w-32 px-2 py-2"><input value={row.contact} readOnly={isBuyer} onChange={(e) => update({ contact: e.target.value })} placeholder="联系人" className={inputClass} /></td>
                        <td className="w-36 px-2 py-2"><input value={row.phone} readOnly={isBuyer} onChange={(e) => update({ phone: e.target.value })} placeholder="联系电话" className={inputClass} /></td>
                        <td className="w-28 px-2 py-2"><input type="number" min="0" value={row.distance} readOnly={isBuyer} onChange={(e) => update({ distance: e.target.value })} placeholder="0" className={inputClass} /></td>
                        <td className="w-40 px-2 py-2"><input value={row.type === '陆运' ? row.plateNo : row.vesselName} readOnly={isBuyer} onChange={(e) => update(row.type === '陆运' ? { plateNo: e.target.value } : { vesselName: e.target.value })} placeholder={row.type === '陆运' ? '车牌号' : '船名'} className={inputClass} /></td>
                        <td className="w-40 px-2 py-2"><input value={row.type === '陆运' ? row.driverName : row.vesselId} readOnly={isBuyer} onChange={(e) => update(row.type === '陆运' ? { driverName: e.target.value } : { vesselId: e.target.value })} placeholder={row.type === '陆运' ? '司机姓名' : '船舶识别号'} className={inputClass} /></td>
                        <td className="w-48 px-2 py-2"><input type="datetime-local" value={row.departureAt} readOnly={isBuyer} onChange={(e) => update({ departureAt: e.target.value })} className={inputClass} /></td>
                        <td className="w-48 px-2 py-2"><input type="datetime-local" value={row.arrivalAt} readOnly={isBuyer} onChange={(e) => update({ arrivalAt: e.target.value })} className={inputClass} /></td>
                        <td className="w-28 px-2 py-2">
                          <div className="flex items-center gap-2">
                            {row.logisticsNo.trim() && (
                              <button type="button" onClick={() => setTrackLogistics(row)} className="text-primary" aria-label={`查看第 ${index + 1} 条运输轨迹`}><MapPin className="size-4" /></button>
                            )}
                            {!isBuyer && (
                              <button type="button" disabled={logistics.length === 1} onClick={() => setLogistics((current) => current.filter((item) => item.id !== row.id))} className="text-destructive disabled:cursor-not-allowed disabled:opacity-30" aria-label={`删除第 ${index + 1} 条物流信息`}><Trash2 className="size-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* 采购方确认收货：物流由供货方登记，采购方不再新增物流信息 */}
            {!isBuyer && (
              <button
                type="button"
                onClick={() => setLogistics((current) => [...current, createLogisticsRow()])}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-primary/50 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <Plus className="size-4" />
                新增物流信息
              </button>
            )}
          </FormSection>

          {/* 重量信息：由发货方（供应商 / 回收基地等交付方）过磅；收货确认方（含钢厂/回收商、钢厂）不再重复过磅 */}
          {!isReceiver && (
          <FormSection
            title={isScrap ? '发货过磅' : '重量信息'}
            icon={<Scale className="size-4 text-primary" />}
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
              <div>
                <FieldLabel label="毛重（吨）" />
                <input
                  type="number"
                  min="0"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <FieldLabel label="皮重（吨）" />
                <input
                  type="number"
                  min="0"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <FieldLabel label="净重（吨）" />
                <input
                  readOnly
                  value={netWeight}
                  placeholder="自动计算"
                  className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm tabular-nums text-muted-foreground outline-none"
                />
              </div>
            </div>
            {showOreConversion && (
              <div className="mt-4 rounded-lg border border-[#9bc4ff] bg-[#eaf3ff] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#086de0]">
                  <Recycle className="size-4" />
                  {isScrap ? '废钢等效矿石折算' : '二手资源等效矿石折算'}
                </div>
                <p className="mt-1 text-xs text-[#086de0]/70">
                  按发货净重自动折算为对应铁矿石类型的等效开采重量，作为碳减排核算依据。
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="sm:w-56">
                    <FieldLabel label="铁矿石类型" />
                    <select
                      value={oreType}
                      onChange={(e) => setOreType(e.target.value as OreType)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                    >
                      {ORE_TYPES.map((o) => (
                        <option key={o.type} value={o.type}>
                          {o.type}（含铁约 {o.grade}%）
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 rounded-md border border-[#9bc4ff]/60 bg-background/70 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">等效 {oreType} 重量</span>
                    <p className="mt-0.5 flex items-baseline gap-1">
                      <b className="text-2xl tabular-nums text-[#086de0]">
                        {netWeight
                          ? (
                              parseFloat(netWeight) *
                              (ORE_TYPES.find((o) => o.type === oreType)?.factor ?? 0)
                            ).toFixed(2)
                          : '0.00'}
                      </b>
                      <span className="text-sm text-[#086de0]/70">吨</span>
                    </p>
                  </div>
                </div>
                {netWeight && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ORE_TYPES.map((o) => (
                      <div
                        key={o.type}
                        className={`rounded-md border px-3 py-2 text-xs ${o.type === oreType ? 'border-[#086de0] bg-[#eaf3ff]' : 'border-border bg-background'}`}
                      >
                        <span className="text-muted-foreground">{o.type}</span>
                        <p className="mt-0.5 tabular-nums font-semibold text-foreground">
                          {(parseFloat(netWeight) * o.factor).toFixed(2)} 吨
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="mt-4">
              <FieldLabel label="过磅单" required />
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setWeighFile(f.name)
                }}
              />
              {weighFile ? (
                <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm">
                  <FileText className="size-4 text-primary" />
                  <span className="flex-1 truncate text-foreground">
                    {weighFile}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setWeighFile(null)
                      if (fileRef.current) fileRef.current.value = ''
                    }}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="移除过磅单"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
                >
                  <Upload className="size-4" />
                  上传过磅单（支持图片 / PDF）
                </button>
              )}
            </div>
          </FormSection>
          )}

          {/* 提货 / 收货明细 */}
          <FormSection title={isBuyer ? '收货明细' : '提货明细'}>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted/60 text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">资源</th>
                    <th className="px-3 py-2.5 font-medium">资源名称</th>
                    <th className="px-3 py-2.5 text-right font-medium">数量</th>
                    {!isBuyer && (
                      <th className="w-20 px-3 py-2.5 text-center font-medium">
                        操作
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isBuyer ? 3 : 4}
                        className="px-3 py-8 text-center text-sm text-muted-foreground"
                      >
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    lines.map((l) => (
                      <tr key={l.id} className="border-t border-border">
                        <td className="px-3 py-2">
                          <input
                            value={l.resource}
                            readOnly={isBuyer}
                            onChange={(e) =>
                              updateLine(l.id, { resource: e.target.value })
                            }
                            placeholder="资源编码"
                            className={`w-full rounded border border-input px-2 py-1.5 text-sm outline-none ${isBuyer ? 'bg-muted text-muted-foreground cursor-default' : 'bg-background focus:border-ring'}`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={l.resourceName}
                            readOnly={isBuyer}
                            onChange={(e) =>
                              updateLine(l.id, { resourceName: e.target.value })
                            }
                            placeholder="资源名称"
                            className={`w-full rounded border border-input px-2 py-1.5 text-sm outline-none ${isBuyer ? 'bg-muted text-muted-foreground cursor-default' : 'bg-background focus:border-ring'}`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            value={l.quantity}
                            readOnly={isBuyer}
                            onChange={(e) =>
                              updateLine(l.id, { quantity: e.target.value })
                            }
                            placeholder="0"
                            className={`w-full rounded border border-input px-2 py-1.5 text-right text-sm tabular-nums outline-none ${isBuyer ? 'bg-muted text-muted-foreground cursor-default' : 'bg-background focus:border-ring'}`}
                          />
                        </td>
                        {!isBuyer && (
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(l.id)}
                              className="text-muted-foreground transition-colors hover:text-destructive"
                              aria-label="删除明细行"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {isBuyer ? (
              /* 收货单：附发货方过磅单附件与过磅结果，供收货方核对 */
              <div className="mt-3 rounded-md border border-border bg-secondary/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="size-4 text-primary" />
                    <span className="font-medium text-foreground">过磅单附件</span>
                    <span className="text-muted-foreground">{weighFile ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      过磅净重{' '}
                      <b className="tabular-nums text-foreground">
                        {netWeight || '—'}
                      </b>{' '}
                      吨
                    </span>
                    {weighFile && (
                      <button
                        type="button"
                        className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        查看
                      </button>
                    )}
                  </div>
                </div>
                {(isScrap || isSecondHand) && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-[#9bc4ff] bg-[#eaf3ff] px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-2 text-[#086de0]">
                      <Recycle className="size-4" />
                      <span className="font-medium">
                        {isScrap ? '废钢等效矿石折算' : '二手资源等效矿石折算'}
                      </span>
                      <span className="text-[#086de0]/70">（{oreType}）</span>
                    </div>
                    <span className="text-xs text-[#086de0]/80">
                      等效开采重量{' '}
                      <b className="text-base tabular-nums text-[#086de0]">
                        {oreEquivalent || '—'}
                      </b>{' '}
                      吨
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={addLine}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                <Plus className="size-4" />
                新增明细行
              </button>
            )}

            {/* 收货方（采购方 / 承租方）确认收货时可写明资源的去向与用途，均为非必填；受让方改用下方「改制加工」板块 */}
            {isReceiver && !isTransferee && (
              <div className="mt-4 rounded-md border border-border bg-secondary/40 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Recycle className="size-4 text-primary" />
                  资源去向与用途
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground">
                    选填
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                  <div>
                    <FieldLabel label="资源去向" />
                    <input
                      value={resourceDestination}
                      onChange={(e) => setResourceDestination(e.target.value)}
                      placeholder="如：调拨至 XX 项目部 / XX 仓库继续周转使用"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                  <div>
                    <FieldLabel label="资源用途" />
                    <input
                      value={resourceUsage}
                      onChange={(e) => setResourceUsage(e.target.value)}
                      placeholder="如：用于 XX 工程支护 / 二次循环利用 / 回炉再造"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  填写资源的后续去向与实际用途，便于循环利用追溯与碳减排核算佐证；非必填。
                </p>
              </div>
            )}

            {/* 受让方确认收货时的「改制加工」板块：记录改制类型、改制后重量、资源去向及后续运输，均为非强制项 */}
            {isTransferee && (
              <div className="mt-4 rounded-md border border-border bg-secondary/40 p-4">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Recycle className="size-4 text-primary" />
                  改制加工
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground">
                    选填
                  </span>
                </div>

                {/* 1. 改制加工类型（可多选） */}
                <div>
                  <FieldLabel label="改制加工类型" />
                  <div className="flex flex-wrap gap-2">
                    {REPROCESS_TYPES.map((t) => {
                      const on = reprocessTypes.includes(t)
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            setReprocessTypes((prev) =>
                              prev.includes(t)
                                ? prev.filter((x) => x !== t)
                                : [...prev, t],
                            )
                          }
                          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                            on
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-input bg-background text-foreground hover:bg-accent'
                          }`}
                        >
                          {t}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. 改制加工后重量 + 过磅单 */}
                <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                  <div>
                    <FieldLabel label="改制加工后重量（吨）" />
                    <input
                      value={reprocessWeight}
                      inputMode="decimal"
                      onChange={(e) => setReprocessWeight(e.target.value)}
                      placeholder="请输入改制加工后过磅重量"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                  <div>
                    <FieldLabel label="改制加工过磅单" />
                    <input
                      ref={reprocessFileRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) setReprocessWeighFile(f.name)
                      }}
                    />
                    {reprocessWeighFile ? (
                      <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm">
                        <FileText className="size-4 text-primary" />
                        <span className="flex-1 truncate text-foreground">
                          {reprocessWeighFile}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setReprocessWeighFile(null)
                            if (reprocessFileRef.current)
                              reprocessFileRef.current.value = ''
                          }}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="移除改制加工过磅单"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reprocessFileRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
                      >
                        <Upload className="size-4" />
                        上传过磅单
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. 资源去向 */}
                <div className="mt-4">
                  <FieldLabel label="资源去向" />
                  <div className="flex flex-wrap gap-2">
                    {REPROCESS_DESTINATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setReprocessDest(d)}
                        className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                          reprocessDest === d
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-input bg-background text-foreground hover:bg-accent'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. 运输到去向目的地的预估距离与运输方式 */}
                <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                  <div>
                    <FieldLabel label="预估运输距离（公里）" />
                    <div className="relative">
                      <Navigation className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={reprocessDistance}
                        inputMode="decimal"
                        onChange={(e) => setReprocessDistance(e.target.value)}
                        placeholder="至去向目的地的预估里程"
                        disabled={reprocessDest === '暂不确定'}
                        className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel label="运输方式" />
                    <div className="flex gap-2">
                      {REPROCESS_TRANSPORTS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setReprocessTransport(m)}
                          disabled={reprocessDest === '暂不确定'}
                          className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            reprocessTransport === m
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-input bg-background text-foreground hover:bg-accent'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  填写改制加工与资源后续去向信息，用于测算运输及改制加工碳排放、支撑碳减排贡献核算；均为非强制项。
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-[5rem_1fr] gap-3">
              <label className="pt-2 text-right text-sm text-muted-foreground">
                备注
              </label>
              <div className="relative">
                <textarea
                  value={remark}
                  maxLength={255}
                  readOnly={isBuyer}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder={isBuyer ? '发货方未填写备注' : '长度 0-255 字'}
                  rows={3}
                  className={`w-full resize-y rounded-md border border-input px-3 py-2 text-sm outline-none ${isBuyer ? 'bg-muted text-muted-foreground cursor-default' : 'bg-background focus:border-ring focus:ring-2 focus:ring-ring/20'}`}
                />
                <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground">
                  {remark.length} / 255
                </span>
              </div>
            </div>
          </FormSection>

        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => onSave(project.buyer, logistics)}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isBuyer ? '确认收货' : '保存'}
          </button>
        </div>
      </div>

      <TransportTrackDialog
        open={trackLogistics !== null}
        logistics={trackLogistics ? [trackLogistics] : []}
        onClose={() => setTrackLogistics(null)}
      />
    </div>
  )
}

/* ------------------------- 运输轨迹弹窗 ------------------------- */

type TrackNode = {
  place: string
  desc: string
  time: string
  done: boolean
}

function TransportTrackDialog({
  open,
  logistics,
  onClose,
}: {
  open: boolean
  logistics: LogisticsRow[]
  onClose: () => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    setActiveIndex(0)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || logistics.length === 0) return null
  const active = logistics[Math.min(activeIndex, logistics.length - 1)]

  const nodes: TrackNode[] = [
    {
      place: '中铁物资华南仓',
      desc: '货物已装车出库，开始运输',
      time: '2026-08-20 08:12',
      done: true,
    },
    {
      place: '广州分拨中心',
      desc: '车辆途经分拨中心，装载校验通过',
      time: '2026-08-20 10:45',
      done: true,
    },
    {
      place: '佛山中转站',
      desc: '干线运输中，预计准点到达',
      time: '2026-08-20 13:20',
      done: true,
    },
    {
      place: '项目现场收货点',
      desc: '运抵目的地，等待卸货签收',
      time: '2026-08-20 15:38',
      done: false,
    },
  ]

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="实际运输轨迹"
    >
      <button
        type="button"
        aria-label="关闭弹窗"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              实际运输轨迹
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

        <div className="flex-1 overflow-y-auto p-6">
          {logistics.length > 1 && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {logistics.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`shrink-0 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                    activeIndex === index
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {item.type} {item.logisticsNo || `物流 ${index + 1}`}
                </button>
              ))}
            </div>
          )}
          <div className="mb-5 grid grid-cols-2 gap-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
            <div><span className="text-muted-foreground">运输类型：</span><span className="font-medium text-foreground">{active.type}</span></div>
            <div><span className="text-muted-foreground">物流单号：</span><span className="font-mono text-xs text-foreground">{active.logisticsNo || '—'}</span></div>
            <div><span className="text-muted-foreground">承运单位：</span><span className="text-foreground">{active.carrier || '—'}</span></div>
            <div><span className="text-muted-foreground">运输距离：</span><span className="font-medium tabular-nums text-foreground">{active.distance ? `${active.distance} km` : '—'}</span></div>
            <div><span className="text-muted-foreground">{active.type === '陆运' ? '车牌号：' : '船名：'}</span><span className="text-foreground">{active.type === '陆运' ? active.plateNo || '—' : active.vesselName || '—'}</span></div>
            <div><span className="text-muted-foreground">{active.type === '陆运' ? '司机姓名：' : '船舶识别号：'}</span><span className="text-foreground">{active.type === '陆运' ? active.driverName || '—' : active.vesselId || '—'}</span></div>
            <div><span className="text-muted-foreground">联系人：</span><span className="text-foreground">{active.contact || '—'} {active.phone}</span></div>
            <div><span className="text-muted-foreground">装运 / 到货：</span><span className="text-foreground">{active.departureAt || '—'} / {active.arrivalAt || '—'}</span></div>
          </div>

          <ol className="relative ml-2">
            {nodes.map((n, i) => {
              const isLast = i === nodes.length - 1
              return (
                <li key={n.place} className="relative flex gap-4 pb-6 last:pb-0">
                  {!isLast && (
                    <span
                      className={`absolute left-[7px] top-5 h-full w-0.5 ${n.done ? 'bg-primary/40' : 'bg-border'}`}
                    />
                  )}
                  <span className="relative z-10 mt-0.5 shrink-0">
                    {n.done ? (
                      <CircleDot className="size-4 text-primary" />
                    ) : (
                      <MapPin className="size-4 text-chart-5" />
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {n.place}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {n.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.desc}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="flex items-center justify-end border-t border-border bg-secondary/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------- 复用小组件 ------------------------- */

function Card({
  title,
  actions,
  children,
}: {
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mt-5 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-primary" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
      {children}
    </section>
  )
}

function InfoCell({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex border-b border-border last:border-b-0 md:[&:nth-last-child(2)]:border-b-0">
      <div className="w-32 shrink-0 border-r border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
        {label}
      </div>
      <div
        className={`flex-1 px-4 py-2.5 text-sm text-foreground ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value}
      </div>
    </div>
  )
}

function TableShell({
  headers,
  children,
}: {
  headers: string[]
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead className="bg-muted/60 text-left text-muted-foreground">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function MiniPager({ total }: { total: number }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-3 text-sm text-muted-foreground">
      <span>共 {total} 条</span>
      <select className="rounded-md border border-input bg-background px-2 py-1 text-xs outline-none">
        <option>10条/页</option>
        <option>20条/页</option>
      </select>
      <div className="flex items-center gap-1">
        <span className="flex size-7 items-center justify-center rounded border border-input opacity-40">
          ‹
        </span>
        <span className="flex size-7 items-center justify-center rounded border border-primary bg-primary text-primary-foreground">
          1
        </span>
        <span className="flex size-7 items-center justify-center rounded border border-input opacity-40">
          ›
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span>前往</span>
        <input
          defaultValue={1}
          className="w-10 rounded border border-input bg-background px-2 py-1 text-center outline-none"
          aria-label="跳转页码"
        />
        <span>页</span>
      </div>
    </div>
  )
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
        {icon ?? <span className="h-4 w-1 rounded-full bg-primary" />}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function FieldLabel({
  label,
  required,
  className,
}: {
  label: string
  required?: boolean
  className?: string
}) {
  return (
    <label
      className={`mb-1.5 block text-sm text-muted-foreground ${className ?? ''}`}
    >
      {required && <span className="mr-0.5 text-destructive">*</span>}
      {label}
    </label>
  )
}

function ReadonlyField({
  label,
  value,
  required,
}: {
  label: string
  value: string
  required?: boolean
}) {
  return (
    <div className="grid grid-cols-[5rem_1fr] items-center gap-3">
      <label className="text-right text-sm text-muted-foreground">
        {required && <span className="mr-0.5 text-destructive">*</span>}
        {label}
      </label>
      <input
        readOnly
        value={value}
        className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground outline-none"
      />
    </div>
  )
}

function InputField({
  label,
  placeholder,
}: {
  label: string
  placeholder?: string
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <input
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
      />
    </div>
  )
}

function PrimaryBtn({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {children}
    </button>
  )
}

function GhostBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
    >
      {children}
    </button>
  )
}

function LinkBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
    >
      {children}
    </button>
  )
}
