'use client'

import { useEffect, useRef, useState } from 'react'
import {
  RotateCw,
  Plus,
  Trash2,
  Minus,
  Paperclip,
  X,
  Upload,
  Send,
  Search,
  RefreshCw,
} from 'lucide-react'

type ResourceRow = {
  id: string
  code: string
  name: string
  category: string
  spec: string
  unit: string
  available: number
  taxPrice: number
  originalValue: number
  disposalQty: number
  estimatedWeight: string
  weighFile: string | null
}

const INITIAL_ROWS: ResourceRow[] = [
  {
    id: '1',
    code: '2087474623636705280',
    name: '钢枕',
    category: '周转材料 / 轨道类 / 轨枕',
    spec: '900轨距',
    unit: '根',
    available: 176,
    taxPrice: 500,
    originalValue: 88000,
    disposalQty: 176,
    estimatedWeight: '',
    weighFile: null,
  },
]

type ProjectRow = {
  code: string
  title: string
  flowType: string
  stage: string
  stageTone: 'gray' | 'green' | 'blue'
  signupStart: string
  signupEnd: string
}

const PROJECTS: ProjectRow[] = [
  {
    code: '2089892599778381824',
    title: '演示集团出租一批物资...',
    flowType: '出租',
    stage: '报名',
    stageTone: 'gray',
    signupStart: '2026-08-19 09:48:15',
    signupEnd: '2026-08-20 00:00:00',
  },
  {
    code: '2089891097840062464',
    title: '批量物资处置（5项）',
    flowType: '转让',
    stage: '报名',
    stageTone: 'gray',
    signupStart: '2026-08-19 09:33:09',
    signupEnd: '2026-08-20 00:00:00',
  },
  {
    code: '2089625006320521216',
    title: '处置0808',
    flowType: '转让',
    stage: '成交确认',
    stageTone: 'green',
    signupStart: '2026-08-18 16:06:19',
    signupEnd: '2026-08-18 16:24:00',
  },
  {
    code: '2089616559671742464',
    title: '批量物资处置（3项）',
    flowType: '转让',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-18 15:31:42',
    signupEnd: '2026-08-18 17:00:00',
  },
  {
    code: '2089603431206621184',
    title: '常州仓储基地建设项目...',
    flowType: '转让',
    stage: '成交确认',
    stageTone: 'green',
    signupStart: '2026-08-17 14:38:54',
    signupEnd: '2026-08-19 00:00:00',
  },
  {
    code: '2089230162376921088',
    title: '贝雷片出租测试',
    flowType: '出租',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-17 00:00:00',
    signupEnd: '2026-08-17 14:29:00',
  },
  {
    code: '2088517041526018048',
    title: '8.15出租',
    flowType: '出租',
    stage: '履约',
    stageTone: 'blue',
    signupStart: '2026-08-15 00:00:00',
    signupEnd: '2026-08-16 00:00:00',
  },
  {
    code: '2087742971482083328',
    title: '常州市鼓楼区综合管廊...',
    flowType: '转让',
    stage: '成交确认',
    stageTone: 'green',
    signupStart: '2026-08-13 11:25:05',
    signupEnd: '2026-08-14 00:00:00',
  },
  {
    code: '2087474579198054400',
    title: '昆明市呈贡区仓储基地...',
    flowType: '转让',
    stage: '报名',
    stageTone: 'gray',
    signupStart: '2026-08-09 15:20:00',
    signupEnd: '2026-09-19 23:20:00',
  },
  {
    code: '2087474574429130752',
    title: '重庆市沙坪坝区综合建...',
    flowType: '转让',
    stage: '报名',
    stageTone: 'gray',
    signupStart: '2026-08-07 01:20:00',
    signupEnd: '2026-09-14 06:20:00',
  },
]

const STAGE_TONE: Record<ProjectRow['stageTone'], string> = {
  gray: 'bg-muted text-muted-foreground',
  green: 'bg-primary/12 text-primary',
  blue: 'bg-chart-4/15 text-chart-4',
}

