import { Fragment, useEffect, useState } from 'react'
import './App.css'
type Journal = {
  id: number
  date: string
  description: string
  debitAccount: string
  creditAccount: string
  amount: number
  deleted: boolean
  reversed: boolean
}
function App() {
  const [activeNav, setActiveNav] = useState('home')
const [settingsView, setSettingsView] = useState<'menu' | 'accounts' | 'recurring' | 'closing' | 'backup' | 'export'>('menu')
  const [showJournalForm, setShowJournalForm] = useState(false)
  const [debitAmount, setDebitAmount] = useState('')
const [creditAmount, setCreditAmount] = useState('')
const [debitAccount, setDebitAccount] = useState('')
const [creditAccount, setCreditAccount] = useState('')
const [description, setDescription] = useState('')
const [journalDate, setJournalDate] = useState(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
})
const [selectedJournalId, setSelectedJournalId] = useState<number | null>(null)
const [isEditingJournal, setIsEditingJournal] = useState(false)
const [journalSearch, setJournalSearch] = useState('')
const [showDeletedJournals, setShowDeletedJournals] = useState(false)
const [showAllTrialBalanceAccounts, setShowAllTrialBalanceAccounts] = useState(false)
const [activeReportTab, setActiveReportTab] = useState<
  'trial' | 'bs' | 'pl'
