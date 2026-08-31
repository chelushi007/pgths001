'use client'

import { useMemo, useState } from 'react'
import { Settings2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const ROLE_LABELS = ['处置方', '回收商', '钢厂', '平台'] as const

type Role = (typeof ROLE_LABELS)[number]

export function BusinessConfig() {
  const [weights, setWeights] = useState<Record<Role, number>>({
    处置方: 30,
    回收商: 30,
    钢厂: 30,
    平台: 10,
  })
  const total = useMemo(() => Object.values(weights).reduce((sum, value) => sum + value, 0), [weights])
  const valid = total === 100

  return (
    <div className="min-h-full bg-[#f5f7fa] font-sans">
      <div className="border-b bg-card px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings2 className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">业务配置</h1>
            <p className="mt-1 text-sm text-muted-foreground">配置资源处置回收转钢业务中的碳减排贡献分配规则。</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">碳减排贡献权重</CardTitle>
              <CardDescription className="mt-1">自定义处置方、回收商、钢厂与平台四类角色的贡献比例，合计应为 100%。</CardDescription>
            </div>
            <span className={valid ? 'text-sm font-medium text-primary' : 'text-sm font-medium text-destructive'}>合计 {total}%</span>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_LABELS.map((role) => (
              <label key={role} className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-3 text-sm">
                <span className="font-medium">{role}</span>
                <span className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={weights[role]}
                    aria-label={`${role}贡献权重`}
                    onChange={(event) => setWeights((current) => ({ ...current, [role]: Math.max(0, Math.min(100, Number(event.target.value) || 0)) }))}
                    className="h-9 w-20 text-right"
                  />
                  <span className="text-muted-foreground">%</span>
                </span>
              </label>
            ))}
            <div className="flex justify-end sm:col-span-2 lg:col-span-4">
              <Button disabled={!valid}>
                <Save data-icon="inline-start" />保存配置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
