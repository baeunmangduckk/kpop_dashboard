import { create } from 'zustand'

interface TrendsFilterState {
  // 숨긴 키워드만 보관 (기본은 전체 표시)
  hiddenKeywords: string[]
  // total: 전체 키워드 수 - 마지막 하나는 숨길 수 없음
  toggleKeyword: (keyword: string, total: number) => void
  reset: () => void
}

// 트렌드 전망 화면의 키워드 필터
export const useTrendsFilterStore = create<TrendsFilterState>(set => ({
  hiddenKeywords: [],
  toggleKeyword: (keyword, total) =>
    set(state => {
      if (state.hiddenKeywords.includes(keyword)) {
        return {
          hiddenKeywords: state.hiddenKeywords.filter(k => k !== keyword),
        }
      }
      return state.hiddenKeywords.length + 1 >= total
        ? state
        : { hiddenKeywords: [...state.hiddenKeywords, keyword] }
    }),
  reset: () => set({ hiddenKeywords: [] }),
}))
