import { create } from 'zustand'

interface FinanceFilterState {
  // 숨긴 항목만 보관 (기본은 전체 표시)
  hiddenCompanies: string[]
  hiddenYears: number[]
  // total: 전체 개수 - 마지막 하나는 숨길 수 없음
  toggleCompany: (company: string, total: number) => void
  toggleYear: (year: number, total: number) => void
  reset: () => void
}

function toggle<T>(hidden: T[], value: T, total: number): T[] {
  if (hidden.includes(value)) return hidden.filter(item => item !== value)
  return hidden.length + 1 >= total ? hidden : [...hidden, value]
}

// 기획사 재무 화면의 회사·연도 필터
export const useFinanceFilterStore = create<FinanceFilterState>(set => ({
  hiddenCompanies: [],
  hiddenYears: [],
  toggleCompany: (company, total) =>
    set(state => ({
      hiddenCompanies: toggle(state.hiddenCompanies, company, total),
    })),
  toggleYear: (year, total) =>
    set(state => ({ hiddenYears: toggle(state.hiddenYears, year, total) })),
  reset: () => set({ hiddenCompanies: [], hiddenYears: [] }),
}))