>('trial')
const [dateFrom, setDateFrom] = useState('')
const [dateTo, setDateTo] = useState('')
const [closedMonths, setClosedMonths] = useState<string[]>([])
const [closedYears, setClosedYears] = useState<number[]>([])
const [closingMonth, setClosingMonth] = useState('2026-10')
const [closingYear, setClosingYear] = useState(2026)
const startMonth = '2026-10'
const [displayMonth, setDisplayMonth] = useState(
  new Date().toISOString().slice(0, 7)
)
const [nextJournalId, setNextJournalId] = useState(1)
const [recurringJournals, setRecurringJournals] = useState<{ id: number; description: string; debitAccount: string; creditAccount: string; amount: number; day: number; active: boolean }[]>([])
const [recurringDescription, setRecurringDescription] = useState('')
const [recurringDebitAccount, setRecurringDebitAccount] = useState('')
const [recurringCreditAccount, setRecurringCreditAccount] = useState('')
const [recurringAmount, setRecurringAmount] = useState('')
const [recurringDay, setRecurringDay] = useState('1')
const [skippedRecurringCandidates, setSkippedRecurringCandidates] = useState<string[]>([])
const [registeredRecurringCandidates, setRegisteredRecurringCandidates] = useState<string[]>([])
const initialAccounts: {
  id: number
  name: string
  type: string
  active: boolean
  parentId: number | null
  balanceManaged: boolean
  includeInRealBalance: boolean
  openingBalance: number
}[] = [
  // 資産
  { id: 1, name: '現金', type: 'asset', active: true, parentId: null, balanceManaged: true, includeInRealBalance: false, openingBalance: 0 },
  { id: 2, name: '普通預金', type: 'asset', active: true, parentId: null, balanceManaged: true, includeInRealBalance: false, openingBalance: 0 },
  { id: 8, name: '電子マネー', type: 'asset', active: true, parentId: null, balanceManaged: true, includeInRealBalance: false, openingBalance: 0 },
  { id: 9, name: 'NISA投資資産', type: 'asset', active: true, parentId: null, balanceManaged: true, includeInRealBalance: false, openingBalance: 0 },
  { id: 10, name: '未収入金', type: 'asset', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 11, name: '立替金', type: 'asset', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },

  // 負債
  { id: 7, name: 'クレジットカード未払金', type: 'liability', active: true, parentId: null, balanceManaged: true, includeInRealBalance: false, openingBalance: 0 },
  { id: 12, name: '未払金', type: 'liability', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 13, name: '預り金', type: 'liability', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },

  // 収益
  { id: 6, name: '給与収入', type: 'revenue', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 14, name: '雑収入', type: 'revenue', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 15, name: '受取利息', type: 'revenue', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 16, name: '投資評価益', type: 'revenue', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },

  // 費用（独立科目）
  { id: 5, name: '交通費', type: 'expense', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },

  // 生活費（親科目）
  { id: 4, name: '生活費', type: 'expense', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },

  // 生活費の子科目
  { id: 3, name: '食費（自炊）', type: 'expense', active: true, parentId: 4, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 30, name: '食費（外食）', type: 'expense', active: true, parentId: 4, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 17, name: '住居費', type: 'expense', active: true, parentId: 4, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 18, name: '水道光熱費', type: 'expense', active: true, parentId: 4, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 19, name: '通信費', type: 'expense', active: true, parentId: 4, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 20, name: '日用品費', type: 'expense', active: true, parentId: 4, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 21, name: '被服美容費', type: 'expense', active: true, parentId: 4, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 22, name: '医療費', type: 'expense', active: true, parentId: 4, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },

  // その他の費用
  { id: 23, name: '交際娯楽費', type: 'expense', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 24, name: '教育費', type: 'expense', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 25, name: '社会保険料', type: 'expense', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 26, name: '租税公課', type: 'expense', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 27, name: '投資評価損', type: 'expense', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 28, name: '雑損失', type: 'expense', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
  { id: 29, name: '雑費', type: 'expense', active: true, parentId: null, balanceManaged: false, includeInRealBalance: false, openingBalance: 0 },
]
const [accounts, setAccounts] = useState(initialAccounts)
const getParentAccount = (account: typeof accounts[number]) => {
  let current = account
  const visited = new Set<number>()

  while (current.parentId !== null) {
    if (visited.has(current.id)) break
    visited.add(current.id)

    const parent = accounts.find(
      (item) => item.id === current.parentId
    )

    if (!parent || parent.type !== account.type) break

    current = parent
  }

  return current
}

const getGroupedAccountBalances = (
  type: string,
  getAmount: (account: typeof accounts[number]) => number
) => {
  const grouped = new Map<number, {
    account: typeof accounts[number]
    amount: number
  }>()

  accounts
    .filter((account) => account.type === type)
    .forEach((account) => {
      const parent = getParentAccount(account)
      const existing = grouped.get(parent.id)

      grouped.set(parent.id, {
        account: parent,
        amount: (existing?.amount ?? 0) + getAmount(account),
      })
    })

  return Array.from(grouped.values())
    .filter((item) => item.amount !== 0)
}
const [newAccountName, setNewAccountName] = useState('')
const [newAccountType, setNewAccountType] = useState('asset')
const [newAccountParentId, setNewAccountParentId] = useState<number | null>(null)
const [editingAccountId, setEditingAccountId] = useState<number | null>(null)
const [editingAccountName, setEditingAccountName] = useState('')
const [editingAccountType, setEditingAccountType] = useState('')
const [editingAccountOpeningBalance, setEditingAccountOpeningBalance] = useState(0)
const [ledgerAccountId, setLedgerAccountId] = useState<number | null>(null)
const [isDataLoaded, setIsDataLoaded] = useState(false)
useEffect(() => {
  const savedData = localStorage.getItem('folio-data')

  if (savedData) {
    try {
      const data = JSON.parse(savedData)
      if (Array.isArray(data.journals)) {
        setJournals(data.journals)
      }

      if (Array.isArray(data.accounts)) {
        setAccounts(data.accounts)
      }

      if (Array.isArray(data.closedMonths)) {
        setClosedMonths(data.closedMonths)
      }
      if (Array.isArray(data.closedYears)) {
  setClosedYears(data.closedYears)
}

      if (Array.isArray(data.recurringJournals)) {
        setRecurringJournals(data.recurringJournals)
      }

      if (Array.isArray(data.skippedRecurringCandidates)) {
        setSkippedRecurringCandidates(data.skippedRecurringCandidates)
      }

      if (Array.isArray(data.registeredRecurringCandidates)) {
        setRegisteredRecurringCandidates(data.registeredRecurringCandidates)
      }

      if (
        typeof data.nextJournalId === 'number' &&
        Number.isInteger(data.nextJournalId) &&
        data.nextJournalId > 0
      ) {
        setNextJournalId(data.nextJournalId)
      }
    } catch {
      window.alert(
        '保存データの読み込みに失敗しました。初期データで起動します。'
      )
    }
  }

  setIsDataLoaded(true)
}, [])
const handleDownloadBackup = () => {
  const backupData = {
    version: 1,
    createdAt: new Date().toISOString(),
    data: {
      journals,
      accounts,
      closedMonths,
      closedYears,
      recurringJournals,
      skippedRecurringCandidates,
      registeredRecurringCandidates,
      nextJournalId,
    },
  }

  const json = JSON.stringify(backupData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  const today = new Date()
  const date = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  link.href = url
  link.download = `folio-backup-${date}.json`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
const handleRestoreBackup = (file: File) => {
  const reader = new FileReader()

  reader.onload = () => {
    try {
      const backup = JSON.parse(String(reader.result))

      if (
        backup.version !== 1 ||
        !backup.data ||
        !Array.isArray(backup.data.journals) ||
        !Array.isArray(backup.data.accounts) ||
!Array.isArray(backup.data.closedMonths) ||
!Array.isArray(backup.data.closedYears) ||
!Array.isArray(backup.data.recurringJournals) ||
        !Array.isArray(backup.data.skippedRecurringCandidates) ||
        !Array.isArray(backup.data.registeredRecurringCandidates) ||
        typeof backup.data.nextJournalId !== 'number' ||
backup.data.nextJournalId < 1 ||
backup.data.journals.some(
  (journal: any) =>
    typeof journal.id !== 'number' ||
    typeof journal.date !== 'string' ||
    typeof journal.description !== 'string' ||
    typeof journal.debitAccount !== 'string' ||
    typeof journal.creditAccount !== 'string' ||
    typeof journal.amount !== 'number'
)
      ) {
        window.alert('FOLIOの有効なバックアップファイルではありません')
        return
      }

      const confirmed = window.confirm(
        '現在のデータをバックアップの内容で置き換えます。よろしいですか？'
      )

      if (!confirmed) return
      setJournals(backup.data.journals)
      setAccounts(backup.data.accounts)
      setClosedMonths(backup.data.closedMonths)
      setClosedYears(
  Array.isArray(backup.data.closedYears)
    ? backup.data.closedYears
    : []
)
      setRecurringJournals(backup.data.recurringJournals)
      setSkippedRecurringCandidates(
        backup.data.skippedRecurringCandidates
      )
      setRegisteredRecurringCandidates(
        backup.data.registeredRecurringCandidates
      )
      const maxJournalId = backup.data.journals.reduce(
  (max: number, journal: { id: number }) => Math.max(max, journal.id),
  0
)

setNextJournalId(
  Math.max(backup.data.nextJournalId, maxJournalId + 1)
)

      window.alert('バックアップを復元しました')
    } catch {
      window.alert('バックアップファイルを読み込めませんでした')
    }
  }

  reader.readAsText(file)
}
const handleExportCsv = () => {
  const escapeCsv = (value: string | number) => {
    const text = String(value).replace(/"/g, '""')
    return `"${text}"`
  }

  const header = [
    '仕訳ID',
    '日付',
    '摘要',
    '借方科目',
    '貸方科目',
    '金額',
    '削除済み',
    '取消済み',
  ]

  const rows = journals.map((journal) => [
    journal.id,
    journal.date,
    journal.description,
    journal.debitAccount,
    journal.creditAccount,
    journal.amount,
    journal.deleted ? 'はい' : 'いいえ',
    journal.reversed ? 'はい' : 'いいえ',
  ])

  const csv = [
    header.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n')

  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const today = new Date()
  const date = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  link.href = url
  link.download = `folio-journals-${date}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
const handleAddAccount = () => {
  if (newAccountName.trim() === '') return
  if (accounts.some((account) => account.name === newAccountName.trim())) {
  window.alert('同じ名前の勘定科目がすでに存在します')
  return
}

  const newAccount = {
    id: Math.max(...accounts.map((account) => account.id)) + 1,
    name: newAccountName.trim(),
    type: newAccountType,
    active: true,
    parentId: newAccountParentId,
    balanceManaged: newAccountType === 'asset' || newAccountType === 'liability',
    includeInRealBalance: newAccountType === 'liability',
    openingBalance: 0,
  }

  setAccounts([...accounts, newAccount])
  setNewAccountName('')
  setNewAccountType('asset')
  setNewAccountParentId(null)
}
const handleToggleAccountActive = (accountId: number) => {
  setAccounts((current) =>
    current.map((account) =>
      account.id === accountId
        ? { ...account, active: !account.active }
        : account
    )
  )
}
const handleToggleBalanceManaged = (accountId: number) => {
  setAccounts((current) =>
    current.map((account) =>
      account.id === accountId
        ? { ...account, balanceManaged: !account.balanceManaged, includeInRealBalance: account.balanceManaged ? false : account.includeInRealBalance }
        : account
    )
  )
}
const handleToggleIncludeInRealBalance = (accountId: number) => {
  setAccounts((current) =>
    current.map((account) =>
      account.id === accountId
        ? { ...account, includeInRealBalance: !account.includeInRealBalance }
        : account
    )
  )
}
const [journals, setJournals] = useState<Journal[]>([])
useEffect(() => {
  if (!isDataLoaded) return

  const data = {
    startMonth,
    journals,
    accounts,
    closedMonths,
    closedYears,
    recurringJournals,
    skippedRecurringCandidates,
    registeredRecurringCandidates,
    nextJournalId,
  }

  localStorage.setItem('folio-data', JSON.stringify(data))
}, [
  isDataLoaded,
  startMonth,
  journals,
  accounts,
  closedMonths,
  closedYears,
  recurringJournals,
  skippedRecurringCandidates,
  registeredRecurringCandidates,
  nextJournalId,
])

const handleResetData = () => {
  if (!isDataLoaded) return

  const backupConfirmed = window.confirm(
    '初期化すると現在のデータはすべて失われます。\n先にバックアップを保存してください。\n\nバックアップを保存しますか？'
  )

  if (!backupConfirmed) return

  handleDownloadBackup()

  const finalConfirmed = window.confirm(
    'バックアップのダウンロードを開始しました。\nファイルが保存されたことを確認してください。\n\n仕訳・定期仕訳・締め履歴・勘定科目を初期化します。\nこの操作は取り消せません。\n\n本当に初期化しますか？'
  )

  if (!finalConfirmed) return

  setJournals([])
  setAccounts(initialAccounts.map((account) => ({ ...account })))
  setClosedMonths([])
  setClosedYears([])
  setRecurringJournals([])
  setSkippedRecurringCandidates([])
  setRegisteredRecurringCandidates([])
  setNextJournalId(1)

  setSelectedJournalId(null)
  setIsEditingJournal(false)
  setShowJournalForm(false)
  setSettingsView('menu')
  setActiveNav('home')

  window.alert('データを初期化しました。')
}

const isAccountUsed = (accountName: string) => {
  return journals.some(
    (journal) =>
      journal.debitAccount === accountName ||
      journal.creditAccount === accountName
  )
}
const getJournalMonth = (date: string) => date.slice(0, 7).replace('/', '-')
const getPreviousMonth = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 2, 1)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
const getRecurringDate = (month: string, day: number) => {
  const [year, monthNumber] = month.split('-').map(Number)
  const lastDay = new Date(year, monthNumber, 0).getDate()
  const actualDay = Math.min(day, lastDay)

  return `${month}-${String(actualDay).padStart(2, '0')}`
}
const getAccountBalance = (account: typeof accounts[number], month?: string) => {
  let balance = account.openingBalance

  journals
  .filter(
    (journal) =>
      !journal.deleted &&
      (!month || getJournalMonth(journal.date) <= month)
  )
    .forEach((journal) => {
     const debitNormal = account.type === 'asset' || account.type === 'expense'

if (journal.debitAccount === account.name) {
  balance += debitNormal ? journal.amount : -journal.amount
}

if (journal.creditAccount === account.name) {
  balance += debitNormal ? -journal.amount : journal.amount
}
    })

  return balance
}
const getMonthlyAccountBalance = (account: typeof accounts[number], month: string) => {
  let balance = 0

  journals
  .filter(
    (journal) =>
      !journal.deleted &&
      getJournalMonth(journal.date) === month
  )
    .forEach((journal) => {
      const debitNormal = account.type === 'asset' || account.type === 'expense'

      if (journal.debitAccount === account.name) {
        balance += debitNormal ? journal.amount : -journal.amount
      }

      if (journal.creditAccount === account.name) {
        balance += debitNormal ? -journal.amount : journal.amount
      }
    })

  return balance
}
const todayDate = (() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
})()
const recurringCandidates = recurringJournals.filter(
  (journal) => {
    const key = `${displayMonth}-${journal.id}`
const candidateDate = getRecurringDate(
  displayMonth,
  journal.day
)

    return (
      journal.active &&
      candidateDate > todayDate &&
      !registeredRecurringCandidates.includes(key) &&
      !skippedRecurringCandidates.includes(key)
    )
  }
)
const filteredJournals = journals.filter((journal) => {
  const searchableText =
    `${journal.description} ${journal.debitAccount} ${journal.creditAccount} ${journal.date}`.toLowerCase()

  const normalizedDate = journal.date.replaceAll('/', '-')

  return (
    (showDeletedJournals || !journal.deleted) &&
    searchableText.includes(journalSearch.toLowerCase()) &&
    (!dateFrom || normalizedDate >= dateFrom) &&
    (!dateTo || normalizedDate <= dateTo)
  )
})
const fundingBalance = accounts
  .filter((account) => account.type === 'asset' && account.balanceManaged)
  .reduce((total, account) => total + getAccountBalance(account, displayMonth), 0)
  const previousFundingBalance = accounts
  .filter((account) => account.type === 'asset' && account.balanceManaged)
  .reduce((total, account) => total + getAccountBalance(account, getPreviousMonth(displayMonth)), 0)
    const fundingBalanceChange = fundingBalance - previousFundingBalance
    const fundingBalanceChangeRate = previousFundingBalance === 0 ? null : (fundingBalanceChange / Math.abs(previousFundingBalance)) * 100
const handleDeleteAccount = (accountId: number) => {
  const account = accounts.find((account) => account.id === accountId)

  if (!account) return

  const isUsedInJournal = journals.some(
    (journal) =>
      journal.debitAccount === account.name ||
      journal.creditAccount === account.name
  )

  if (isUsedInJournal) {
    window.alert(
      'この勘定科目は仕訳で使用されているため削除できません。使用停止にしてください'
    )
    return
  }

  const hasChildAccount = accounts.some(
    (childAccount) => childAccount.parentId === accountId
  )

  if (hasChildAccount) {
    window.alert(
      'この勘定科目には子科目があるため削除できません。先に子科目を削除または変更してください'
    )
    return
  }

  const confirmed = window.confirm(
    'この勘定科目を削除します。よろしいですか？'
  )

  if (!confirmed) return

  setAccounts((current) =>
    current.filter((account) => account.id !== accountId)
  )
}
const realBalance = fundingBalance - accounts
  .filter((account) => account.type === 'liability' && account.balanceManaged && account.includeInRealBalance)
  .reduce((total, account) => total + getAccountBalance(account), 0)
  const totalRevenue = accounts
  .filter((account) => account.type === 'revenue')
  .reduce((total, account) => total + getMonthlyAccountBalance(account, displayMonth), 0)
  const totalExpense = accounts
  .filter((account) => account.type === 'expense')
  .reduce((total, account) => total + getMonthlyAccountBalance(account, displayMonth), 0)
  const netIncome = totalRevenue - totalExpense
  const [trendAccountId, setTrendAccountId] = useState<number | null>(null)
  const trendAccount =
  accounts.find((account) => account.id === trendAccountId) ?? null

const getMonthsBetween = (start: string, end: string) => {
  const months: string[] = []

  let year = Number(start.slice(0, 4))
  let month = Number(start.slice(5, 7))

  const endYear = Number(end.slice(0, 4))
  const endMonth = Number(end.slice(5, 7))

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)

    month += 1

    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return months
}

const trendData = trendAccount
  ? getMonthsBetween(startMonth, displayMonth).map((month) => {
      const childAccounts = accounts.filter(
        (account) => account.parentId === trendAccount.id
      )

      const targetAccounts =
        childAccounts.length > 0 ? childAccounts : [trendAccount]

      const amount = targetAccounts.reduce(
        (total, account) =>
          total + getMonthlyAccountBalance(account, month),
        0
      )

      return {
        month,
        amount,
      }
    })
  : []
  const trialBalanceAccounts = accounts.filter((account) => account.active)
  const accountTypeLabels: Record<string, string> = {
  asset: '資産',
  liability: '負債',
  equity: '純資産',
  revenue: '収益',
  expense: '費用',
}
  const getTrialBalanceAmount = (account: typeof accounts[number]) => getAccountBalance(account, displayMonth)
  const isDebitBalanceAccount = (account: typeof accounts[number]) => account.type === 'asset' || account.type === 'expense'

const trialBalanceOpeningEquity =
  accounts
    .filter((account) => account.type === 'asset')
    .reduce((total, account) => total + account.openingBalance, 0) -
  accounts
    .filter((account) => account.type === 'liability')
    .reduce((total, account) => total + account.openingBalance, 0)

const trialBalanceDebitTotal =
  trialBalanceAccounts.reduce((total, account) => {
    const amount = getTrialBalanceAmount(account)
    return total + (
      isDebitBalanceAccount(account)
        ? Math.max(amount, 0)
        : Math.max(-amount, 0)
    )
  }, 0) + Math.max(-trialBalanceOpeningEquity, 0)

const trialBalanceCreditTotal =
  trialBalanceAccounts.reduce((total, account) => {
    const amount = getTrialBalanceAmount(account)
    return total + (
      isDebitBalanceAccount(account)
        ? Math.max(-amount, 0)
        : Math.max(amount, 0)
    )
  }, 0) + Math.max(trialBalanceOpeningEquity, 0)

const balanceSheetAccounts = accounts.filter((account) => account.active && (account.type === 'asset' || account.type === 'liability' || account.type === 'equity'))
const totalAssets = balanceSheetAccounts.filter((account) => account.type === 'asset').reduce((total, account) => total + getAccountBalance(account, displayMonth), 0)
const totalLiabilities = balanceSheetAccounts.filter((account) => account.type === 'liability').reduce((total, account) => total + getAccountBalance(account, displayMonth), 0)
const openingEquity = accounts.filter((account) => account.type === 'asset').reduce((total, account) => total + account.openingBalance, 0) - accounts.filter((account) => account.type === 'liability').reduce((total, account) => total + account.openingBalance, 0)
const priorNetIncome = accounts.filter((account) => account.type === 'revenue' || account.type === 'expense').reduce((total, account) => total + journals.filter((journal) => journal.date.slice(0, 7).replace('/', '-') < displayMonth).reduce((sum, journal) => sum + (account.type === 'revenue' && journal.creditAccount === account.name ? journal.amount : 0) - (account.type === 'expense' && journal.debitAccount === account.name ? journal.amount : 0), 0), 0)
const totalEquity = openingEquity + priorNetIncome + netIncome
const totalLiabilitiesAndEquity = totalLiabilities + totalEquity
const balanceSheetDifference = totalAssets - totalLiabilitiesAndEquity
const isBalanceSheetBalanced = balanceSheetDifference === 0
const ledgerAccount = accounts.find((account) => account.id === ledgerAccountId) ?? null
const ledgerJournals = ledgerAccount
  ? journals
      .filter(
        (journal) =>
          getJournalMonth(journal.date) === displayMonth &&
          (journal.debitAccount === ledgerAccount.name ||
            journal.creditAccount === ledgerAccount.name)
      )
      .sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date)
        return dateComparison !== 0 ? dateComparison : a.id - b.id
      })
  : []
  const ledgerOpeningBalance = ledgerAccount
  ? getAccountBalance(ledgerAccount, getPreviousMonth(displayMonth))
  : 0
  const ledgerRows = ledgerAccount
  ? ledgerJournals.reduce<
      Array<(typeof ledgerJournals)[number] & { balance: number }>
    >((rows, journal) => {
      const previousBalance =
        rows.length > 0
          ? rows[rows.length - 1].balance
         : ledgerOpeningBalance

      const debitAmount =
        journal.debitAccount === ledgerAccount.name ? journal.amount : 0

      const creditAmount =
        journal.creditAccount === ledgerAccount.name ? journal.amount : 0

      const balance =
        ledgerAccount.type === 'asset' || ledgerAccount.type === 'expense'
          ? previousBalance + debitAmount - creditAmount
          : previousBalance + creditAmount - debitAmount

      return [...rows, { ...journal, balance }]
    }, [])
  : []
const handleSaveAccountName = (accountId: number) => {
  const newName = editingAccountName.trim()
  const oldName = accounts.find((account) => account.id === accountId)?.name
  if (newName === '') return
if (accounts.some((account) => account.id !== accountId && account.name === newName)) {
  window.alert('同じ名前の勘定科目がすでに存在します')
  return
}
  setAccounts((current) =>
    current.map((account) =>
      account.id === accountId
        ? { ...account, name: newName, type: editingAccountType, openingBalance: editingAccountOpeningBalance }
        : account
    )
  )
if (oldName) {
  setJournals((current) =>
    current.map((journal) => ({
      ...journal,
      debitAccount:
        journal.debitAccount === oldName ? newName : journal.debitAccount,
      creditAccount:
        journal.creditAccount === oldName ? newName : journal.creditAccount,
    }))
  )
}
  setEditingAccountId(null)
  setEditingAccountName('')
  setEditingAccountType('')
}
const selectedJournal =
  journals.find((journal) => journal.id === selectedJournalId) ?? null
const isBalanced =
description.trim() !== '' &&
  debitAccount !== '' &&
  creditAccount !== '' &&
  debitAmount !== '' &&
  creditAmount !== '' &&
  Number(debitAmount) > 0 &&
  Number(debitAmount) === Number(creditAmount)
const handleStartEditJournal = () => {
  if (!selectedJournal) return
  if (isMonthClosed(selectedJournal.date)) {
  window.alert('この月は締め済みです。編集するには月次締めを解除してください')
  return
}

  setJournalDate(selectedJournal.date.replaceAll('/', '-'))
  setDescription(selectedJournal.description)
  setDebitAccount(selectedJournal.debitAccount)
  setCreditAccount(selectedJournal.creditAccount)
  setDebitAmount(String(selectedJournal.amount))
  setCreditAmount(String(selectedJournal.amount))
  setIsEditingJournal(true)
}
const handleUpdateJournal = () => {
  if (!isBalanced || selectedJournalId === null) return
  if (!isBalanced || selectedJournalId === null) return

const amount = Number(debitAmount)

if (!Number.isFinite(amount) || amount <= 0) {
  window.alert('金額は1円以上で入力してください')
  return
}

const debitAccountExists = accounts.some(
  (account) => account.name === debitAccount && account.active
)

const creditAccountExists = accounts.some(
  (account) => account.name === creditAccount && account.active
)

if (!debitAccountExists || !creditAccountExists) {
  window.alert('有効な借方科目・貸方科目を選択してください')
  return
}
if (debitAccount === creditAccount) {
  window.alert('借方科目と貸方科目に同じ勘定科目は選択できません')
  return
}
if (!journalDate) {
  window.alert('日付を入力してください')
  return
}

if (journalDate.slice(0, 7) < startMonth) {
  window.alert('利用開始月より前の日付には仕訳を保存できません')
  return
}
  if (isMonthClosed(journalDate)) {
  window.alert('この月は締め済みです。保存するには月次締めを解除してください')
  return
}
if (selectedJournal && isMonthClosed(selectedJournal.date)) {
  window.alert('元の仕訳月が締め済みです。保存するには月次締めを解除してください')
  return
}

  setJournals(
    journals.map((journal) =>
      journal.id === selectedJournalId
        ? {
            ...journal,
            date: journalDate.replaceAll('-', '/'),
            description,
            debitAccount,
            creditAccount,
            amount,
          }
        : journal
    )
  )

  setIsEditingJournal(false)
  setSelectedJournalId(null)
  setDescription('')
  setDebitAccount('')
  setCreditAccount('')
  setDebitAmount('')
  setCreditAmount('')
}
const handleDeleteJournal = () => {
  if (!selectedJournal) return
  if (isMonthClosed(selectedJournal.date)) {
  window.alert('この月は締め済みです。削除するには月次締めを解除してください')
  return
}
  const confirmed = window.confirm('この仕訳を削除しますか？')
if (!confirmed) return

  setJournals(
    journals.map((journal) =>
      journal.id === selectedJournal.id
        ? { ...journal, deleted: true }
        : journal
    )
  )

  setSelectedJournalId(null)
  setIsEditingJournal(false)
}
const handleReverseJournal = () => {
  if (!selectedJournal) return
  if (isMonthClosed(selectedJournal.date)) {
  window.alert('この月は締め済みです。取消するには月次締めを解除してください')
  return
}
  if (selectedJournal.reversed || 'isReversal' in selectedJournal) return

  const confirmed = window.confirm('この仕訳を取り消しますか？')
  if (!confirmed) return

  const reversalJournal = {
    id: nextJournalId,
    date: journalDate.replaceAll('-', '/'),
    description: `${selectedJournal.description}（取消）`,
    debitAccount: selectedJournal.creditAccount,
    creditAccount: selectedJournal.debitAccount,
    amount: selectedJournal.amount,
    deleted: false, reversed: false, isReversal: true,
  }

  setJournals(
  [
    reversalJournal,
    ...journals.map((journal) =>
      journal.id === selectedJournal.id
        ? { ...journal, reversed: true }
        : journal
    ),
  ].sort((a, b) => {
    const dateComparison = b.date.localeCompare(a.date)
    if (dateComparison !== 0) return dateComparison
    return b.id - a.id
  })
)
setNextJournalId((current) => current + 1)
  setSelectedJournalId(null)
  setIsEditingJournal(false)
}

const previousDisplayMonth = getPreviousMonth(displayMonth)
const previousTotalRevenue = accounts
  .filter((account) => account.type === 'revenue')
  .reduce((total, account) => total + getMonthlyAccountBalance(account, previousDisplayMonth), 0)
  const previousTotalExpense = accounts
  .filter((account) => account.type === 'expense')
  .reduce((total, account) => total + getMonthlyAccountBalance(account, previousDisplayMonth), 0)
  const previousNetIncome = previousTotalRevenue - previousTotalExpense
  const netIncomeChangeRate = previousNetIncome === 0 ? null : ((netIncome - previousNetIncome) / Math.abs(previousNetIncome)) * 100
const isMonthClosed = (date: string) => {
  const month = getJournalMonth(date)
  const year = Number(month.slice(0, 4))

  return closedMonths.includes(month) || closedYears.includes(year)
}
const handleCloseMonth = (month: string) => {
if (month < startMonth) {
  window.alert('利用開始月より前の月は締められません')
  return
}
  if (month >= new Date().toISOString().slice(0, 7)) {
  window.alert('現在月と未来の月は締められません')
  return
}
  if (month !== startMonth && !closedMonths.includes(getPreviousMonth(month))) {
  window.alert('前月が締められていないため、この月は締められません')
  return
}
const confirmed = window.confirm(`${month}を月次締めします。よろしいですか？`)
if (!confirmed) return  
setClosedMonths((current) =>
    current.includes(month) ? current : [...current, month]
  )
}
const handleReopenMonth = (month: string) => {
  const year = Number(month.slice(0, 4))

  if (closedYears.includes(year)) {
    window.alert('年次締めを解除してから月次締めを解除してください')
    return
  }

  const confirmed = window.confirm(
    `${month}以降の月次締めが解除されます。よろしいですか？`
  )

  if (!confirmed) return

  setClosedMonths((current) =>
    current.filter((closedMonth) => closedMonth < month)
  )
}
const handleCloseYear = (year: number) => {
  const currentYear = new Date().getFullYear()
  const startYear = Number(startMonth.slice(0, 4))

  if (year < startYear) {
    window.alert('利用開始年より前の年は年次締めできません')
    return
  }
  if (year >= currentYear) {
    window.alert('現在年と未来年は年次締めできません')
    return
  }

  const december = `${year}-12`

  if (!closedMonths.includes(december)) {
    window.alert('12月まで月次締めを完了してから年次締めしてください')
    return
  }

  if (closedYears.includes(year)) {
    window.alert('この年はすでに年次締めされています')
    return
  }

  const confirmed = window.confirm(
    `${year}年を年次締めします。よろしいですか？`
  )

  if (!confirmed) return

  setClosedYears((current) => [...current, year])
}

const handleReopenYear = (year: number) => {
  const confirmed = window.confirm(
    `${year}年以降の年次締めを解除します。よろしいですか？`
  )

  if (!confirmed) return

  setClosedYears((current) =>
    current.filter((closedYear) => closedYear < year)
  )
}
const handleAddRecurringJournal = () => {
  const amount = Number(recurringAmount)
  const day = Number(recurringDay)

  if (
    !recurringDescription.trim() ||
    !recurringDebitAccount ||
    !recurringCreditAccount ||
    !Number.isInteger(amount) ||
    amount <= 0 ||
    amount > 1_000_000_000_000 ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 31
  ) {
    window.alert('定期仕訳の入力内容を確認してください')
    return
  }

  if (editingRecurringJournalId !== null) {
    setRecurringJournals((current) =>
      current.map((journal) =>
        journal.id === editingRecurringJournalId
          ? {
              ...journal,
              description: recurringDescription.trim(),
              debitAccount: recurringDebitAccount,
              creditAccount: recurringCreditAccount,
              amount,
              day,
            }
          : journal
      )
    )

    setEditingRecurringJournalId(null)
  } else {
    setRecurringJournals((current) => [
      ...current,
      {
        id:
          current.length === 0
            ? 1
            : Math.max(...current.map((journal) => journal.id)) + 1,
        description: recurringDescription.trim(),
        debitAccount: recurringDebitAccount,
        creditAccount: recurringCreditAccount,
        amount,
        day,
        active: true,
      },
    ])
  }

  setRecurringDescription('')
  setRecurringDebitAccount('')
  setRecurringCreditAccount('')
  setRecurringAmount('')
  setRecurringDay('1')
}
const [editingRecurringJournalId, setEditingRecurringJournalId] = useState<number | null>(null)
const handleToggleRecurringJournal = (id: number) => {
  setRecurringJournals((current) =>
    current.map((journal) =>
      journal.id === id
        ? { ...journal, active: !journal.active }
        : journal
    )
  )
}
const handleStartEditRecurringJournal = (journal: typeof recurringJournals[number]) => {
  setEditingRecurringJournalId(journal.id)
  setRecurringDescription(journal.description)
  setRecurringDebitAccount(journal.debitAccount)
  setRecurringCreditAccount(journal.creditAccount)
  setRecurringAmount(String(journal.amount))
  setRecurringDay(String(journal.day))
}
const handleRegisterRecurringCandidate = (
  journal: typeof recurringJournals[number],
  targetMonth = displayMonth
) => {
const candidateDate = getRecurringDate(
  targetMonth,
  journal.day
)
  const candidateJournalDate = candidateDate.replaceAll('-', '/')
  if (isMonthClosed(candidateDate)) {

    window.alert('この月は締め済みです。定期仕訳を登録するには月次締めを解除してください')
return
}

const newJournal = {
  id: nextJournalId,
  date: candidateJournalDate,
  description: journal.description,
  debitAccount: journal.debitAccount,
  creditAccount: journal.creditAccount,
  amount: journal.amount,
  deleted: false,
  reversed: false,
}
setJournals((current) =>
  [newJournal, ...current].sort((a, b) => {
    const dateComparison = b.date.localeCompare(a.date)

    if (dateComparison !== 0) {
      return dateComparison
    }

    return b.id - a.id
  })
)

setNextJournalId((current) => current + 1)

setRegisteredRecurringCandidates((current) => [
  ...current,
  `${targetMonth}-${journal.id}`,
])
}
useEffect(() => {
  if (!isDataLoaded) return

  const currentMonth = todayDate.slice(0, 7)
  const months = getMonthsBetween(startMonth, currentMonth)

  for (const month of months) {
    const dueRecurringJournal = recurringJournals.find((journal) => {
      const key = `${month}-${journal.id}`
const candidateDate = getRecurringDate(
  month,
  journal.day
)

      return (
        journal.active &&
        candidateDate <= todayDate &&
        !registeredRecurringCandidates.includes(key) &&
        !skippedRecurringCandidates.includes(key) &&
        !isMonthClosed(candidateDate)
      )
    })

    if (dueRecurringJournal) {
      handleRegisterRecurringCandidate(
        dueRecurringJournal,
        month
      )
      return
    }
  }
})
const handleAddJournal = () => {
  if (!isBalanced) return
  const amount = Number(debitAmount)

if (!Number.isFinite(amount) || amount <= 0) {
  window.alert('金額は1円以上で入力してください')
  return
}
const debitAccountExists = accounts.some(
  (account) => account.name === debitAccount && account.active
)

const creditAccountExists = accounts.some(
  (account) => account.name === creditAccount && account.active
)

if (!debitAccountExists || !creditAccountExists) {
  window.alert('有効な借方科目・貸方科目を選択してください')
  return
}
if (debitAccount === creditAccount) {
  window.alert('借方科目と貸方科目に同じ勘定科目は選択できません')
  return
}
if (!journalDate) {
  window.alert('日付を入力してください')
  return
}

if (journalDate.slice(0, 7) < startMonth) {
  window.alert('利用開始月より前の日付には仕訳を登録できません')
  return
}
  if (isMonthClosed(journalDate)) {
  window.alert('この月は締め済みです。仕訳を登録するには月次締めを解除してください')
  return
}

  const newJournal = {
    id: nextJournalId,
    date: journalDate.replaceAll('-', '/'),
    description,
    debitAccount,
    creditAccount,
    amount,
    deleted: false,
reversed: false,
  }

  setJournals(
  [newJournal, ...journals].sort((a, b) => {
    const dateComparison = b.date.localeCompare(a.date)

    if (dateComparison !== 0) {
      return dateComparison
    }

    return b.id - a.id
  }),
)
setNextJournalId(nextJournalId + 1)
  setDescription('')
setDebitAccount('')
setCreditAccount('')
setDebitAmount('')
setCreditAmount('')
setShowJournalForm(false)
}
  return (
    <div className="folio-app">
      <header className="folio-header">
        <div>
          <p className="folio-label">PERSONAL ACCOUNTING</p>
          <h1>FOLIO</h1>
        </div>
        <input className="header-month" type="month" value={displayMonth} onChange={(event) => setDisplayMonth(event.target.value)} />
      </header>

      <main className="folio-main">
        {activeNav === 'home' && (
  <>
        <section className="balance-card">
          <p className="section-label">BALANCE</p>

          <div className="balance-row">
            <div>
              <span>資金残高</span>
              <strong>¥{fundingBalance.toLocaleString()}</strong>
            </div>
            <div>
              <span>実質残高</span>
              <strong>¥{realBalance.toLocaleString()}</strong>
            </div>
          </div>

          <div className="comparison">
  {displayMonth === startMonth ? (
    <span>前月比：比較対象なし（利用開始月）</span>
  ) : (
    <>
      <span>前月比</span>
      <strong>
        {fundingBalanceChange >= 0 ? '+' : '△'}¥
        {Math.abs(fundingBalanceChange).toLocaleString()}
      </strong>
      <span>
        {fundingBalanceChangeRate === null
          ? '—'
          : `${fundingBalanceChangeRate >= 0 ? '+' : '△'}${Math.abs(fundingBalanceChangeRate).toFixed(1)}%`}
      </span>
    </>
  )}
</div>
        </section>

        <section className="pl-card">
          <div className="card-heading">
            <div>
              <p className="section-label">PROFIT & LOSS</p>
              <h2>{Number(displayMonth.split('-')[1])}月の収支</h2>
            </div>
            <span className="positive">{netIncome >= 0 ? '+' : '△'}¥{Math.abs(netIncome).toLocaleString()}</span>
          </div>

          <div className="pl-row">
            <span>収入</span>
            <strong>¥{totalRevenue.toLocaleString()}</strong>
          </div>

          <div className="pl-row">
            <span>支出</span>
            <strong>¥{totalExpense.toLocaleString()}</strong>
          </div>

          <div className="comparison">
  {displayMonth === startMonth ? (
    <span>前月比：比較対象なし（利用開始月）</span>
  ) : (
    <>
      <span>前月比</span>
      <strong>
        {netIncome - previousNetIncome >= 0 ? '+' : '△'}¥
        {Math.abs(netIncome - previousNetIncome).toLocaleString()}
      </strong>
      <span>
        {netIncomeChangeRate === null
          ? '—'
          : `${netIncomeChangeRate >= 0 ? '+' : '△'}${Math.abs(netIncomeChangeRate).toFixed(1)}%`}
      </span>
    </>
  )}
</div>
        </section>

        <section className="recent-card">
          <div className="card-heading">
            <div>
              <p className="section-label">RECENT</p>
              <h2>最近の仕訳</h2>
            </div>
          </div>

          
{journals.filter(
  (journal) =>
    !journal.deleted &&
    journal.date.slice(0, 7).replaceAll('/', '-') === displayMonth
).length === 0 ? (
  <p className="empty-state">
    まだ仕訳がありません
  </p>
) : (
  journals
    .filter(
      (journal) =>
        !journal.deleted &&
        journal.date.slice(0, 7).replaceAll('/', '-') === displayMonth
    )
    .slice(0, 5)
    .map((journal) => (
      <div className="journal-row" key={journal.id}>
        <div>
          <strong>{journal.date.slice(5)}</strong>
          <span>{journal.description}</span>
        </div>
        <strong>¥{journal.amount.toLocaleString()}</strong>
      </div>
    ))
)}

        </section>

        <button className="input-button" type="button" onClick={() => { setActiveNav('journal'); setSelectedJournalId(null); setShowJournalForm(true) }}>
          ＋ 仕訳を入力
        </button>
        </>
        )}
       {activeNav === 'journal' && !showJournalForm && selectedJournal === null && (
  <section className="journal-page">
    <div className="journal-page-header">
  <div>
    <p className="section-label">JOURNAL</p>
    <h2>仕訳一覧</h2>
  </div>

  <button
    className="journal-new-button"
    type="button"
    onClick={() => setShowJournalForm(true)}
  >
    ＋ 新規仕訳
  </button>
</div>

<div className="journal-filter-panel">
  <div className="journal-filter-top">
    <label htmlFor="journal-closing-month">対象月</label>

    <input
      id="journal-closing-month"
      type="month"
      min={startMonth}
      max={getPreviousMonth(new Date().toISOString().slice(0, 7))}
      value={closingMonth}
      onChange={(event) => setClosingMonth(event.target.value)}
    />

    <button
      className="journal-closing-button"
      type="button"
      onClick={() =>
        closedMonths.includes(closingMonth)
          ? handleReopenMonth(closingMonth)
          : handleCloseMonth(closingMonth)
      }
    >
      {closedMonths.includes(closingMonth)
        ? '締めを解除'
        : 'この月を締める'}
    </button>
  </div>

  <input
    type="search"
    className="journal-search"
    placeholder="摘要・勘定科目を検索"
    value={journalSearch}
    onChange={(event) => setJournalSearch(event.target.value)}
  />

  <div className="journal-filter-bottom">
    <div className="journal-date-filter">
      <input
        type="date"
        aria-label="開始日"
        value={dateFrom}
        onChange={(event) => setDateFrom(event.target.value)}
      />

      <span>〜</span>

      <input
        type="date"
        aria-label="終了日"
        value={dateTo}
        onChange={(event) => setDateTo(event.target.value)}
      />
    </div>

    <label className="show-deleted-option">
      <input
        type="checkbox"
        checked={showDeletedJournals}
        onChange={(event) =>
          setShowDeletedJournals(event.target.checked)
        }
      />
      削除済みを含める
    </label>
  </div>
</div>
  <div className="journal-list">
  {filteredJournals.length === 0 && (
    <div className="journal-empty-state">
      <div className="journal-empty-icon">≡</div>
      <p>該当する仕訳はありません</p>
      <span>新規仕訳を登録するか、検索条件を変更してください</span>
    </div>
  )}
{filteredJournals.map((journal) => (
    <div
  className="journal-entry"
  key={journal.id}
  onClick={() => setSelectedJournalId(journal.id)}
>
      <div className="journal-entry-header">
        <div>
          <strong>No.{journal.id}</strong>
          <span>{journal.date}</span>
        </div>
        <span>
  {journal.description}
  {journal.reversed ? '（取消済み）' : ''}
  {journal.deleted ? '（削除済み）' : ''}
</span>
      </div>

      <div className="journal-sides">
        <div className="journal-side">
          <span className="journal-side-label">借方</span>
          <strong>{journal.debitAccount}</strong>
          <span>¥{journal.amount.toLocaleString()}</span>
        </div>

        <div className="journal-side">
          <span className="journal-side-label">貸方</span>
          <strong>{journal.creditAccount}</strong>
          <span>¥{journal.amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  ))}
</div>
  </section>
)}
{activeNav === 'journal' && selectedJournal !== null && !isEditingJournal && (
  <section className="journal-form-page">
    <div className="journal-form-header">
      <div>
        <p className="section-label">JOURNAL DETAIL</p>
        <h2>仕訳詳細</h2>
      </div>

      <div className="journal-detail-actions">
  <button
    type="button"
    onClick={() => setSelectedJournalId(null)}
  >
    ← 仕訳一覧へ
  </button>

  {!selectedJournal.deleted &&
  !selectedJournal.reversed &&
  !('isReversal' in selectedJournal) && (
  <>
    <button
      type="button"
      onClick={handleStartEditJournal}
    >
      編集
    </button>

    <button
      type="button"
      onClick={handleDeleteJournal}
    >
      削除
    </button>

    {!selectedJournal.reversed && (
      <button
        type="button"
        onClick={handleReverseJournal}
      >
        取消
      </button>
    )}
  </>
)}
</div>
    </div>

    <div className="journal-entry">
      <div className="journal-entry-header">
        <div>
          <strong>No.{selectedJournal.id}</strong>
          <span>{selectedJournal.date}</span>
        </div>
        <span>
  {selectedJournal.description}
  {selectedJournal.reversed && '（取消済み）'}
  {selectedJournal.deleted && '（削除済み）'}
</span>
      </div>

      <div className="journal-sides">
        <div className="journal-side">
          <span className="journal-side-label">借方</span>
          <strong>{selectedJournal.debitAccount}</strong>
          <span>¥{selectedJournal.amount.toLocaleString()}</span>
        </div>

        <div className="journal-side">
          <span className="journal-side-label">貸方</span>
          <strong>{selectedJournal.creditAccount}</strong>
          <span>¥{selectedJournal.amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </section>
)}
{activeNav === 'journal' && (showJournalForm || isEditingJournal) && (
  <section className="journal-form-page">
    <div className="journal-form-header">
      <div>
        <p className="section-label">
  {isEditingJournal ? 'EDIT JOURNAL' : 'NEW JOURNAL'}
</p>
<h2>
  {isEditingJournal ? '仕訳を編集' : '新規仕訳'}
</h2>
      </div>

      <button
        type="button"
        onClick={() => {
  setShowJournalForm(false)
  setIsEditingJournal(false)
  setSelectedJournalId(null)
}}
      >
        ← 仕訳一覧へ
      </button>
    </div>

    <div className="journal-form">
      <label>
        日付
        <input
  type="date"
  value={journalDate}
  onChange={(e) => setJournalDate(e.target.value)}
/>
      </label>

      <label>
        摘要
       <input
  type="text"
  maxLength={50}
  placeholder="例：スーパーで食料品を購入"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
      </label>

      <div className="journal-form-sides">
        <div className="journal-form-side">
          <h3>借方</h3>

          <label>
            勘定科目
           <select
  value={debitAccount}
  onChange={(e) => setDebitAccount(e.target.value)}
>
              <option value="" disabled>選択してください</option>
              {accounts
  .filter((account) => account.active && !accounts.some((child) => child.parentId === account.id) && (account.parentId === null || accounts.find((parent) => parent.id === account.parentId)?.active))
  .map((account) => (
    <option key={account.id} value={account.name}>
      {account.name}
    </option>
  ))}
            </select>
          </label>

          <label>
            金額
            <input
  type="number"
  min="0"
  step="1"
  placeholder="0"
  value={debitAmount}
  onChange={(e) => setDebitAmount(e.target.value)}
/>
          </label>
        </div>

        <div className="journal-form-side">
          <h3>貸方</h3>

          <label>
            勘定科目
            <select
  value={creditAccount}
  onChange={(e) => setCreditAccount(e.target.value)}
>
              <option value="" disabled>選択してください</option>
              {accounts
  .filter((account) => account.active && !accounts.some((child) => child.parentId === account.id) && (account.parentId === null || accounts.find((parent) => parent.id === account.parentId)?.active))
  .map((account) => (
    <option key={account.id} value={account.name}>
      {account.name}
    </option>
  ))}
            </select>
          </label>

          <label>
            金額
            <input
  type="number"
  min="0"
  step="1"
  placeholder="0"
  value={creditAmount}
  onChange={(e) => setCreditAmount(e.target.value)}
/>
          </label>
        </div>
      </div>

      <button
  className="journal-submit-button"
  type="button"
  disabled={!isBalanced}
  onClick={isEditingJournal ? handleUpdateJournal : handleAddJournal}
>
  {isEditingJournal ? '変更を保存' : '仕訳を登録'}
</button>
    </div>
  </section>
)}
{activeNav === 'report' && (
  <section className="journal-page report-page">
    <p className="section-label">REPORT</p>
    <h2>レポート</h2>
    <div className="report-tabs">
  <button
    type="button"
    className={activeReportTab === 'trial' ? 'active' : ''}
    onClick={() => setActiveReportTab('trial')}
  >
    試算表
  </button>

  <button
    type="button"
    className={activeReportTab === 'bs' ? 'active' : ''}
    onClick={() => setActiveReportTab('bs')}
  >
    BS
  </button>

  <button
    type="button"
    className={activeReportTab === 'pl' ? 'active' : ''}
    onClick={() => setActiveReportTab('pl')}
  >
    PL
  </button>
</div>
{activeReportTab === 'trial' && (
  <>
<div className="report-section-heading">
  <div>
    <p className="section-label">TRIAL BALANCE</p>
    <h3>試算表</h3>
  </div>
  <span className="report-period">
    {displayMonth.replace('-', '年')}月
  </span>
</div>
<label className="trial-balance-toggle">
  <input
    type="checkbox"
    checked={showAllTrialBalanceAccounts}
    onChange={(event) =>
      setShowAllTrialBalanceAccounts(event.target.checked)
    }
  />
  全科目を表示（残高0円を含む）
</label>

    <table className="trial-balance-table">
      <thead>
        <tr>
          <th>勘定科目</th>
          <th>借方残高</th>
          <th>貸方残高</th>
        </tr>
      </thead>

      <tbody>
        
{trialBalanceAccounts
  .filter((account) =>
    showAllTrialBalanceAccounts || getTrialBalanceAmount(account) !== 0
  )
  .map((account) => {
    const amount = getTrialBalanceAmount(account)

          const debitAmount = isDebitBalanceAccount(account)
            ? Math.max(amount, 0)
            : Math.max(-amount, 0)
          const creditAmount = isDebitBalanceAccount(account)
            ? Math.max(-amount, 0)
            : Math.max(amount, 0)

          return (
            <tr key={account.id}>
              <td>{account.name}</td>
              <td>{debitAmount === 0 ? '―' : `¥${debitAmount.toLocaleString()}`}</td>
              <td>{creditAmount === 0 ? '―' : `¥${creditAmount.toLocaleString()}`}</td>
            </tr>
          )
        })}

{trialBalanceOpeningEquity !== 0 && (
  <tr className="trial-balance-opening-equity">
    <td>期首純資産</td>
    <td>
      {trialBalanceOpeningEquity < 0
        ? `¥${Math.abs(trialBalanceOpeningEquity).toLocaleString()}`
        : '—'}
    </td>
    <td>
      {trialBalanceOpeningEquity > 0
        ? `¥${trialBalanceOpeningEquity.toLocaleString()}`
        : '—'}
    </td>
  </tr>
)}

</tbody>

      <tfoot>
        <tr>
          <th>合計</th>
          <th>¥{trialBalanceDebitTotal.toLocaleString()}</th>
          <th>¥{trialBalanceCreditTotal.toLocaleString()}</th>
        </tr>
            </tfoot>
   </table>
</>
)}
{activeReportTab === 'bs' && (
  <>
    <div className="report-section-heading">
  <div>
    <p className="section-label">BALANCE SHEET</p>
    <h3>貸借対照表</h3>
  </div>
  <span className="report-period">
    {displayMonth.replace('-', '年')}月末
  </span>
</div>

<div className="balance-sheet-table">
  <div className="balance-sheet-side">
    <h4>資産の部</h4>

    {getGroupedAccountBalances(
  'asset',
  (account) => getAccountBalance(account, displayMonth)
).map(({ account, amount }) => (
  <div className="balance-sheet-row" key={account.id}>
    <span>{account.name}</span>
    <span>¥{amount.toLocaleString()}</span>
  </div>
))}

    <div className="balance-sheet-total">
      <strong>資産合計</strong>
      <strong>¥{totalAssets.toLocaleString()}</strong>
    </div>
  </div>

  <div className="balance-sheet-side">
    <h4>負債の部</h4>

    {getGroupedAccountBalances(
  'liability',
  (account) => getAccountBalance(account, displayMonth)
).map(({ account, amount }) => (
  <div className="balance-sheet-row" key={account.id}>
    <span>{account.name}</span>
    <span>¥{amount.toLocaleString()}</span>
  </div>
))}

    <div className="balance-sheet-total">
      <strong>負債合計</strong>
      <strong>¥{totalLiabilities.toLocaleString()}</strong>
    </div>

    <h4>純資産の部</h4>

    {getGroupedAccountBalances(
  'equity',
  (account) => getAccountBalance(account, displayMonth)
).map(({ account, amount }) => (
  <div className="balance-sheet-row" key={account.id}>
    <span>{account.name}</span>
    <span>¥{Math.abs(amount).toLocaleString()}</span>
  </div>
))}

    <div className="balance-sheet-row">
      <span>繰越純資産</span>
      <span>¥{Math.abs(openingEquity + priorNetIncome).toLocaleString()}</span>
    </div>

    <div className="balance-sheet-row">
      <span>当期純利益</span>
      <span>¥{netIncome.toLocaleString()}</span>
    </div>

    <div className="balance-sheet-total">
      <strong>純資産合計</strong>
      <strong>¥{totalEquity.toLocaleString()}</strong>
    </div>

    <div className="balance-sheet-grand-total">
      <strong>負債・純資産合計</strong>
      <strong>¥{totalLiabilitiesAndEquity.toLocaleString()}</strong>
    </div>
  </div>
</div>
{!isBalanceSheetBalanced && (
  <p className="balance-sheet-error">
    貸借が一致していません（差額 ¥{balanceSheetDifference.toLocaleString()}）
  </p>
)}
  </>
)}
{activeReportTab === 'pl' && (
  <>
<div className="report-section-heading">
  <div>
    <p className="section-label">PROFIT & LOSS</p>
    <h3>損益計算書</h3>
  </div>
  <span className="report-period">
    {displayMonth.replace('-', '年')}月
  </span>
</div>
<table className="income-statement-table">
  <tbody>
    <tr className="statement-section">
      <th colSpan={2}>収益の部</th>
    </tr>

    
{getGroupedAccountBalances(
  'revenue',
  (account) => getMonthlyAccountBalance(account, displayMonth)
).map(({ account, amount }) => (
  <tr key={account.id}>
    <td>{account.name}</td>
    <td>¥{amount.toLocaleString()}</td>
  </tr>
))}
    <tr className="statement-total">
      <th>収益合計</th>
      <th>¥{totalRevenue.toLocaleString()}</th>
    </tr>

    <tr className="statement-section">
      <th colSpan={2}>費用の部</th>
    </tr>

    
{getGroupedAccountBalances(
  'expense',
  (account) => getMonthlyAccountBalance(account, displayMonth)
).map(({ account, amount }) => (
  <tr key={account.id}>
    <td>{account.name}</td>
    <td>¥{amount.toLocaleString()}</td>
  </tr>
))}


    <tr className="statement-total">
      <th>費用合計</th>
      <th>¥{totalExpense.toLocaleString()}</th>
    </tr>

    <tr className="statement-grand-total">
      <th>当期純利益</th>
      <th>¥{netIncome.toLocaleString()}</th>
    </tr>
  </tbody>
</table>
</>
)}
<div className="report-section-heading">
  <div>
    <p className="section-label">MONTHLY TREND</p>
    <h3>科目別月次推移</h3>
  </div>
</div>

<div className="ledger-account-selector">
  <label htmlFor="trend-account">勘定科目</label>

  <select
    id="trend-account"
    value={trendAccountId ?? ''}
    onChange={(event) =>
      setTrendAccountId(
        event.target.value === '' ? null : Number(event.target.value)
      )
    }
  >
    <option value="">勘定科目を選択</option>

    {accounts
      .filter((account) => account.active)
      .map((account) => (
        <option key={account.id} value={account.id}>
          {account.name}
        </option>
      ))}
  </select>
</div>
{trendAccount && (
  <div className="trend-section">
    <h4>{trendAccount.name}</h4>
<div className="trend-chart">
  {trendData.map((item) => {
    const maxAmount = Math.max(
      ...trendData.map((data) => Math.abs(data.amount)),
      1
    )

    const height = (Math.abs(item.amount) / maxAmount) * 100

    return (
      <div className="trend-chart-item" key={item.month}>
        <div className="trend-chart-value">
          ¥{item.amount.toLocaleString()}
        </div>

        <div className="trend-chart-bar-area">
          <div
            className="trend-chart-bar"
            style={{ height: `${height}%` }}
          />
        </div>

        <div className="trend-chart-label">
          {item.month.slice(5)}月
        </div>
      </div>
    )
  })}
</div>
    <table className="trend-table">
      <thead>
        <tr>
          <th>月</th>
          <th>金額</th>
        </tr>
      </thead>

      <tbody>
        {trendData.map((item) => (
          <tr key={item.month}>
            <td>{item.month.replace('-', '年')}月</td>
            <td>¥{item.amount.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
<div className="report-section-heading">
  <div>
    <p className="section-label">GENERAL LEDGER</p>
    <h3>総勘定元帳</h3>
  </div>
</div>

<div className="ledger-account-selector">
  <label htmlFor="ledger-account">勘定科目</label>

  <select
    id="ledger-account"
    value={ledgerAccountId ?? ''}
    onChange={(event) =>
      setLedgerAccountId(
        event.target.value === '' ? null : Number(event.target.value)
      )
    }
  >
    <option value="">勘定科目を選択</option>

    {accounts
      .filter((account) => account.active)
      .map((account) => (
        <option key={account.id} value={account.id}>
          {account.name}
        </option>
      ))}
  </select>
</div>
{ledgerAccount && (
  <>
    <p className="ledger-account-name">{ledgerAccount.name}</p>

    <div className="general-ledger-scroll">
  <table className="general-ledger-table">
      <thead>
        <tr>
          <th>No.</th>
          <th>日付</th>
          <th>摘要</th>
          <th>借方</th>
          <th>貸方</th>
          <th>残高</th>
        </tr>
      </thead>

      <tbody>
        <tr className="ledger-opening-row">
  <td>―</td>
  <td>{getPreviousMonth(displayMonth).replace('-', '/')}末</td>
  <td>前月繰越</td>
  <td>―</td>
  <td>―</td>
  <td>
    {ledgerOpeningBalance === 0
      ? '―'
      : ledgerOpeningBalance < 0
        ? `△¥${Math.abs(ledgerOpeningBalance).toLocaleString()}`
        : `¥${ledgerOpeningBalance.toLocaleString()}`}
  </td>
</tr>
        {ledgerRows.map((journal) => (
          <tr key={journal.id}>
            <td>{journal.id}</td>
            <td>{journal.date}</td>
            <td>{journal.description}</td>
            <td>
              {journal.debitAccount === ledgerAccount.name
                ? `¥${journal.amount.toLocaleString()}`
                : '―'}
            </td>
            <td>
              {journal.creditAccount === ledgerAccount.name
                ? `¥${journal.amount.toLocaleString()}`
                : '―'}
            </td>
            <td>
  {journal.balance === 0
    ? '―'
    : journal.balance < 0
      ? `△¥${Math.abs(journal.balance).toLocaleString()}`
      : `¥${journal.balance.toLocaleString()}`}
</td>
          </tr>
        ))}
        <tr className="ledger-closing-row">
  <td>―</td>
  <td>{displayMonth.replace('-', '/')}末</td>
  <td>次月繰越</td>
  <td>―</td>
  <td>―</td>
  <td>
    {(ledgerRows.length > 0
      ? ledgerRows[ledgerRows.length - 1].balance
      : ledgerOpeningBalance) === 0
      ? '―'
      : (ledgerRows.length > 0
          ? ledgerRows[ledgerRows.length - 1].balance
          : ledgerOpeningBalance) < 0
        ? `△¥${Math.abs(
            ledgerRows.length > 0
              ? ledgerRows[ledgerRows.length - 1].balance
              : ledgerOpeningBalance
          ).toLocaleString()}`
        : `¥${(
            ledgerRows.length > 0
              ? ledgerRows[ledgerRows.length - 1].balance
              : ledgerOpeningBalance
          ).toLocaleString()}`}
  </td>
</tr>
       </tbody>
  </table>
</div>
  </>
)}
  </section>
)}
{activeNav === 'settings' && (
  <section className="settings-page">
    {settingsView === 'menu' ? (
  <>
    <p className="section-label">SETTINGS</p>
    <h2>設定</h2>

    <div className="settings-menu">
      <p className="settings-menu-label">会計</p>

      <div className="settings-menu-group">
        <button type="button" onClick={() => setSettingsView('accounts')}>
          <span>
            <strong>勘定科目</strong>
            <small>科目・階層・残高管理</small>
          </span>
          <span>›</span>
        </button>

        <button type="button" onClick={() => setSettingsView('recurring')}>
          <span>
            <strong>定期仕訳</strong>
            <small>毎月の取引を登録・管理</small>
          </span>
          <span>›</span>
        </button>

        <button type="button" onClick={() => setSettingsView('closing')}>
          <span>
            <strong>月次締め</strong>
            <small>月の確定・締め解除</small>
          </span>
          <span>›</span>
        </button>
      </div>

      <p className="settings-menu-label">データ</p>

      <div className="settings-menu-group">
        <button type="button" onClick={() => setSettingsView('backup')}>
          <span>
            <strong>バックアップ・復元</strong>
            <small>JSONでデータを保存・復元</small>
          </span>
          <span>›</span>
        </button>

        <button type="button" onClick={() => setSettingsView('export')}>
          <span>
            <strong>CSVエクスポート</strong>
            <small>仕訳データを書き出す</small>
          </span>
          <span>›</span>
        </button>
      </div>
    </div>
  </>
) : settingsView === 'accounts' ? (
  <>
    <p className="section-label">ACCOUNTS</p>
    <h2>勘定科目</h2>
    <p className="settings-page-description">
      家計簿で使用する勘定科目・階層・残高設定を管理します。
    </p>

    <div className="account-create-card">
      <p className="settings-card-label">NEW ACCOUNT</p>
      <h3>勘定科目を追加</h3>

      <div className="account-create-form">
        <label>
          科目名
          <input
            type="text"
            placeholder="例：普通預金"
            value={newAccountName}
            onChange={(event) => setNewAccountName(event.target.value)}
          />
        </label>

        <label>
          科目区分
          <select
            value={newAccountType}
            onChange={(event) => {
              setNewAccountType(event.target.value)
              setNewAccountParentId(null)
            }}
          >
            <option value="asset">資産</option>
            <option value="liability">負債</option>
            <option value="equity">純資産</option>
            <option value="revenue">収益</option>
            <option value="expense">費用</option>
          </select>
        </label>

        <label>
          親科目
          <select
            value={newAccountParentId ?? ''}
            onChange={(event) =>
              setNewAccountParentId(
                event.target.value === ''
                  ? null
                  : Number(event.target.value)
              )
            }
          >
            <option value="">親科目なし</option>
            {accounts
              .filter(
                (account) =>
                  account.type === newAccountType &&
                  account.parentId === null
              )
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
          </select>
        </label>

        <button
          className="account-primary-button"
          type="button"
          onClick={handleAddAccount}
        >
          勘定科目を追加
        </button>
      </div>
    </div>

    <div className="account-list">
      {(
        ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
      )
        .flatMap((type) =>
          accounts
            .filter(
              (account) =>
                account.type === type &&
                account.parentId === null
            )
            .flatMap((parent) => [
              parent,
              ...accounts.filter(
                (account) => account.parentId === parent.id
              ),
            ])
        )
        .map((account, index, sortedAccounts) => (
          <Fragment key={`account-${account.id}`}>
            {(index === 0 ||
              sortedAccounts[index - 1].type !== account.type) && (
              <h3 className="account-tree-section-title">
                {accountTypeLabels[account.type]}
              </h3>
            )}

            <div
              className={`account-tree-item ${
                account.parentId === null
                  ? 'account-tree-parent'
                  : 'account-tree-child'
              }`}
            >
              <div className="account-tree-info">
                <div className="account-tree-main">
                  <span className="account-tree-name">
                    {account.name}
                    {account.active ? '' : '【無効】'}
                  </span>

                  <div className="account-tree-meta">
                    <span>
                      残高管理：
                      {account.balanceManaged ? 'ON' : 'OFF'}
                    </span>

                    {account.balanceManaged && (
                      <span>
                        開始残高：
                        {account.openingBalance.toLocaleString()}円
                      </span>
                    )}
                  </div>
                </div>

                <div className="account-tree-values">
  {account.balanceManaged && (
    <span className="account-tree-balance">
      {getAccountBalance(account).toLocaleString()}円
    </span>
  )}

  {account.type === 'liability' && (
    <span className="account-real-balance-status">
      実質残高に含める：
      {account.includeInRealBalance ? 'ON' : 'OFF'}
    </span>
  )}
</div>
              </div>

              {editingAccountId === account.id && (
                <div className="account-edit-form">
                  <input
                    type="text"
                    value={editingAccountName}
                    onChange={(event) =>
                      setEditingAccountName(event.target.value)
                    }
                  />

                  <input
                    type="number"
                    value={editingAccountOpeningBalance}
                    onChange={(event) =>
                      setEditingAccountOpeningBalance(
                        Number(event.target.value)
                      )
                    }
                    placeholder="開始残高"
                  />

                  <select
                    value={editingAccountType}
                    disabled={
                      isAccountUsed(account.name) ||
                      account.parentId !== null ||
                      accounts.some(
                        (child) => child.parentId === account.id
                      )
                    }
                    onChange={(event) =>
                      setEditingAccountType(event.target.value)
                    }
                  >
                    <option value="asset">資産</option>
                    <option value="liability">負債</option>
                    <option value="equity">純資産</option>
                    <option value="revenue">収益</option>
                    <option value="expense">費用</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      handleSaveAccountName(account.id)
                    }
                  >
                    保存
                  </button>
                </div>
              )}

              <div className="account-tree-actions">
                {(account.type === 'asset' ||
                  account.type === 'liability') && (
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleBalanceManaged(account.id)
                    }
                  >
                    残高管理を切替
                  </button>
                )}

                {account.type === 'liability' && (
                  <button
                    type="button"
                    disabled={!account.balanceManaged}
                    onClick={() =>
                      handleToggleIncludeInRealBalance(account.id)
                    }
                  >
                    実質残高設定
                  </button>
                )}

                <button
                  className="account-tree-edit-button"
                  type="button"
                  onClick={() => {
                    setEditingAccountId(account.id)
                    setEditingAccountName(account.name)
                    setEditingAccountType(account.type)
                    setEditingAccountOpeningBalance(
                      account.openingBalance
                    )
                  }}
                >
                  編集
                </button>

                <button
                  className="account-tree-active-button"
                  type="button"
                  onClick={() =>
                    handleToggleAccountActive(account.id)
                  }
                >
                  {account.active ? '無効化' : '有効化'}
                </button>

                {!isAccountUsed(account.name) && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteAccount(account.id)
                    }
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          </Fragment>
        ))}
    </div>

    <button
      className="settings-back-button"
      type="button"
      onClick={() => setSettingsView('menu')}
    >
      ← 設定に戻る
    </button>
  </>
) : settingsView === 'recurring' ? (
  <div className="recurring-page">
    <div className="recurring-header">
      <p className="section-label">RECURRING</p>
      <h2>定期仕訳</h2>
      <p className="recurring-description">
        毎月発生する取引を登録し、仕訳候補として管理します。
      </p>
    </div>

    <div className="recurring-form-card">
      <div className="recurring-form-grid">
        <label className="recurring-field recurring-field-wide">
          <span>摘要</span>
          <input
            type="text"
            value={recurringDescription}
            onChange={(event) => setRecurringDescription(event.target.value)}
            placeholder="例：家賃"
          />
        </label>

        <label className="recurring-field">
          <span>借方科目</span>
          <select
            value={recurringDebitAccount}
            onChange={(event) => setRecurringDebitAccount(event.target.value)}
          >
            <option value="">選択してください</option>
            {accounts
              .filter((account) => account.active)
              .map((account) => (
                <option key={account.id} value={account.name}>
                  {account.name}
                </option>
              ))}
          </select>
        </label>

        <label className="recurring-field">
          <span>貸方科目</span>
          <select
            value={recurringCreditAccount}
            onChange={(event) => setRecurringCreditAccount(event.target.value)}
          >
            <option value="">選択してください</option>
            {accounts
              .filter((account) => account.active)
              .map((account) => (
                <option key={account.id} value={account.name}>
                  {account.name}
                </option>
              ))}
          </select>
        </label>

        <label className="recurring-field">
          <span>金額</span>
          <input
            type="number"
            min="1"
            step="1"
            value={recurringAmount}
            onChange={(event) => setRecurringAmount(event.target.value)}
            placeholder="0"
          />
        </label>

        <label className="recurring-field">
          <span>起票日</span>
          <div className="recurring-day-input">
            <span>毎月</span>
            <input
              type="number"
              min="1"
              max="31"
              step="1"
              value={recurringDay}
              onChange={(event) => setRecurringDay(event.target.value)}
            />
            <span>日</span>
          </div>
        </label>
      </div>

      <button
        className="recurring-primary-button"
        type="button"
        onClick={handleAddRecurringJournal}
      >
        {editingRecurringJournalId !== null
          ? '変更を保存'
          : '定期仕訳を登録'}
      </button>
    </div>

    <section className="recurring-section">
      <div className="recurring-section-heading">
        <div>
          <p className="section-label">REGISTERED</p>
          <h3>登録済みの定期仕訳</h3>
        </div>
        <span className="recurring-count">
          {recurringJournals.length}件
        </span>
      </div>

      {recurringJournals.length === 0 ? (
        <div className="recurring-empty">
          登録されている定期仕訳はありません。
        </div>
      ) : (
        <div className="recurring-list">
          {recurringJournals.map((journal) => (
            <div
              className={`recurring-item ${
                !journal.active ? 'recurring-item-inactive' : ''
              }`}
              key={journal.id}
            >
              <div className="recurring-item-main">
                <div className="recurring-item-title">
                  <strong>{journal.description}</strong>

                  {editingRecurringJournalId === journal.id && (
                    <span className="recurring-editing-badge">
                      編集中
                    </span>
                  )}

                  {!journal.active && (
                    <span className="recurring-paused-badge">
                      停止中
                    </span>
                  )}
                </div>

                <div className="recurring-item-details">
                  <span>毎月{journal.day}日</span>
                  <span>
                    {journal.debitAccount} / {journal.creditAccount}
                  </span>
                  <strong>¥{journal.amount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="recurring-item-actions">
                <button
                  className="recurring-secondary-button"
                  type="button"
                  onClick={() => handleStartEditRecurringJournal(journal)}
                >
                  編集
                </button>

                <button
                  className="recurring-secondary-button"
                  type="button"
                  onClick={() => handleToggleRecurringJournal(journal.id)}
                >
                  {journal.active ? '停止' : '再開'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    <section className="recurring-section">
      <div className="recurring-section-heading">
        <div>
          <p className="section-label">THIS MONTH</p>
          <h3>今月の定期仕訳候補</h3>
        </div>
        <span className="recurring-count">
          {recurringCandidates.length}件
        </span>
      </div>

      {recurringCandidates.length === 0 ? (
        <div className="recurring-empty">
          今月の候補はありません。
        </div>
      ) : (
        <div className="recurring-list">
          {recurringCandidates.map((journal) => (
            <div className="recurring-item" key={journal.id}>
              <div className="recurring-item-main">
                <strong>{journal.description}</strong>

                <div className="recurring-item-details">
                  <span>毎月{journal.day}日</span>
                  <span>
                    {journal.debitAccount} / {journal.creditAccount}
                  </span>
                  <strong>¥{journal.amount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="recurring-item-actions">
                <button
                  className="recurring-primary-small"
                  type="button"
                  onClick={() => handleRegisterRecurringCandidate(journal)}
                >
                  仕訳登録
                </button>

                <button
                  className="recurring-secondary-button"
                  type="button"
                  onClick={() => {
                    const key = `${displayMonth}-${journal.id}`

                    setSkippedRecurringCandidates((current) =>
                      current.includes(key)
                        ? current.filter((item) => item !== key)
                        : [...current, key]
                    )
                  }}
                >
                  {skippedRecurringCandidates.includes(
                    `${displayMonth}-${journal.id}`
                  )
                    ? 'スキップ取消'
                    : '今月はスキップ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    <button
      className="recurring-back-button"
      type="button"
      onClick={() => setSettingsView('menu')}
    >
      ← 設定に戻る
    </button>
  </div>
) : settingsView === 'closing' ? (
  <div className="closing-page">
    <div className="closing-header">
      <p className="section-label">CLOSING</p>
      <h2>締め処理</h2>
      <p className="closing-description">
        確定した期間を締めて、仕訳の変更を防止します。
      </p>
    </div>

    <section className="closing-card">
      <div className="closing-card-heading">
        <div>
          <p className="section-label">MONTHLY</p>
          <h3>月次締め</h3>
        </div>

        <span className="closing-count">
          {closedMonths.length}件
        </span>
      </div>

      <div className="closing-control">
        <label className="closing-field">
          <span>対象月</span>
          <input
            type="month"
            min={startMonth}
            max={getPreviousMonth(
              new Date().toISOString().slice(0, 7)
            )}
            value={closingMonth}
            onChange={(event) =>
              setClosingMonth(event.target.value)
            }
          />
        </label>

        <button
          className={
            closedMonths.includes(closingMonth)
              ? 'closing-secondary-button'
              : 'closing-primary-button'
          }
          type="button"
          onClick={() =>
            closedMonths.includes(closingMonth)
              ? handleReopenMonth(closingMonth)
              : handleCloseMonth(closingMonth)
          }
        >
          {closedMonths.includes(closingMonth)
            ? 'この月の締めを解除'
            : 'この月を締める'}
        </button>
      </div>

      <div className="closing-history">
        <h4>締め済みの月</h4>

        {closedMonths.length === 0 ? (
          <div className="closing-empty">
            締め済みの月はありません。
          </div>
        ) : (
          <div className="closing-period-list">
            {[...closedMonths]
              .sort()
              .reverse()
              .map((month) => (
                <div
                  className="closing-period-item"
                  key={month}
                >
                  <span>{month.replace('-', '年')}月</span>
                  <span className="closing-status-badge">
                    締め済み
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>

    <section className="closing-card">
      <div className="closing-card-heading">
        <div>
          <p className="section-label">YEARLY</p>
          <h3>年次締め</h3>
        </div>

        <span className="closing-count">
          {closedYears.length}件
        </span>
      </div>

      <div className="closing-control">
        <label className="closing-field">
          <span>対象年</span>
          <input
            type="number"
            value={closingYear}
            onChange={(event) =>
              setClosingYear(Number(event.target.value))
            }
            min={Number(startMonth.slice(0, 4))}
            max={new Date().getFullYear()}
          />
        </label>

        <button
          className={
            closedYears.includes(closingYear)
              ? 'closing-secondary-button'
              : 'closing-primary-button'
          }
          type="button"
          onClick={() =>
            closedYears.includes(closingYear)
              ? handleReopenYear(closingYear)
              : handleCloseYear(closingYear)
          }
        >
          {closedYears.includes(closingYear)
            ? 'この年の締めを解除'
            : 'この年を締める'}
        </button>
      </div>

      <div className="closing-history">
        <h4>締め済みの年</h4>

        {closedYears.length === 0 ? (
          <div className="closing-empty">
            締め済みの年はありません。
          </div>
        ) : (
          <div className="closing-period-list">
            {[...closedYears]
              .sort((a, b) => b - a)
              .map((year) => (
                <div
                  className="closing-period-item"
                  key={year}
                >
                  <span>{year}年</span>
                  <span className="closing-status-badge">
                    締め済み
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>

    <button
      className="closing-back-button"
      type="button"
      onClick={() => setSettingsView('menu')}
    >
      ← 設定に戻る
    </button>
  </div>
) : settingsView === 'backup' ? (
  <div className="backup-page">
    <div className="backup-header">
      <p className="section-label">BACKUP</p>
      <h2>バックアップ・復元</h2>
      <p className="backup-description">
        FOLIOのデータをJSONファイルとして保存・復元できます。
      </p>
    </div>

    <section className="backup-card">
      <div className="backup-card-heading">
        <div>
          <p className="section-label">SAVE</p>
          <h3>バックアップを保存</h3>
        </div>
      </div>

      <p className="backup-card-description">
        現在の仕訳・勘定科目・設定などをまとめて保存します。
      </p>

      <button
        className="backup-primary-button"
        type="button"
        onClick={handleDownloadBackup}
      >
        バックアップを保存
      </button>
    </section>

    <section className="backup-card">
      <div className="backup-card-heading">
        <div>
          <p className="section-label">RESTORE</p>
          <h3>バックアップから復元</h3>
        </div>
      </div>

      <p className="backup-card-description">
        保存したFOLIOのJSONバックアップファイルを選択して、
        データを復元します。
      </p>

      <label className="backup-file-field">
        <span>バックアップファイル</span>

        <input
          type="file"
          accept=".json,application/json"
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (file) {
              handleRestoreBackup(file)
            }

            event.target.value = ''
          }}
        />
      </label>

      <p className="backup-warning">
        復元すると、現在のFOLIOのデータはバックアップの内容に置き換わります。
      </p>
    </section>

<section className="backup-card">
  <div className="backup-card-heading">
    <div>
      <p className="section-label">RESET</p>
      <h3>データの初期化</h3>
    </div>
  </div>

  <p className="backup-card-description">
    仕訳・定期仕訳・締め履歴を削除し、
    勘定科目を本番用の初期30科目に戻します。
  </p>

  <p className="backup-warning">
    初期化すると現在のデータは失われます。
    必ずバックアップを保存してから実行してください。
  </p>

  
<button
  className="backup-primary-button"
  type="button"
  onClick={handleResetData}
>
  データを初期化
</button>

</section>

    <button
      className="backup-back-button"
      type="button"
      onClick={() => setSettingsView('menu')}
    >
      ← 設定に戻る
    </button>
  </div>
) : settingsView === 'export' ? (
  <div className="export-page">
    <div className="export-header">
      <p className="section-label">EXPORT</p>
      <h2>データ書き出し</h2>
      <p className="export-description">
        FOLIOに登録されている仕訳データを書き出します。
      </p>
    </div>

    <section className="export-card">
      <div className="export-card-heading">
        <div>
          <p className="section-label">CSV</p>
          <h3>仕訳データをCSVで保存</h3>
        </div>
      </div>

      <p className="export-card-description">
        登録されている仕訳データをCSVファイルとして保存できます。
      </p>

      <div className="export-info">
        <span className="export-info-label">ファイル形式</span>
        <strong>CSV</strong>
      </div>

      <button
        className="export-primary-button"
        type="button"
        onClick={handleExportCsv}
      >
        CSVを書き出す
      </button>
    </section>

    <button
      className="export-back-button"
      type="button"
      onClick={() => setSettingsView('menu')}
    >
      ← 設定に戻る
    </button>
  </div>
) : (
  <>
    <p>この設定画面は現在準備中です。</p>
    <button type="button" onClick={() => setSettingsView('menu')}>
      ← 設定に戻る
    </button>
    </>
)}
  </section>
)}
      <nav className="bottom-nav">
  <button
  className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
  type="button"
onClick={() => {
  setActiveNav('home')
  window.scrollTo(0, 0)
}}
>
  <span className="nav-icon">⌂</span>
  <span>ホーム</span>
</button>

  <button
  className={`nav-item ${activeNav === 'journal' ? 'active' : ''}`}
  type="button"
onClick={() => {
  setActiveNav('journal')
  setShowJournalForm(false)
  setSelectedJournalId(null)
  setIsEditingJournal(false)

  setDebitAmount('')
  setCreditAmount('')
  setDebitAccount('')
  setCreditAccount('')
  setDescription('')

  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  setJournalDate(`${year}-${month}-${day}`)

  window.scrollTo(0, 0)
}}
>
  <span className="nav-icon">≡</span>
  <span>仕訳</span>
</button>

  <button
  className={`nav-item ${activeNav === 'report' ? 'active' : ''}`}
  type="button"
onClick={() => {
  setActiveNav('report')
  window.scrollTo(0, 0)
}}
>
  <span className="nav-icon">▥</span>
  <span>レポート</span>
</button>

  <button
  className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
  type="button"
onClick={() => {
  setActiveNav('settings')
  setSettingsView('menu')
  window.scrollTo(0, 0)
}}
>
    <span className="nav-icon">⚙</span>
    <span>設定</span>
  </button>
</nav>
</main>
    </div>
  )
}

export default App