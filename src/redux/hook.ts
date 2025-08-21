
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore
