'use client'

import { useState } from 'react'
import { LayoutDashboard, Bell, Search } from 'lucide-react'
import { SidebarNav } from '@/components/sidebar-nav'
import { PublishAnnouncement } from '@/components/publish-announcement'
import { FulfillmentList } from '@/components/fulfillment-list'
import { ProcurementAnnouncement } from '@/components/procurement-announcement'

export default function Page() {
  const [active, setActive] = useState({
    key: 'd-publish',
    label: '发布公告',
    group: '个人工作台',
  })

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav
        activeKey={active.key}
        onSelect={(key, label, group) => setActive({ key, label, group })}
      />

      {/* 右侧内容区 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶部栏 */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{active.group}</span>
            <span className="text-border">/</span>
            <span className="font-medium text-foreground">{active.label}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="搜索"
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Search className="size-[18px]" />
            </button>
            <button
              type="button"
              aria-label="通知"
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Bell className="size-[18px]" />
            </button>
            <div className="ml-1 flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                管
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-foreground">管理员</p>
                <p className="text-xs text-muted-foreground">平台运营</p>
              </div>
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-hidden p-6">
          {active.key === 'publish' ? (
            <PublishAnnouncement mode="rental" />
          ) : active.key === 'd-publish' ? (
            <PublishAnnouncement mode="disposal" />
          ) : active.key === 'perform' ? (
            <FulfillmentList variant="active" mode="rental" />
          ) : active.key === 'perform-end' ? (
            <FulfillmentList variant="ended" mode="rental" />
          ) : active.key === 'd-perform' ? (
            <FulfillmentList variant="active" mode="disposal" />
          ) : active.key === 'd-perform-end' ? (
            <FulfillmentList variant="ended" mode="disposal" />
          ) : active.key === 'transferee-perform' ? (
            <FulfillmentList variant="active" mode="disposal-transferee" />
          ) : active.key === 'transferee-perform-end' ? (
            <FulfillmentList variant="ended" mode="disposal-transferee" />
          ) : active.key === 'lessee-perform' ? (
            <FulfillmentList variant="active" mode="rental-lessee" />
          ) : active.key === 'lessee-perform-end' ? (
            <FulfillmentList variant="ended" mode="rental-lessee" />
          ) : active.key === 'p-publish' ? (
            <ProcurementAnnouncement />
          ) : active.key === 'p-perform' ? (
            <FulfillmentList variant="active" mode="procurement-buyer" />
          ) : active.key === 'p-perform-end' ? (
            <FulfillmentList variant="ended" mode="procurement-buyer" />
          ) : active.key === 's-perform' ? (
            <FulfillmentList variant="active" mode="procurement" />
          ) : active.key === 's-perform-end' ? (
            <FulfillmentList variant="ended" mode="procurement" />
          ) : active.key === 'bid-buyer-publish' ||
            active.key === 'agr-buyer-publish' ? (
            <ProcurementAnnouncement />
          ) : active.key === 'bid-buyer-perform' ||
            active.key === 'agr-buyer-perform' ? (
            <FulfillmentList variant="active" mode="procurement-scrap-buyer" />
          ) : active.key === 'bid-buyer-perform-end' ||
            active.key === 'agr-buyer-perform-end' ? (
            <FulfillmentList variant="ended" mode="procurement-scrap-buyer" />
          ) : active.key === 'bid-supplier-perform' ||
            active.key === 'agr-base-perform' ? (
            <FulfillmentList variant="active" mode="procurement-scrap" />
          ) : active.key === 'bid-supplier-perform-end' ||
            active.key === 'agr-base-perform-end' ? (
            <FulfillmentList variant="ended" mode="procurement-scrap" />
          ) : (
            <div className="flex h-full min-h-[calc(100vh-8rem)] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <LayoutDashboard className="size-8" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-foreground text-balance">
                {active.label}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
                该模块内容区待设计，可在此处继续搭建业务功能。
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
