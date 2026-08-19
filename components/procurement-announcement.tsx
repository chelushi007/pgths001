'use client'

import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'

type BidRow = {
  id: number
  code: string
  name: string
  method: string
  budget: string
}

type MaterialRow = {
  id: number
  name: string
  spec: string
  quantity: string
  weight: string
}

const INITIAL_BIDS: BidRow[] = [
  {
    id: 1,
    code: 'HW202600065-2',
    name: '葫芦再生资源有限公司采购项目标段02采购',
    method: '网上询价',
    budget: '2000',
  },
]

const INITIAL_MATERIALS: MaterialRow[] = [
  {
    id: 1,
    name: '废旧钢轨',
    spec: '50kg/m 重废',
    quantity: '200',
    weight: '180.00',
  },
]

let bidSeq = 100
let matSeq = 100

export function ProcurementAnnouncement() {
  const [bids, setBids] = useState<BidRow[]>(INITIAL_BIDS)
  const [materials, setMaterials] = useState<MaterialRow[]>(INITIAL_MATERIALS)
  const [selected, setSelected] = useState<number[]>([])

  const addBid = () => {
    bidSeq += 1
    setBids((prev) => [
      ...prev,
      {
        id: bidSeq,
        code: `HW${new Date().getFullYear()}00${bidSeq}`,
        name: '新关联标段/包',
        method: '网上询价',
        budget: '',
      },
    ])
  }

  const removeBid = (id: number) => {
    setBids((prev) => prev.filter((b) => b.id !== id))
  }

  const addMaterial = () => {
    matSeq += 1
    setMaterials((prev) => [
      ...prev,
      { id: matSeq, name: '', spec: '', quantity: '', weight: '' },
    ])
  }

  const removeSelected = () => {
    setMaterials((prev) => prev.filter((m) => !selected.includes(m.id)))
    setSelected([])
  }

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.length === materials.length ? [] : materials.map((m) => m.id),
    )
  }

  const updateMaterial = (
    id: number,
    field: keyof Omit<MaterialRow, 'id'>,
    value: string,
  ) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* 标题栏 */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-base font-semibold text-foreground">
          发布采购公告
        </h1>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Save className="size-4" />
          发布公告
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* 关联标段/包 */}
        <section className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                关联标段/包
              </h3>
            </div>
            <button
              type="button"
              onClick={addBid}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              关联标段/包
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">序号</th>
                  <th className="px-4 py-3 font-medium">标段/包编号</th>
                  <th className="px-4 py-3 font-medium">标段/包名称</th>
                  <th className="px-4 py-3 font-medium">采购方式</th>
                  <th className="px-4 py-3 text-right font-medium">
                    预算金额(元)
                  </th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {bids.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      暂无关联标段/包
                    </td>
                  </tr>
                ) : (
                  bids.map((b, i) => (
                    <tr
                      key={b.id}
                      className="border-t border-border hover:bg-accent/30"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{b.code}</td>
                      <td className="px-4 py-3">{b.name}</td>
                      <td className="px-4 py-3">{b.method}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {b.budget || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeBid(b.id)}
                          className="text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                        >
                          移除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 公告内容 */}
        <section className="rounded-lg border border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="h-4 w-1 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold text-foreground">公告内容</h3>
          </div>
          <div className="p-5">
            {/* 公告标题独占一行 */}
            <Field label="公告标题" required>
              <input
                defaultValue="葫芦再生资源有限公司采购项目标段02采购公告"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </Field>

            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              <Field label="合同签署时间" required>
                <input
                  type="date"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </Field>
              <Field label="合同签署地点" required>
                <input
                  defaultValue="北京"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </Field>

              <Field label="履约保证金" required>
                <input
                  defaultValue="300"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </Field>
              <Field label="项目所在地" required>
                <div className="flex gap-3">
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20">
                    <option>北京市</option>
                    <option>上海市</option>
                    <option>广东省</option>
                    <option>江苏省</option>
                  </select>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20">
                    <option>东城区</option>
                    <option>西城区</option>
                    <option>朝阳区</option>
                    <option>海淀区</option>
                  </select>
                </div>
              </Field>

              <Field label="交货地点" required>
                <input
                  defaultValue="北京"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </Field>
              <Field label="交货时间" required>
                <input
                  type="date"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </Field>

              <Field label="规格确认" required>
                <input
                  defaultValue="无"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </Field>
              <Field label="付款方式" required>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20">
                  <option>线上支付</option>
                  <option>线下支付</option>
                  <option>分期支付</option>
                </select>
              </Field>

              <Field label="发票要求" required>
                <input
                  defaultValue="无"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* 物资明细 */}
        <section className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                物资明细
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addMaterial}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="size-3.5" />
                新增
              </button>
              <button
                type="button"
                onClick={removeSelected}
                disabled={selected.length === 0}
                className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                删除
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs text-muted-foreground">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="全选"
                      checked={
                        materials.length > 0 &&
                        selected.length === materials.length
                      }
                      onChange={toggleSelectAll}
                      className="size-4 rounded border-input accent-primary"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">序号</th>
                  <th className="px-4 py-3 font-medium">
                    物资名称 <span className="text-destructive">*</span>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    规格型号 <span className="text-destructive">*</span>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    数量 <span className="text-destructive">*</span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    预估重量(吨)
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      暂无物资明细
                    </td>
                  </tr>
                ) : (
                  materials.map((m, i) => (
                    <tr
                      key={m.id}
                      className="border-t border-border hover:bg-accent/30"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`选择第 ${i + 1} 行`}
                          checked={selected.includes(m.id)}
                          onChange={() => toggleSelect(m.id)}
                          className="size-4 rounded border-input accent-primary"
                        />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={m.name}
                          onChange={(e) =>
                            updateMaterial(m.id, 'name', e.target.value)
                          }
                          placeholder="请输入物资名称"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={m.spec}
                          onChange={(e) =>
                            updateMaterial(m.id, 'spec', e.target.value)
                          }
                          placeholder="请输入规格型号"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={m.quantity}
                          onChange={(e) =>
                            updateMaterial(m.id, 'quantity', e.target.value)
                          }
                          placeholder="0"
                          className="w-28 rounded-md border border-input bg-background px-3 py-2 text-right text-sm tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={m.weight}
                          onChange={(e) =>
                            updateMaterial(m.id, 'weight', e.target.value)
                          }
                          placeholder="0.00"
                          className="w-32 rounded-md border border-input bg-background px-3 py-2 text-right text-sm tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
            预估重量为选填项，最终以出售方过磅信息为准。
          </div>
        </section>
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
    <div>
      <label className="mb-1.5 block text-sm text-muted-foreground">
        {required && <span className="mr-0.5 text-destructive">*</span>}
        {label}
      </label>
      {children}
    </div>
  )
}
