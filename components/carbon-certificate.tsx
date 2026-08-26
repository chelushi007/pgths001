'use client'

import { useEffect, useState } from 'react'
import {
  X,
  ShieldCheck,
  FileText,
  Eye,
  Wallet,
  Truck,
  Recycle,
  Leaf,
  Download,
  MapPin,
  Globe,
  Landmark,
  Zap,
  TrendingDown,
  Building2,
  HardHat,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'

export type CarbonCertProject = {
  code: string
  title: string
  // 由碳核算查询列表带入的业务字段：资源名称、规格、重量、出租次数（缺省则回退凭证默认值）
  resourceName?: string
  resourceSpec?: string
  weight?: number
  rentalSeq?: number
}

/* ---------------- 数据 ---------------- */

type InfoFlowStep = {
  title: string
  desc: string
  time: string
  files?: string[]
}

const INFO_FLOW: InfoFlowStep[] = [
  {
    title: '公告发布',
    desc: '出租方发布周转材料租赁公告，公示物资清单与租赁条件',
    time: '2026-05-12 09:00',
    files: ['周转材料租赁公告.pdf'],
  },
  {
    title: '询价（竞价）',
    desc: '多家承租方在线报价参与竞价，平台记录报价明细',
    time: '2026-05-15 16:30',
    files: ['竞价报价单.pdf'],
  },
  {
    title: '择标',
    desc: '综合报价与信用评估完成择标，确定成交承租方',
    time: '2026-05-18 11:20',
    files: ['择标结果确认单.pdf'],
  },
  {
    title: '订单创建',
    desc: '承租方提交租赁需求，生成电子订单',
    time: '2026-05-20 09:32',
  },
  {
    title: '合同签订',
    desc: '双方完成电子合同在线签章',
    time: '2026-05-21 10:15',
    files: ['周转材料租赁合同.pdf', '合同补充协议.pdf'],
  },
  {
    title: '碳数据采集',
    desc: '采集物资规格、数量、租期等核算要素',
    time: '2026-05-22 14:10',
  },
  {
    title: '碳量核算',
    desc: '依据 GB/T 51366 完成碳足迹核算',
    time: '2026-05-22 15:40',
  },
  {
    title: '凭证生成',
    desc: '区块链存证，生成不可篡改碳凭证',
    time: '2026-05-22 16:05',
  },
]

type FundFlow = {
  title: string
  channel: '线上支付' | '线下支付'
  amount: string
  status: string
  method: string
  time: string
  files: string[]
}

const FUND_FLOW: FundFlow[] = [
  {
    title: '租赁押金',
    channel: '线上支付',
    amount: '¥25,720.00',
    status: '已缴纳',
    method: '平台担保支付（微信支付）',
    time: '2026-05-21 11:20',
    files: ['押金支付电子回单.pdf'],
  },
  {
    title: '首期租金',
    channel: '线上支付',
    amount: '¥64,300.00',
    status: '已支付',
    method: '平台在线支付（企业网银）',
    time: '2026-05-22 09:00',
    files: ['首期租金结算单.pdf'],
  },
  {
    title: '尾期租金',
    channel: '线下支付',
    amount: '¥38,580.00',
    status: '已结清',
    method: '对公银行转账（中国银行）',
    time: '2026-08-20 17:30',
    files: ['尾期租金结算单.pdf', '银行转账回单.pdf', '电子发票.pdf'],
  },
  {
    title: '押金退还',
    channel: '线上支付',
    amount: '¥25,720.00',
    status: '已退还',
    method: '平台原路退回（微信支付）',
    time: '2026-08-22 10:00',
    files: ['押金退还电子回单.pdf'],
  },
]

type LogisticsItem = {
  title: string
  badge?: string
  desc: string
  orderNo?: string
  time: string
  files: string[]
  track?: boolean
  tone: 'ship' | 'use' | 'recycle'
}

const LOGISTICS: LogisticsItem[] = [
  {
    title: '第 1 批次发货',
    badge: '发货 1/3',
    desc: '中铁物资华南仓 → 项目现场 · 发货 32.6 吨（1 车次），已签收',
    orderNo: 'THD20260522000041',
    time: '2026-05-22 08:00',
    files: [
      '提货单（THD20260522000041）.pdf',
      '出库单（第1批）.pdf',
      '过磅单（第1批·32.6吨）.jpg',
      '签收单（第1批）.pdf',
    ],
    track: true,
    tone: 'ship',
  },
  {
    title: '第 2 批次发货',
    badge: '发货 2/3',
    desc: '中铁物资华南仓 → 项目现场 · 发货 30.4 吨（1 车次），已签收',
    orderNo: 'THD20260526000053',
    time: '2026-05-26 08:20',
    files: [
      '提货单（THD20260526000053）.pdf',
      '出库单（第2批）.pdf',
      '过磅单（第2批·30.4吨）.jpg',
      '签收单（第2批）.pdf',
    ],
    track: true,
    tone: 'ship',
  },
  {
    title: '第 3 批次发货',
    badge: '发货 3/3',
    desc: '中铁物资华南仓 → 项目现场 · 发货 23.4 吨（1 车次），已签收',
    orderNo: 'THD20260602000067',
    time: '2026-06-02 09:00',
    files: [
      '提货单（THD20260602000067）.pdf',
      '出库单（第3批）.pdf',
      '过磅单（第3批·23.4吨）.jpg',
      '签收单（第3批）.pdf',
    ],
    track: true,
    tone: 'ship',
  },
  {
    title: '使用周转',
    desc: '现场周转使用 90 天，累计在租 86.4 吨',
    time: '2026-06-02 至 2026-08-20',
    files: [],
    tone: 'use',
  },
  {
    title: '第 1 批次回收',
    badge: '回收 1/2',
    desc: '项目现场 → 中铁物资华南仓 · 退租回收 50.0 吨（1 车次），已入库',
    orderNo: 'THD20260821000089',
    time: '2026-08-21 15:10',
    files: [
      '退租提货单（THD20260821000089）.pdf',
      '回收入库单（第1批）.pdf',
    ],
    track: true,
    tone: 'recycle',
  },
  {
    title: '第 2 批次回收',
    badge: '回收 2/2',
    desc: '项目现场 → 中铁物资华南仓 · 退租回收 36.4 吨（1 车次），已入库',
    orderNo: 'THD20260823000094',
    time: '2026-08-23 16:40',
    files: [
      '退租提货单（THD20260823000094）.pdf',
      '回收入库单（第2批）.pdf',
    ],
    track: true,
    tone: 'recycle',
  },
]

type TransportRow = {
  stage: string
  mode: string
  vehicle: string
  energy: string
  energyTone: 'new' | 'fuel'
  amount: string
  distance: string
  factor: string
  emission: string
  baseline: string
  reduction: string
}

const TRANSPORT_ROWS: TransportRow[] = [
  {
    stage: '出库发运（出租方→承租方）',
    mode: '陆运',
    vehicle: '电动重卡 粤A·D8856（比亚迪 T7）',
    energy: '新能源',
    energyTone: 'new',
    amount: '86.4',
    distance: '68',
    factor: '0.0418',
    emission: '0.25',
    baseline: '0.57',
    reduction: '0.32',
  },
  {
    stage: '干线运输（出租方→承租方）',
    mode: '水运',
    vehicle: '内河货船 珠航货0231',
    energy: '燃油',
    energyTone: 'fuel',
    amount: '86.4',
    distance: '120',
    factor: '0.0156',
    emission: '0.16',
    baseline: '—',
    reduction: '—',
  },
  {
    stage: '退租回收（承租方→出租方）',
    mode: '陆运',
    vehicle: '柴油货车 粤A·F2103（解放 J6）',
    energy: '燃油',
    energyTone: 'fuel',
    amount: '86.4',
    distance: '68',
    factor: '0.0962',
    emission: '0.57',
    baseline: '—',
    reduction: '—',
  },
]

type ReuseRow = {
  name: string
  spec: string
  weight: string
  factor: string
  reduction: string
}

const REUSE_ROWS: ReuseRow[] = [
  { name: '钢管脚手架', spec: 'Φ48×3.5mm', weight: '42.6', factor: '2340', reduction: '99.68' },
  { name: '扣件', spec: '直角扣件', weight: '12.8', factor: '1120', reduction: '14.34' },
  { name: '钢跳板', spec: '2.0m', weight: '21.6', factor: '2340', reduction: '50.54' },
  { name: '可调底座', spec: 'U型', weight: '9.4', factor: '1860', reduction: '17.48' },
]

/* ---------------- 处置（转让）数据 ---------------- */

const INFO_FLOW_D: InfoFlowStep[] = [
  {
    title: '公告发布',
    desc: '转让方发布闲置/废旧物资转让公告，公示物资清单与转让条件',
    time: '2026-05-12 09:00',
    files: ['物资转让公告.pdf'],
  },
  {
    title: '竞价（网络竞价）',
    desc: '多家受让方在线报价参与竞价，价高者得',
    time: '2026-05-15 16:30',
    files: ['竞价报价单.pdf'],
  },
  {
    title: '成交确认',
    desc: '确认最高有效报价，确定成交受让方',
    time: '2026-05-18 11:20',
    files: ['成交确认单.pdf'],
  },
  {
    title: '订单创建',
    desc: '受让方提交受让需求，生成电子订单',
    time: '2026-05-20 09:32',
  },
  {
    title: '合同签订',
    desc: '双方完成电子转让合同在线签章，货权转移',
    time: '2026-05-21 10:15',
    files: ['物资转让合同.pdf'],
  },
  {
    title: '碳数据采集',
    desc: '采集物资规格、数量、交付运输等核算要素',
    time: '2026-05-22 14:10',
  },
  {
    title: '碳量核算',
    desc: '依据 GB/T 51366 完成碳足迹核算',
    time: '2026-05-22 15:40',
  },
  {
    title: '凭证生成',
    desc: '区块链存证，生成不可篡改碳凭证',
    time: '2026-05-22 16:05',
  },
]

const FUND_FLOW_D: FundFlow[] = [
  {
    title: '履约保证金',
    channel: '线上支付',
    amount: '¥15,000.00',
    status: '已缴纳',
    method: '平台担保支付（微信支付）',
    time: '2026-05-21 11:20',
    files: ['保证金支付电子回单.pdf'],
  },
  {
    title: '成交转让款',
    channel: '线上支付',
    amount: '¥182,600.00',
    status: '已支付',
    method: '平台在线支付（企业网银）',
    time: '2026-05-22 09:00',
    files: ['转让款结算单.pdf', '电子发票.pdf'],
  },
  {
    title: '保证金退还',
    channel: '线上支付',
    amount: '¥15,000.00',
    status: '已退还',
    method: '平台原路退回（微信支付）',
    time: '2026-05-24 10:00',
    files: ['保证金退还电子回单.pdf'],
  },
]

const LOGISTICS_D: LogisticsItem[] = [
  {
    title: '第 1 批次交付',
    badge: '交付 1/2',
    desc: '转让方仓库 → 受让方指定地点 · 交付 48.0 吨（1 车次），已签收',
    orderNo: 'THD20260522000041',
    time: '2026-05-22 08:00',
    files: [
      '提货单（THD20260522000041）.pdf',
      '出库单（第1批）.pdf',
      '过磅单（第1批·48.0吨）.jpg',
      '签收单（第1批）.pdf',
    ],
    track: true,
    tone: 'ship',
  },
  {
    title: '第 2 批次交付',
    badge: '交付 2/2',
    desc: '转让方仓库 → 受让方指定地点 · 交付 38.4 吨（1 车次），已签收',
    orderNo: 'THD20260526000053',
    time: '2026-05-26 08:20',
    files: [
      '提货单（THD20260526000053）.pdf',
      '出库单（第2批）.pdf',
      '过磅单（第2批·38.4吨）.jpg',
      '签收单（第2批）.pdf',
    ],
    track: true,
    tone: 'ship',
  },
  {
    title: '货权转移完成',
    desc: '物资全部交付受让方，货权正式转移，由受让方循环再利用',
    time: '2026-05-26 至今',
    files: [],
    tone: 'use',
  },
]

const TRANSPORT_ROWS_D: TransportRow[] = [
  {
    stage: '出库交付（转让方→受让方）',
    mode: '陆运',
    vehicle: '电动重卡 粤A·D8856（比亚迪 T7）',
    energy: '新能源',
    energyTone: 'new',
    amount: '86.4',
    distance: '68',
    factor: '0.0418',
    emission: '0.25',
    baseline: '0.57',
    reduction: '0.32',
  },
  {
    stage: '干线运输（转让方→受让方）',
    mode: '水运',
    vehicle: '内河货船 珠航货0231',
    energy: '燃油',
    energyTone: 'fuel',
    amount: '86.4',
    distance: '120',
    factor: '0.0156',
    emission: '0.16',
    baseline: '—',
    reduction: '—',
  },
]

const REUSE_ROWS_D: ReuseRow[] = [
  { name: '废旧钢管', spec: 'Φ48×3.5mm', weight: '46.2', factor: '2340', reduction: '108.11' },
  { name: '扣件', spec: '直角扣件', weight: '13.6', factor: '1120', reduction: '15.23' },
  { name: '钢跳板', spec: '2.0m', weight: '18.2', factor: '2340', reduction: '42.59' },
  { name: '型钢废料', spec: 'H型钢', weight: '8.4', factor: '2100', reduction: '17.64' },
]

/* ---------------- 采购（供货）数据 ---------------- */

const INFO_FLOW_P: InfoFlowStep[] = [
  {
    title: '采购公告发布',
    desc: '采购方发布废旧物资采购公告，公示采购清单与采购方式',
    time: '2026-05-12 09:00',
    files: ['物资采购公告.pdf'],
  },
  {
    title: '询价报价（网上询价）',
    desc: '多家供应商在线响应报价，采购方择优比选',
    time: '2026-05-15 16:30',
    files: ['供应商报价单.pdf'],
  },
  {
    title: '成交确认',
    desc: '确认中选供应商，锁定成交单价与供货清单',
    time: '2026-05-18 11:20',
    files: ['成交确认单.pdf'],
  },
  {
    title: '订单创建',
    desc: '采购方生成采购订单，明确供货数量与交付要求',
    time: '2026-05-20 09:32',
  },
  {
    title: '合同签订',
    desc: '供需双方完成电子采购合同在线签章',
    time: '2026-05-21 10:15',
    files: ['物资采购合同.pdf'],
  },
  {
    title: '碳数据采集',
    desc: '采集供货物资规格、过磅重量、送货运输等核算要素',
    time: '2026-05-22 14:10',
  },
  {
    title: '碳量核算',
    desc: '依据 GB/T 51366 完成碳足迹核算',
    time: '2026-05-22 15:40',
  },
  {
    title: '凭证生成',
    desc: '区块链存证，生成不可篡改碳凭证',
    time: '2026-05-22 16:05',
  },
]

const FUND_FLOW_P: FundFlow[] = [
  {
    title: '履约保证金',
    channel: '线上支付',
    amount: '¥15,000.00',
    status: '已缴纳',
    method: '平台担保支付（供应商缴纳）',
    time: '2026-05-21 11:20',
    files: ['保证金支付电子回单.pdf'],
  },
  {
    title: '采购货款',
    channel: '线上支付',
    amount: '¥176,400.00',
    status: '已收款',
    method: '采购方在线支付货款（企业网银）',
    time: '2026-05-27 09:00',
    files: ['货款结算单.pdf', '电子发票.pdf'],
  },
  {
    title: '保证金退还',
    channel: '线上支付',
    amount: '¥15,000.00',
    status: '已退还',
    method: '平台原路退回供应商',
    time: '2026-05-28 10:00',
    files: ['保证金退还电子回单.pdf'],
  },
]

const LOGISTICS_P: LogisticsItem[] = [
  {
    title: '第 1 批次供货',
    badge: '交付 1/2',
    desc: '供应商仓库 → 采购方指定地点 · 供货 48.0 吨（1 车次），已验收',
    orderNo: 'SHD20260522000041',
    time: '2026-05-22 08:00',
    files: [
      '送货单（SHD20260522000041）.pdf',
      '出库单（第1批）.pdf',
      '过磅单（第1批·48.0吨）.jpg',
      '验收单（第1批）.pdf',
    ],
    track: true,
    tone: 'ship',
  },
  {
    title: '第 2 批次供货',
    badge: '交付 2/2',
    desc: '供应商仓库 → 采购方指定地点 · 供货 38.4 吨（1 车次），已验收',
    orderNo: 'SHD20260526000053',
    time: '2026-05-26 08:20',
    files: [
      '送货单（SHD20260526000053）.pdf',
      '出库单（第2批）.pdf',
      '过磅单（第2批·38.4吨）.jpg',
      '验收单（第2批）.pdf',
    ],
    track: true,
    tone: 'ship',
  },
  {
    title: '验收入库完成',
    desc: '物资全部交付采购方并完成验收入库，进入循环再利用',
    time: '2026-05-26 至今',
    files: [],
    tone: 'use',
  },
]

const TRANSPORT_ROWS_P: TransportRow[] = [
  {
    stage: '送货运输（供应商→采购方）',
    mode: '陆运',
    vehicle: '电动重卡 粤A·D8856（比亚迪 T7）',
    energy: '新能源',
    energyTone: 'new',
    amount: '86.4',
    distance: '75',
    factor: '0.0418',
    emission: '0.27',
    baseline: '0.62',
    reduction: '0.35',
  },
]

const REUSE_ROWS_P: ReuseRow[] = [
  { name: '废旧钢轨', spec: '50kg/m 重废', weight: '52.4', factor: '2340', reduction: '122.62' },
  { name: '废旧钢管', spec: 'Φ48×3.5mm', weight: '18.6', factor: '2340', reduction: '43.52' },
  { name: '型钢废料', spec: 'H型钢', weight: '15.4', factor: '2100', reduction: '32.34' },
]

type CertConfig = {
  certTitle: string
  ownerLabel: string
  ownerValue: string
  counterpartyLabel: string
  counterpartyValue: string
  infoFlow: InfoFlowStep[]
  fundFlow: FundFlow[]
  logistics: LogisticsItem[]
  transportRows: TransportRow[]
  reuseRows: ReuseRow[]
  flowLabel: string
  reuseTitle: string
  transportTitle: string
  scopeText: string
  materialWeight: string
  reuseTotal: string
  transportTotal: string
  transportNewReduction: string
  netReduction: string
  netRate: string
  // 碳凭证归属主体（如转让业务归属受让方）；未设置时不展示归属字段
  holder?: string
  // 运输碳排放计入碳减排量的扣减项（仅出租业务）：设置后碳减排量 =（物资重量 × 新品排放因子）- 出库运输 - 退租运输
  deductTransport?: {
    outbound: string
    return: string
  }
  // 出租整备加工碳排放（仅出租业务）：未设置时不展示整备加工区
  prep?: {
    emission: string
    weightBefore: string
    weightAfter: string
    types: string[]
    rows: {
      process: string
      energy: string
      factor: string
      emission: string
    }[]
  }
  orderNo: string
  flow: {
    ownerTitle: string
    ownerSub: string
    counterpartyTitle: string
    counterpartySub: string
    forwardLabel: string
    forwardNote: string
    reuseSub: string
    hasReturn: boolean
  }
}

const CERT_CONFIG: Record<'rental' | 'disposal' | 'procurement', CertConfig> = {
  rental: {
    certTitle: '绿色循环碳减排凭证',
    ownerLabel: '出租单位',
    ownerValue: '中铁物资/华南公司',
    counterpartyLabel: '承租单位',
    counterpartyValue: '广州帝隆科技股份有限公司',
    infoFlow: INFO_FLOW,
    fundFlow: FUND_FLOW,
    logistics: LOGISTICS,
    transportRows: TRANSPORT_ROWS,
    reuseRows: REUSE_ROWS,
    flowLabel: '租赁',
    reuseTitle: '本次租赁循环利用减排明细',
    transportTitle: '本次租赁运输碳排放',
    scopeText:
      '（订单 ZLDD20260520002），仅统计与本次租赁直接相关的循环利用减排，并扣减出库运输与退租运输碳排放，不含历史周转累计减碳量。',
    materialWeight: '86.40 吨',
    reuseTotal: '182.05',
    transportTotal: '0.98',
    transportNewReduction: '0.32',
    deductTransport: {
      outbound: '0.41',
      return: '0.57',
    },
    netReduction: '181.07',
    netRate: '99.5',
    holder: '广州帝隆科技股份有限公司（承租方）',
    prep: {
      emission: '0.46',
      weightBefore: '86.40 吨',
      weightAfter: '85.92 吨',
      types: ['清洗', '除锈', '检测', '维修'],
      rows: [
        { process: '清洗', energy: '电力', factor: '2.30', emission: '0.12' },
        { process: '除锈', energy: '电力', factor: '3.15', emission: '0.19' },
        { process: '检测', energy: '电力', factor: '0.85', emission: '0.05' },
        { process: '维修（焊接/矫正）', energy: '电力', factor: '1.72', emission: '0.10' },
      ],
    },
    orderNo: 'ZLDD20260520002',
    flow: {
      ownerTitle: '出租方',
      ownerSub: '中铁物资/华南公司',
      counterpartyTitle: '承租方',
      counterpartySub: '广州帝隆科技股份有限公司',
      forwardLabel: '出库发运',
      forwardNote: '物资运输至承租方',
      reuseSub: '检修入库 · 再次出租',
      hasReturn: true,
    },
  },
  disposal: {
    certTitle: '资源转让循环利用碳减排凭证',
    ownerLabel: '转让单位',
    ownerValue: '中铁物资/华南公司',
    counterpartyLabel: '受让单位',
    counterpartyValue: '广州资源回收有限公司',
    infoFlow: INFO_FLOW_D,
    fundFlow: FUND_FLOW_D,
    logistics: LOGISTICS_D,
    transportRows: TRANSPORT_ROWS_D,
    reuseRows: REUSE_ROWS_D,
    flowLabel: '转让',
    reuseTitle: '本次转让循环利用减排明细',
    transportTitle: '本次转让运输碳排放',
    scopeText:
      '（订单 ZRDD20260520002），仅统计与本次转让直接相关的资源循环利用减排，单程交付运输碳排放单独列示、不计入碳减排量，货权转移后不含受让方后续使用排放。',
    materialWeight: '86.40 吨',
    reuseTotal: '183.57',
    transportTotal: '0.41',
    transportNewReduction: '0.32',
    netReduction: '183.57',
    netRate: '100',
    holder: '广州资源回收有限公司（受让方）',
    orderNo: 'ZRDD20260520002',
    flow: {
      ownerTitle: '转让方',
      ownerSub: '中铁物资/华南公司',
      counterpartyTitle: '受让方',
      counterpartySub: '广州资源回收有限公司',
      forwardLabel: '出库交付',
      forwardNote: '货权转移至受让方',
      reuseSub: '拆解检修 · 循环再利用',
      hasReturn: false,
    },
  },
  procurement: {
    certTitle: '资源回收利用碳减排凭证',
    ownerLabel: '供货单位',
    ownerValue: '中铁物资/华南公司',
    counterpartyLabel: '采购单位',
    counterpartyValue: '葫芦再生资源有限公司',
    infoFlow: INFO_FLOW_P,
    fundFlow: FUND_FLOW_P,
    logistics: LOGISTICS_P,
    transportRows: TRANSPORT_ROWS_P,
    reuseRows: REUSE_ROWS_P,
    flowLabel: '采购供货',
    reuseTitle: '本次采购供货循环利用减排明细',
    transportTitle: '本次采购供货运输碳排放',
    scopeText:
      '（订单 CGDD20260520002），仅统计与本次采购供货直接相关的资源回收利用减排，单程送货运输碳排放单独列示、不计入碳减排量，验收入库后不含采购方后续加工排放。',
    materialWeight: '86.40 吨',
    reuseTotal: '198.48',
    transportTotal: '0.27',
    transportNewReduction: '0.35',
    netReduction: '198.48',
    netRate: '100',
    orderNo: 'CGDD20260520002',
    flow: {
      ownerTitle: '供应商',
      ownerSub: '中铁物资/华南公司',
      counterpartyTitle: '采购方',
      counterpartySub: '葫芦再生资源有限公司',
      forwardLabel: '送货交付',
      forwardNote: '供货至采购方',
      reuseSub: '验收入库 · 循环再利用',
      hasReturn: false,
    },
  },
}

/* ---------------- 组件 ---------------- */

export function CarbonCertificate({
  open,
  project,
  mode = 'rental',
  onClose,
}: {
  open: boolean
  project: CarbonCertProject | null
  mode?: 'rental' | 'disposal' | 'procurement'
  onClose: () => void
}) {
  const cfg = CERT_CONFIG[mode]
  const [tab, setTab] = useState<'cert' | 'account'>('cert')

  useEffect(() => {
    if (!open) return
    setTab('cert')
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

  if (!open || !project) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="碳凭证"
        className="my-2 flex w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between bg-chart-4 px-6 py-4 text-primary-foreground">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-5" />
            <span className="text-base font-semibold">碳凭证</span>
            <span className="rounded bg-primary-foreground/20 px-2 py-0.5 font-mono text-xs">
              {cfg.orderNo}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-md p-1 transition-colors hover:bg-primary-foreground/15"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-6 border-b border-border bg-card px-6">
          <TabButton active={tab === 'cert'} onClick={() => setTab('cert')}>
            凭证
          </TabButton>
          <TabButton active={tab === 'account'} onClick={() => setTab('account')}>
            碳足迹与碳核算
          </TabButton>
        </div>

        {/* 内容区 */}
        <div className="max-h-[calc(100vh-11rem)] overflow-y-auto bg-muted/30 px-6 py-5">
          {tab === 'cert' ? <CertTab cfg={cfg} project={project} /> : <AccountTab cfg={cfg} />}
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            关闭
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-chart-4 px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-chart-4/90"
          >
            <Download className="size-4" />
            {tab === 'cert' ? '下载碳凭证' : '导出核算报告'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- 凭证 Tab ---------------- */

function CertTab({ cfg, project }: { cfg: CertConfig; project: CarbonCertProject }) {
  return (
    <div className="flex flex-col gap-6">
      {/* 凭证头卡 */}
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <span className="font-semibold text-foreground">{cfg.certTitle}</span>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            已核发
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4">
          <KV label="凭证编号" value="TC20260520002" mono />
          <KV label="关联订单" value={cfg.orderNo} mono />
          <KV label="资源名称" value={project.resourceName ?? cfg.reuseRows[0]?.name ?? '—'} strong />
          <KV label="资源规格" value={project.resourceSpec ?? cfg.reuseRows[0]?.spec ?? '—'} />
          <KV
            label="物资数量"
            value={project.weight != null ? `${project.weight.toFixed(2)} 吨` : cfg.materialWeight}
            strong
          />
          {project.rentalSeq != null && (
            <KV label="出租次数" value={`第 ${project.rentalSeq} 次`} strong />
          )}
          <KV
            label="核算减碳量"
            value={`${cfg.netReduction} tCO₂e`}
            strong
            accent
          />
          {cfg.holder && (
            <KV label="凭证归属" value={cfg.holder} strong accent />
          )}
          <KV label={cfg.ownerLabel} value={cfg.ownerValue} />
          <KV label={cfg.counterpartyLabel} value={cfg.counterpartyValue} span2 />
          <KV label="核发日期" value="2026-05-22 14:10" />
          <KV label="核算依据" value="GB/T 51366" />
          <KV label="存证方式" value="区块链存证" />
        </div>
        <div className="mt-4 rounded-lg bg-card px-3 py-2 text-xs text-muted-foreground">
          凭证哈希：<span className="font-mono">0x7f3a…e91c</span>，已上链存证，可追溯不可篡改。
        </div>
      </div>

      {/* 信息流 */}
      <SectionCard icon={FileText} title="信息流" iconTone="chart-4">
        <ol className="flex flex-col">
          {cfg.infoFlow.map((step, i) => (
            <TimelineItem
              key={step.title}
              last={i === cfg.infoFlow.length - 1}
              dotTone="chart-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {step.time}
                </span>
              </div>
              {step.files && step.files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {step.files.map((f) => (
                    <FileChip key={f} name={f} />
                  ))}
                </div>
              )}
            </TimelineItem>
          ))}
        </ol>
      </SectionCard>

      {/* 资金流 */}
      <SectionCard icon={Wallet} title="资金流" iconTone="chart-5">
        <ol className="flex flex-col">
          {cfg.fundFlow.map((item, i) => (
            <TimelineItem
              key={item.title}
              last={i === cfg.fundFlow.length - 1}
              dotTone="chart-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <ChannelBadge channel={item.channel} />
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    <span className="font-semibold tabular-nums">{item.amount}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{item.status}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Landmark className="size-3.5" />
                    支付方式：{item.method}
                  </p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {item.time}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.files.map((f) => (
                  <FileChip key={f} name={f} />
                ))}
              </div>
            </TimelineItem>
          ))}
        </ol>
      </SectionCard>

      {/* 物流 */}
      <SectionCard icon={Truck} title="物流" iconTone="primary">
        <ol className="flex flex-col">
          {cfg.logistics.map((item, i) => (
            <TimelineItem
              key={item.title}
              last={i === cfg.logistics.length - 1}
              dotTone="primary"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    {item.badge && (
                      <span className="inline-flex items-center gap-1 rounded bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary">
                        <Truck className="size-3" />
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                  {item.orderNo && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Truck className="size-3.5" />
                      提货单号：<span className="font-mono">{item.orderNo}</span>
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {item.time}
                </span>
              </div>
              {(item.files.length > 0 || item.track) && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {item.files.map((f) => (
                    <FileChip key={f} name={f} />
                  ))}
                  {item.track && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                    >
                      <MapPin className="size-3.5" />
                      查看物流轨迹
                    </button>
                  )}
                </div>
              )}
            </TimelineItem>
          ))}
        </ol>
      </SectionCard>
    </div>
  )
}

/* ---------------- 碳核算 Tab ---------------- */

function AccountTab({ cfg }: { cfg: CertConfig }) {
  return (
    <div className="flex flex-col gap-6">
      {/* 流转过程 */}
      <SectionCard title={`${cfg.flowLabel}流转过程`}>
        <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-2">
          <FlowNode
            icon={Building2}
            title={cfg.flow.ownerTitle}
            sub={cfg.flow.ownerSub}
            tone="chart-4"
          />
          <FlowArrow
            label={cfg.flow.forwardLabel}
            note={cfg.flow.forwardNote}
            dir="right"
          />
          <FlowNode
            icon={HardHat}
            title={cfg.flow.counterpartyTitle}
            sub={cfg.flow.counterpartySub}
            tone="primary"
            active
          />
          {cfg.flow.hasReturn ? (
            <FlowArrow label="退租回收" note="物资返回出租方" dir="left" />
          ) : (
            <FlowArrow label="货权转移" note="不再退回转让方" dir="right" />
          )}
          <FlowNode
            icon={Recycle}
            title="循环复用"
            sub={cfg.flow.reuseSub}
            tone="chart-4"
          />
        </div>
      </SectionCard>

      {/* 核算范围提示 */}
      <div className="flex items-start gap-2 rounded-lg border border-chart-4/25 bg-chart-4/8 px-4 py-3 text-sm">
        <TrendingDown className="mt-0.5 size-4 shrink-0 text-chart-4" />
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">本核算结果 </span>
          <span className="font-medium text-chart-4">
            仅考核本次{cfg.flowLabel}
          </span>
          {cfg.scopeText}
        </p>
      </div>

      {/* 核算公式 */}
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
        <div className="flex items-center gap-2">
          <Leaf className="size-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">碳减排量核算公式</span>
        </div>
        <p className="mt-3 text-sm text-foreground">
          {cfg.deductTransport
            ? '碳减排量 =（物资重量 × 新品排放因子）- 出库运输碳排放 - 退租运输碳排放'
            : '碳减排量 =（物资重量 × 新品排放因子）'}
        </p>
        {cfg.deductTransport ? (
          <p className="mt-1.5 text-xs text-muted-foreground">
            即：循环利用减排 {cfg.reuseTotal} - 出库运输{' '}
            {cfg.deductTransport.outbound} - 退租运输 {cfg.deductTransport.return} =
            碳减排量{' '}
            <span className="font-semibold text-primary">
              {cfg.netReduction} tCO₂e
            </span>
            。
            {cfg.prep
              ? `整备加工碳排放 ${cfg.prep.emission} tCO₂e 单独列示、不计入碳减排量。`
              : ''}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-muted-foreground">
            即：物资重量 × 新品排放因子（循环利用减排 {cfg.reuseTotal}）= 碳减排量{' '}
            <span className="font-semibold text-primary">
              {cfg.netReduction} tCO₂e
            </span>
            。
            {cfg.prep
              ? `整备加工碳排放 ${cfg.prep.emission} tCO₂e、运输碳排放 ${cfg.transportTotal} tCO₂e 均单独列示、不计入碳减排量。`
              : `运输碳排放 ${cfg.transportTotal} tCO₂e 单独列示、不计入碳减排量。`}
          </p>
        )}
      </div>

      {/* 指标卡 */}
      <div
        className={`grid grid-cols-2 gap-4 md:grid-cols-2 ${
          cfg.prep ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
        }`}
      >
        <MetricCard icon={Recycle} label="循环利用减排" value={cfg.reuseTotal} unit="tCO₂e" />
        <MetricCard icon={TrendingDown} label="碳减排量" value={cfg.netReduction} unit="tCO₂e" highlight />
        {cfg.prep && (
          <MetricCard icon={HardHat} label="整备加工碳排放（参考）" value={cfg.prep.emission} unit="tCO₂e" />
        )}
        <MetricCard icon={Truck} label={cfg.deductTransport ? '运输碳排放（已扣减）' : '运输碳排放（参考）'} value={cfg.transportTotal} unit="tCO₂e" />
        <MetricCard icon={Zap} label="运输碳减排（新能源）" value={cfg.transportNewReduction} unit="tCO₂e" />
      </div>

      {/* 出租整备加工碳排放表（仅出租业务） */}
      {cfg.prep && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              本次出租整备加工碳排放
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-chart-4">
                <span className="size-2 rounded-full bg-chart-4" />
                整备加工碳排放合计 {cfg.prep.emission} tCO₂e
              </span>
              <span className="text-muted-foreground">
                整备前 {cfg.prep.weightBefore} → 整备后 {cfg.prep.weightAfter}
              </span>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {cfg.prep.types.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">整备工序</th>
                  <th className="px-3 py-2.5 font-medium">能源类型</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    加工因子(kgCO₂e/吨)
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">加工碳排放</th>
                </tr>
              </thead>
              <tbody>
                {cfg.prep.rows.map((r) => (
                  <tr key={r.process} className="border-t border-border">
                    <td className="px-3 py-3 text-foreground">{r.process}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary">
                        <Zap className="size-3" />
                        {r.energy}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                      {r.factor}
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums text-chart-4">
                      {r.emission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            整备加工碳排放 = 各工序能耗 × 加工因子，反映出租前清洗、除锈、切割、焊接、矫正、喷涂、检测、维修等整备环节的能耗排放，单独列示供参考，
            <b className="text-foreground">不计入本次碳减排量</b>。
          </p>
        </div>
      )}

      {/* 运输碳排放表 */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {cfg.transportTitle}
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-chart-4">
              <span className="size-2 rounded-full bg-chart-4" />
              运输碳排放合计 {cfg.transportTotal} tCO₂e
            </span>
            <span className="flex items-center gap-1 text-primary">
              <Zap className="size-3" />
              新能源较燃油减排 {cfg.transportNewReduction} tCO₂e
            </span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">运输环节</th>
                <th className="px-3 py-2.5 font-medium">运输方式</th>
                <th className="px-3 py-2.5 font-medium">车辆/船舶信息</th>
                <th className="px-3 py-2.5 font-medium">能源类型</th>
                <th className="px-3 py-2.5 text-right font-medium">运输量(吨)</th>
                <th className="px-3 py-2.5 text-right font-medium">运输距离(km)</th>
                <th className="px-3 py-2.5 text-right font-medium">运输因子</th>
                <th className="px-3 py-2.5 text-right font-medium">运输碳排放</th>
                <th className="px-3 py-2.5 text-right font-medium">燃油基准排放</th>
                <th className="px-3 py-2.5 text-right font-medium">较燃油减排</th>
              </tr>
            </thead>
            <tbody>
              {cfg.transportRows.map((r) => (
                <tr key={r.stage} className="border-t border-border align-top">
                  <td className="px-3 py-3 text-foreground">{r.stage}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.mode}</td>
                  <td className="px-3 py-3 text-foreground">{r.vehicle}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
                        r.energyTone === 'new'
                          ? 'bg-primary/12 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {r.energyTone === 'new' && <Zap className="size-3" />}
                      {r.energy}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-foreground">{r.amount}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-foreground">{r.distance}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{r.factor}</td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums text-chart-4">{r.emission}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{r.baseline}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {r.reduction === '—' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 font-medium text-primary">
                        <TrendingDown className="size-3" />
                        {r.reduction}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          运输碳排放 = 运输量 × 运输距离 × 运输因子
          {cfg.deductTransport ? (
            <>
              ，其中出库运输 {cfg.deductTransport.outbound} tCO₂e、退租运输{' '}
              {cfg.deductTransport.return} tCO₂e，<b className="text-foreground">已从本次碳减排量中扣减</b>。
            </>
          ) : (
            <>
              ，单独列示供参考，<b className="text-foreground">不计入本次碳减排量</b>。
            </>
          )}
          能源类型为新能源时，按燃油基准因子（柴油货车 0.0962
          kgCO₂e/吨·km）折算同运量、同里程的燃油基准排放，两者差额即为该环节较燃油类型的运输碳减排。
        </p>
      </div>

      {/* 循环利用减排明细表 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          {cfg.reuseTitle}
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">物资名称</th>
                <th className="px-3 py-2.5 font-medium">规格</th>
                <th className="px-3 py-2.5 text-right font-medium">物资重量(吨)</th>
                <th className="px-3 py-2.5 text-right font-medium">新品排放因子(kgCO₂e/吨)</th>
                <th className="px-3 py-2.5 text-right font-medium">循环复用减排(tCO₂e)</th>
              </tr>
            </thead>
            <tbody>
              {cfg.reuseRows.map((r) => (
                <tr key={r.name} className="border-t border-border">
                  <td className="px-3 py-3 text-foreground">{r.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.spec}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-foreground">{r.weight}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{r.factor}</td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums text-primary">{r.reduction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          循环利用减排 = 物资重量 × 新品排放因子，表示物资循环复用替代新品生产所避免的碳排放，核算依据 GB/T 51366。
        </p>
      </div>
    </div>
  )
}

/* ---------------- 复用小组件 ---------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative -mb-px border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
        active
          ? 'border-chart-4 text-chart-4'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function KV({
  label,
  value,
  mono,
  strong,
  accent,
  span2,
}: {
  label: string
  value: string
  mono?: boolean
  strong?: boolean
  accent?: boolean
  span2?: boolean
}) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-sm ${mono ? 'font-mono' : ''} ${
          strong ? 'font-semibold' : ''
        } ${accent ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </p>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  iconTone = 'chart-4',
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  iconTone?: 'chart-4' | 'chart-5' | 'primary'
  children: React.ReactNode
}) {
  const toneMap = {
    'chart-4': 'bg-chart-4/12 text-chart-4',
    'chart-5': 'bg-chart-5/15 text-chart-5',
    primary: 'bg-primary/12 text-primary',
  }
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <span className={`flex size-6 items-center justify-center rounded ${toneMap[iconTone]}`}>
            <Icon className="size-4" />
          </span>
        )}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function TimelineItem({
  children,
  last,
  dotTone,
}: {
  children: React.ReactNode
  last?: boolean
  dotTone: 'chart-4' | 'chart-5' | 'primary'
}) {
  const dotMap = {
    'chart-4': 'bg-chart-4',
    'chart-5': 'bg-chart-5',
    primary: 'bg-primary',
  }
  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      <div className="flex flex-col items-center">
        <span className={`mt-1 size-3 shrink-0 rounded-full ${dotMap[dotTone]}`} />
        {!last && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  )
}

function FileChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs text-foreground">
      <FileText className="size-3.5 text-muted-foreground" />
      {name}
      <button
        type="button"
        aria-label={`预览 ${name}`}
        className="text-muted-foreground transition-colors hover:text-chart-4"
      >
        <Eye className="size-3.5" />
      </button>
    </span>
  )
}

function ChannelBadge({ channel }: { channel: '线上支付' | '线下支付' }) {
  const online = channel === '线上支付'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
        online ? 'bg-chart-4/12 text-chart-4' : 'bg-chart-5/15 text-chart-5'
      }`}
    >
      <Globe className="size-3" />
      {channel}
    </span>
  )
}

function FlowNode({
  icon: Icon,
  title,
  sub,
  tone,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  sub: string
  tone: 'chart-4' | 'primary'
  active?: boolean
}) {
  const toneMap = {
    'chart-4': 'bg-chart-4/12 text-chart-4',
    primary: 'bg-primary/12 text-primary',
  }
  return (
    <div className="flex min-w-[7rem] flex-col items-center text-center">
      <span
        className={`flex size-12 items-center justify-center rounded-full ${toneMap[tone]} ${
          active ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''
        }`}
      >
        <Icon className="size-6" />
      </span>
      <p className="mt-2 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground text-balance">{sub}</p>
    </div>
  )
}

function FlowArrow({
  label,
  note,
  dir,
}: {
  label: string
  note: string
  dir: 'left' | 'right'
}) {
  return (
    <div className="flex min-w-[6rem] flex-1 flex-col items-center text-center">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {dir === 'right' ? (
        <ArrowRight className="my-1 size-4 text-muted-foreground" />
      ) : (
        <ArrowLeft className="my-1 size-4 text-muted-foreground" />
      )}
      <span className="text-[11px] text-muted-foreground text-balance">{note}</span>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  unit: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs text-pretty">{label}</span>
      </div>
      <p className="mt-2">
        <span
          className={`text-2xl font-bold tabular-nums ${
            highlight ? 'text-primary' : 'text-foreground'
          }`}
        >
          {value}
        </span>
        <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
      </p>
    </div>
  )
}
