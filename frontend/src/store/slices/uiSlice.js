import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  sidebarOpen: true,
  notifications: [],
  modals: {
    aiAnalysis: false,
    plagiarismCheck: false,
    suggestions: false,
  },
  loading: {
    aiAnalysis: false,
    plagiarismCheck: false,
    suggestions: false,
  },
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload)
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload
      state.loading[key] = value
    },
  },
})

export const { toggleSidebar, setSidebarOpen, addNotification, removeNotification, openModal, closeModal, setLoading } =
  uiSlice.actions

export default uiSlice.reducer
