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

type PickupRow = {
  no: string
  buyer: string
  logisticsNo: string
  distance: string
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
    logisticsNo: 'YD20260818000041',
    distance: '68',
    createdAt: '2026-08-18 15:46:33',
    pickupAt: '2026-08-18 15:46:51',
    status: '已完成',
    statusTone: 'green',
  },
  {
    no: '2089620399548665000',
    buyer: '广州资源回收有限公司',
    logisticsNo: 'YD20260818000053',
    distance: '120',
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
  mode?: 'rental' | 'disposal'
  onClose: () => void
}) {
  const isDisposal = mode === 'disposal'
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

  const handleSavePickup = (buyer: string) => {
    const now = new Date()
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setPickups((prev) => [
      {
        no: String(Math.floor(Math.random() * 9e18 + 1e18)),
        buyer,
        logisticsNo: `YD${stamp.replace(/[-: ]/g, '').slice(0, 8)}${String(Math.floor(Math.random() * 900000 + 100000))}`,
        distance: '',
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
              {project.flowType === '出租' ? '自主出租' : '自主转让'}
            </span>
            <span className="rounded bg-chart-4/15 px-2 py-0.5 text-xs font-medium text-chart-4">
              履约阶段
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
                  查看履约单
                </PrimaryBtn>
                <PrimaryBtn>
                  <Check className="size-3.5" />
                  完成履约单
                </PrimaryBtn>
              </>
            }
          >
            <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-border md:grid-cols-2">
              <InfoCell label="项目编号" value={project.code} mono />
              <InfoCell label="项目标题" value={project.title} />
              <InfoCell label="竞买人名称" value={project.buyer} />
              <InfoCell label="竞买人单位ID" value={project.buyerUnitId} mono />
              <InfoCell label="履约状态" value={project.status} />
              <InfoCell
                label={isDisposal ? '交付期限' : '履约期限'}
                value={project.period}
              />
              <InfoCell label="履约备注" value="无" />
              <InfoCell label="关闭履约备注" value="无" />
            </div>
          </Card>

          {/* 成交款收取 */}
          <Card
            title={isDisposal ? '转让款收取' : '成交款收取'}
            actions={
              <>
                <GhostBtn>
                  <RefreshCw className="size-3.5" />
                  刷新
                </GhostBtn>
                <PrimaryBtn>
                  <Plus className="size-3.5" />
                  新增收款
                </PrimaryBtn>
              </>
            }
          >
            <TableShell
              headers={[
                '收款编号',
                '金额',
                '付款方',
                '收款方',
                '付款方式',
                '状态',
                '发起时间',
                '收款备注',
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

          {/* 提货情况 */}
          <Card
            title="提货情况"
            actions={
              <>
                <select className="rounded-md border border-input bg-background px-2 py-1.5 text-xs text-muted-foreground outline-none">
                  <option>状态筛选</option>
                  <option>待提货</option>
                  <option>已完成</option>
                </select>
                <GhostBtn>
                  <RefreshCw className="size-3.5" />
                  刷新
                </GhostBtn>
                <PrimaryBtn onClick={() => setPickupOpen(true)}>
                  <Plus className="size-3.5" />
                  录入提货单
                </PrimaryBtn>
              </>
            }
          >
            <TableShell
              headers={[
                '提货单编号',
                '竞买人名称',
                '物流单号',
                '创建时间',
                '提货时间',
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
                  <td className="px-3 py-3">{r.buyer}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => setTrackRow(r)}
                      className="inline-flex items-center gap-1 font-mono text-xs font-medium text-primary underline-offset-2 transition-colors hover:underline"
                    >
                      <MapPin className="size-3.5" />
                      {r.logisticsNo}
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
                      {r.status === '待提货' && (
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
        onClose={() => setPickupOpen(false)}
        onSave={handleSavePickup}
      />

      <TransportTrackDialog
        open={trackRow !== null}
        logisticsNo={trackRow?.logisticsNo ?? ''}
        distance={trackRow?.distance ?? ''}
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
  onClose,
  onSave,
}: {
  open: boolean
  project: FulfillmentProject
  onClose: () => void
  onSave: (buyer: string) => void
}) {
  const [lines, setLines] = useState<DetailLine[]>([])
  const [grossWeight, setGrossWeight] = useState('')
  const [tareWeight, setTareWeight] = useState('')
  const [weighFile, setWeighFile] = useState<string | null>(null)
  const [remark, setRemark] = useState('')
  const [logisticsNo, setLogisticsNo] = useState('')
  const [distance, setDistance] = useState('')
  const [trackOpen, setTrackOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

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

  const netWeight =
    grossWeight && tareWeight
      ? (parseFloat(grossWeight) - parseFloat(tareWeight)).toFixed(2)
      : ''

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="录入提货单"
    >
      <button
        type="button"
        aria-label="关闭弹窗"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">录入提货单</h2>
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

          {/* 提货方信息 */}
          <FormSection title="提货方信息">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              <ReadonlyField label="竞买人" value={project.buyer} required />
            </div>
          </FormSection>

          {/* 物流信息登记 */}
          <FormSection
            title="物流信息登记"
            icon={<Truck className="size-4 text-primary" />}
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <FieldLabel label="物流单号" className="mb-0" />
                  {logisticsNo.trim() && (
                    <button
                      type="button"
                      onClick={() => setTrackOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      <MapPin className="size-3.5" />
                      查看运输轨迹
                    </button>
                  )}
                </div>
                <input
                  value={logisticsNo}
                  onChange={(e) => setLogisticsNo(e.target.value)}
                  placeholder="如 YD20260820000123"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <FieldLabel label="运输距离（km）" />
                <input
                  type="number"
                  min="0"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <InputField label="承运单位" placeholder="请输入承运单位" />
              <InputField label="车牌号" placeholder="如 粤A·12345" />
              <InputField label="司机姓名" placeholder="请输入司机姓名" />
              <InputField label="联系电话" placeholder="请输入联系电话" />
              <div className="md:col-span-2">
                <FieldLabel label="发货时间" />
                <input
                  type="datetime-local"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>
          </FormSection>

          {/* 重量信息 */}
          <FormSection
            title="重量信息"
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

          {/* 提货明细 */}
          <FormSection title="提货明细">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted/60 text-left text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">资源</th>
                    <th className="px-3 py-2.5 font-medium">资源名称</th>
                    <th className="px-3 py-2.5 text-right font-medium">数量</th>
                    <th className="w-20 px-3 py-2.5 text-center font-medium">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
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
                            onChange={(e) =>
                              updateLine(l.id, { resource: e.target.value })
                            }
                            placeholder="资源编码"
                            className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={l.resourceName}
                            onChange={(e) =>
                              updateLine(l.id, { resourceName: e.target.value })
                            }
                            placeholder="资源名称"
                            className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            value={l.quantity}
                            onChange={(e) =>
                              updateLine(l.id, { quantity: e.target.value })
                            }
                            placeholder="0"
                            className="w-full rounded border border-input bg-background px-2 py-1.5 text-right text-sm tabular-nums outline-none focus:border-ring"
                          />
                        </td>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addLine}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <Plus className="size-4" />
              新增明细行
            </button>

            <div className="mt-4 grid grid-cols-[5rem_1fr] gap-3">
              <label className="pt-2 text-right text-sm text-muted-foreground">
                备注
              </label>
              <div className="relative">
                <textarea
                  value={remark}
                  maxLength={255}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="长度 0-255 字"
                  rows={3}
                  className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
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
            onClick={() => onSave(project.buyer)}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            保存
          </button>
        </div>
      </div>

      <TransportTrackDialog
        open={trackOpen}
        logisticsNo={logisticsNo}
        distance={distance}
        onClose={() => setTrackOpen(false)}
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
  logisticsNo,
  distance,
  onClose,
}: {
  open: boolean
  logisticsNo: string
  distance: string
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

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
          <div className="mb-5 flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
            <div>
              <span className="text-muted-foreground">物流单号：</span>
              <span className="font-mono text-xs text-foreground">
                {logisticsNo}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">运输距离：</span>
              <span className="font-medium tabular-nums text-foreground">
                {distance ? `${distance} km` : '—'}
              </span>
            </div>
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
