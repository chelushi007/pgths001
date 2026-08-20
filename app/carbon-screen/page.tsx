import type { Metadata } from 'next'
import { CarbonDataScreen } from '@/components/carbon-data-screen'

export const metadata: Metadata = {
  title: '循环资源碳绩效数据中心',
  description: '循环资源交易平台碳绩效可视化大屏',
}

export default function CarbonScreenPage() {
  return <CarbonDataScreen />
}
