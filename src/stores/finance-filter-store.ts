import { create } from 'zustand'

interface FinanceFilterState {
  // 숨긴 항목만 보관. 회사는 null이면 화면이 정한 기본값(중소 상장사 숨김)을 사용
  hiddenCompanies: string[] | null
  hiddenYears: number[]
  // total: 전체 개수 - 마지막 하나는 숨길 수 없음
  toggleCompany: (company: string, total: number, current: string[]) => void
  toggleYear: (year: number, total: number) => void
  reset: () => void
}

function toggle<T>(hidden: T[], value: T, total: number): T[] {
  if (hidden.includes(value)) return hidden.filter(item => item !== value)
  return hidden.length + 1 >= total ? hidden : [...hidden, value]
}

// 기획사 재무 화면의 회사·연도 필터
export const useFinanceFilterStore = create<FinanceFilterState>(set => ({
  hiddenCompanies: null,
  hiddenYears: [],
  toggleCompany: (company, total, current) =>
    set({ hiddenCompanies: toggle(current, company, total) }),
  toggleYear: (year, total) =>
    set(state => ({ hiddenYears: toggle(state.hiddenYears, year, total) })),
  reset: () => set({ hiddenCompanies: [], hiddenYears: [] }),
}))
