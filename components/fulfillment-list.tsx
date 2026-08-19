'use client'

import { useState } from 'react'
import { Search, RefreshCw, Send, Eye, FileText } from 'lucide-react'

type ProjectRow = {
  code: string
  title: string
  flowType: string
  stage: string
  stageTone: 'blue' | 'green'
  signupStart: string
  signupEnd: string
}

const ACTIVE_PROJECTS: ProjectRow[] = [
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
  },
  {
    code: '2087111470823018400',
    title: '钢材周转料出租项目',
    flowType: '出租',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-07-05 09:10:00',
    signupEnd: '2026-07-08 00:00:00',
  },
  {
    code: '2086901355420188160',
    title: '轨枕批量出租（第二批）',
    flowType: '出租',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-06-28 14:00:00',
    signupEnd: '2026-06-30 00:00:00',
  },
  {
    code: '2086331209988110336',
    title: '设备租赁一批',
    flowType: '出租',
    stage: '履约结束',
    stageTone: 'green',
    signupStart: '2026-06-15 10:20:00',
    signupEnd: '2026-06-18 00:00:00',
  },
]

const STAGE_TONE: Record<ProjectRow['stageTone'], string> = {
  blue: 'bg-chart-4/15 text-chart-4',
  green: 'bg-primary/12 text-primary',
}

export function FulfillmentList({
  variant,
}: {
  variant: 'active' | 'ended'
}) {
  const isEnded = variant === 'ended'
  const projects = isEnded ? ENDED_PROJECTS : ACTIVE_PROJECTS
  const stageLabel = isEnded ? '履约结束' : '履约'

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
          <FilterField label="处置方式">
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground outline-none">
              <option>全部</option>
              <option>转让</option>
              <option>出租</option>
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
        {/* 操作按钮 */}
        {!isEnded && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <button
              type="button"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Send className="size-4" />
              发起自主转让
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Send className="size-4" />
              发起自主出租
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
                <th className="px-4 py-3 font-medium">流转方式</th>
                <th className="px-4 py-3 font-medium">当前环节</th>
                <th className="px-4 py-3 font-medium">报名开始</th>
                <th className="px-4 py-3 font-medium">报名截止</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
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
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {isEnded ? (
                          <>
                            <FileText className="size-3.5" />
                            履约详情
                          </>
                        ) : (
                          <>
                            <Eye className="size-3.5" />
                            管理项目
                          </>
                        )}
                      </button>
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