const MODE_CONFIG = {
  rental: {
    flowLabel: '出租',
    flowFilterLabel: '流转方式',
    startBtn: '发起自主出租',
    dialogTitle: '发起自主出租',
    dealOptions: ['网络竞价', '协议出租', '定向出租'],
    priceLabel: '挂牌金额',
    pricePlaceholder: '挂牌金额（元）',
  },
  disposal: {
    flowLabel: '转让',
    flowFilterLabel: '处置方式',
    startBtn: '发起自主转让',
    dialogTitle: '发起自主转让',
    dealOptions: ['网络竞价', '协议转让', '定向转让'],
    priceLabel: '转让底价',
    pricePlaceholder: '转让底价（元）',
  },
} as const

export function PublishAnnouncement({
  mode = 'rental',
}: {
  mode?: 'rental' | 'disposal'
}) {
  const [rentOpen, setRentOpen] = useState(false)
  const cfg = MODE_CONFIG[mode]
  const isDisposal = mode === 'disposal'
  const projects = PROJECTS.filter((p) =>
    isDisposal ? p.flowType === '转让' : p.flowType === '出租',
  )

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
          <FilterField label={cfg.flowFilterLabel}>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground outline-none">
              <option>全部</option>
              {cfg.dealOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="当前环节">
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none">
              <option>挂牌待审核</option>
              <option>报名</option>
              <option>成交确认</option>
              <option>履约</option>
            </select>
          </FilterField>
          <FilterField label="是否终结">
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground outline-none">
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
        {/* 操作按钮 */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <button
            type="button"
            onClick={() => setRentOpen(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Send className="size-4" />
            {cfg.startBtn}
          </button>
        </div>

        {/* 表格 */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">项目编号</th>
                <th className="px-4 py-3 font-medium">项目标题</th>
                <th className="px-4 py-3 font-medium">流转方式</th>
                <th className="px-4 py-3 font-medium">当前环节</th>
                <th className="px-4 py-3 font-medium">报名开始</th>
                <th className="px-4 py-3 font-medium">报名截止</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.code}
                  className="border-t border-border transition-colors hover:bg-accent/30"
                >
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    {p.code}
                  </td>
                  <td className="px-4 py-3 text-foreground">{p.title}</td>
                  <td className="px-4 py-3 text-foreground">{p.flowType}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${STAGE_TONE[p.stageTone]}`}
                    >
                      {p.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {p.signupStart}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {p.signupEnd}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      管理项目
                    </button>
                  </td>
                </tr>
              ))}
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
            <PageBtn>2</PageBtn>
            <PageBtn>3</PageBtn>
            <PageBtn>4</PageBtn>
            <PageBtn>›</PageBtn>
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

      {/* 发起流转弹窗 */}
      <RentDialog
        open={rentOpen}
        mode={mode}
        onClose={() => setRentOpen(false)}
      />
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

/* ============ 发起自主出租弹窗 ============ */

function RentDialog({
  open,
  mode,
  onClose,
}: {
  open: boolean
  mode: 'rental' | 'disposal'
  onClose: () => void
}) {
  const cfg = MODE_CONFIG[mode]
  const isDisposal = mode === 'disposal'
  const [rows, setRows] = useState<ResourceRow[]>(INITIAL_ROWS)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const updateRow = (id: string, patch: Partial<ResourceRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const totalOriginalValue = rows.reduce((sum, r) => sum + r.originalValue, 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={cfg.dialogTitle}
    >
      {/* 遮罩 */}
      <button
        type="button"
        aria-label="关闭弹窗"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      {/* 弹窗主体 */}
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {cfg.dialogTitle}
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

        {/* 可滚动主体 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 关联资源 */}
          <section className="rounded-lg border border-border">
            <div className="flex flex-wrap items-center gap-5 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  关联资源
                </h3>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80"
              >
                <RotateCw className="size-4" />
                重新选���
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80"
              >
                <Plus className="size-4" />
                追加资源
              </button>
              <button
                type="button"
                onClick={() => setRows([])}
                className="flex items-center gap-1.5 text-sm text-destructive transition-colors hover:text-destructive/80"
              >
                <Trash2 className="size-4" />
                清空
              </button>
            </div>

            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/60 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">编码</th>
                    <th className="px-4 py-3 font-medium">名称</th>
                    <th className="px-4 py-3 font-medium">分类</th>
                    <th className="px-4 py-3 font-medium">规格</th>
                    <th className="px-4 py-3 font-medium">单位</th>
                    <th className="px-4 py-3 text-right font-medium">
                      可用数量
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      含税单价
                    </th>
                    <th className="px-4 py-3 text-right font-medium">原值</th>
                    <th className="px-4 py-3 text-center font-medium">
                      {isDisposal ? '处置数量' : '出租数量'}
                    </th>
                    <th className="px-4 py-3 font-medium">预估重量</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-16 text-center text-sm text-muted-foreground"
                      >
                        暂无关联资源，请点击「追加资源」添加
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-border align-top"
                      >
                        <td className="px-4 py-4 font-mono text-xs leading-relaxed text-foreground">
                          {row.code}
                        </td>
                        <td className="px-4 py-4 text-foreground">
                          {row.name}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {row.category}
                        </td>
                        <td className="px-4 py-4 text-foreground">
                          {row.spec}
                        </td>
                        <td className="px-4 py-4 text-foreground">
                          {row.unit}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums text-foreground">
                          {row.available}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums text-foreground">
                          ¥{row.taxPrice.toLocaleString('en-US')}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums text-foreground">
                          ¥{row.originalValue.toLocaleString('en-US')}
                        </td>
                        {/* 处置数量 */}
                        <td className="px-4 py-4">
                          <div className="mx-auto flex w-32 items-center rounded-md border border-input bg-background">
                            <input
                              type="number"
                              value={row.disposalQty}
                              min={0}
                              max={row.available}
                              onChange={(e) =>
                                updateRow(row.id, {
                                  disposalQty: Number(e.target.value),
                                })
                              }
                              className="w-full bg-transparent px-3 py-1.5 text-right text-sm tabular-nums outline-none"
                              aria-label="处置数量"
                            />
                            <div className="flex flex-col border-l border-input">
                              <button
                                type="button"
                                aria-label="增加"
                                onClick={() =>
                                  updateRow(row.id, {
                                    disposalQty: Math.min(
                                      row.available,
                                      row.disposalQty + 1,
                                    ),
                                  })
                                }
                                className="flex h-[15px] w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="size-3" />
                              </button>
                              <button
                                type="button"
                                aria-label="减少"
                                onClick={() =>
                                  updateRow(row.id, {
                                    disposalQty: Math.max(
                                      0,
                                      row.disposalQty - 1,
                                    ),
                                  })
                                }
                                className="flex h-[15px] w-6 items-center justify-center border-t border-input text-muted-foreground hover:text-foreground"
                              >
                                <Minus className="size-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        {/* 预估重量（新增列） */}
                        <td className="px-4 py-4">
                          <div className="flex w-44 flex-col gap-2">
                            <div className="flex items-center rounded-md border border-input bg-background">
                              <input
                                type="number"
                                value={row.estimatedWeight}
                                min={0}
                                placeholder="请输入"
                                onChange={(e) =>
                                  updateRow(row.id, {
                                    estimatedWeight: e.target.value,
                                  })
                                }
                                className="w-full bg-transparent px-3 py-1.5 text-right text-sm tabular-nums outline-none placeholder:text-left placeholder:text-muted-foreground"
                                aria-label="预估重量"
                              />
                              <span className="px-2 text-xs text-muted-foreground">
                                吨
                              </span>
                            </div>

                            {/* 过磅单上传 */}
                            <input
                              ref={(el) => {
                                fileInputs.current[row.id] = el
                              }}
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file)
                                  updateRow(row.id, { weighFile: file.name })
                              }}
                            />
                            {row.weighFile ? (
                              <div className="flex items-center gap-1.5 rounded-md bg-accent/60 px-2 py-1 text-xs text-accent-foreground">
                                <Paperclip className="size-3 shrink-0" />
                                <span
                                  className="truncate"
                                  title={row.weighFile}
                                >
                                  {row.weighFile}
                                </span>
                                <button
                                  type="button"
                                  aria-label="移除过磅单"
                                  onClick={() =>
                                    updateRow(row.id, { weighFile: null })
                                  }
                                  className="ml-auto shrink-0 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  fileInputs.current[row.id]?.click()
                                }
                                className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-input px-2 py-1 text-xs text-primary transition-colors hover:border-primary hover:bg-accent/40"
                              >
                                <Upload className="size-3" />
                                上传过磅单
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 提示 */}
            <div className="border-t border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
              {isDisposal ? '处置数量' : '出租数量'}范围：大于 0
              且不超过资源自身可用数量（修改即时校验）；预估重量可结合上传的过磅单据核定。
            </div>
          </section>

          {/* 基本信息 */}
          <section className="mt-6 rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-4 w-1 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                基本信息
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 md:grid-cols-2">
              <Field label="项目编号">
                <input
                  disabled
                  placeholder="保存后系统自动生成"
                  className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground outline-none"
                />
              </Field>
              <Field label="项目标题" required>
                <input
                  placeholder="请输入项目标题"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </Field>

              <Field label="流转方式" required>
                <span className="inline-flex items-center rounded-md bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                  {cfg.flowLabel}
                </span>
              </Field>
              {isDisposal ? (
                <Field label="处置方式" required>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none">
                    <option>整体转让</option>
                    <option>拆分转让</option>
                    <option>报废处置</option>
                  </select>
                </Field>
              ) : (
                <Field label="出租周期">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center rounded-md border border-input bg-background">
                      <button
                        type="button"
                        className="px-3 py-2 text-muted-foreground hover:text-foreground"
                        aria-label="减少周期"
                      >
                        <Minus className="size-4" />
                      </button>
                      <input
                        className="w-full bg-transparent text-center text-sm outline-none"
                        aria-label="出租周期数值"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 text-muted-foreground hover:text-foreground"
                        aria-label="增加周期"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <select className="w-28 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground outline-none">
                      <option>单位</option>
                      <option>天</option>
                      <option>月</option>
                      <option>年</option>
                    </select>
                  </div>
                </Field>
              )}

              <Field label="交易方式" required>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none">
                  {cfg.dealOptions.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label={cfg.priceLabel}>
                <div className="flex items-center rounded-md border border-input bg-background">
                  <button
                    type="button"
                    className="px-3 py-2 text-muted-foreground hover:text-foreground"
                    aria-label="减少金额"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    placeholder={cfg.pricePlaceholder}
                    className="w-full bg-transparent px-3 py-2 text-center text-sm outline-none placeholder:text-muted-foreground"
                    aria-label={cfg.priceLabel}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-muted-foreground hover:text-foreground"
                    aria-label="增加金额"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  当前关联资源原值：
                  <span className="font-medium text-primary">
                    {totalOriginalValue.toLocaleString('en-US')} 元
                  </span>
                </p>
              </Field>

              <Field label="资产归属单位">
                <input
                  defaultValue="盘古集团"
                  className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground outline-none"
                />
              </Field>
              <Field label="关联资源数">
                <span className="text-sm text-foreground">
                  {rows.length} 项
                </span>
              </Field>
            </div>
          </section>
        </div>

        {/* 底部操作栏 */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            取消
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            保存并发布
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-3">
      <label className="pt-2 text-right text-sm text-muted-foreground">
        {required && <span className="mr-0.5 text-destructive">*</span>}
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
