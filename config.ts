// Configuration for The Sovereign Vault

export const GOLD_BRANDS = ['Antam', 'UBS', 'Emasku', 'Pegadaian', 'Buyur']

export const PURITY_OPTIONS = [
  { value: 99.9, label: '99.9% (LM/Antam Standard)' },
  { value: 99.5, label: '99.5%' },
  { value: 99, label: '99%' },
  { value: 95, label: '95%' },
]

export const MOCK_GOLD_PRICES = {
  'Antam': {
    buy_price: 1132000,
    sell_price: 1031000,
    price_change_percent: 0.8,
  },
  'UBS': {
    buy_price: 1115000,
    sell_price: 1012000,
    price_change_percent: -0.3,
  },
  'Emasku': {
    buy_price: 1108000,
    sell_price: 1005000,
    price_change_percent: 1.2,
  },
  'Pegadaian': {
    buy_price: 1100000,
    sell_price: 998000,
    price_change_percent: 0.5,
  },
  'Buyur': {
    buy_price: 1095000,
    sell_price: 995000,
    price_change_percent: -0.1,
  },
}

export const USER_TIERS = {
  'standard': 'Standard',
  'silver': 'Silver',
  'gold': 'Gold',
  'platinum': 'Platinum',
}

export const APP_NAME = 'The Sovereign Vault'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Secure Gold Inventory Management System'

export const FEATURES = [
  {
    icon: '🔐',
    title: 'Aman',
    description: 'Enkripsi AES-256 dan Row Level Security',
  },
  {
    icon: '📊',
    title: 'Real-time',
    description: 'Update harga emas secara real-time',
  },
  {
    icon: '📱',
    title: 'Mobile',
    description: 'Responsive design untuk semua perangkat',
  },
  {
    icon: '🎯',
    title: 'Akurat',
    description: 'Tracking pembelian dengan detail lengkap',
  },
  {
    icon: '📈',
    title: 'Analitik',
    description: 'Laporan dan statistik investasi',
  },
  {
    icon: '🌐',
    title: 'Cloud',
    description: 'Sinkronisasi otomatis di cloud',
  },
]
