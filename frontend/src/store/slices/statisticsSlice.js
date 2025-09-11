import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../services/api"

// Async thunks
export const fetchStatistics = createAsyncThunk(
  "statistics/fetchStatistics",
  async ({ timeRange = "7d" } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/statistics?timeRange=${timeRange}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching statistics")
    }
  },
)

export const fetchUserStatistics = createAsyncThunk(
  "statistics/fetchUserStatistics",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/statistics/user/${userId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching user statistics")
    }
  },
)

export const fetchSystemHealth = createAsyncThunk("statistics/fetchSystemHealth", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/statistics/health")
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error fetching system health")
  }
})

const initialState = {
  statistics: {
    totalUsers: 0,
    totalDocuments: 0,
    totalAnalyses: 0,
    averageScore: 0,
    userGrowth: 0,
    documentGrowth: 0,
    analysisGrowth: 0,
    scoreChange: 0,
    dailyStats: [],
    topDocuments: [],
    recentActivity: [],
  },
  userStatistics: null,
  systemHealth: {
    api: "operational",
    database: "operational",
    ai: "operational",
    automation: "operational",
  },
  loading: false,
  error: null,
}

const statisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateSystemHealth: (state, action) => {
      state.systemHealth = { ...state.systemHealth, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false
        state.statistics = action.payload
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch User Statistics
      .addCase(fetchUserStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserStatistics.fulfilled, (state, action) => {
        state.loading = false
        state.userStatistics = action.payload
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch System Health
      .addCase(fetchSystemHealth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.loading = false
        state.systemHealth = action.payload
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, updateSystemHealth } = statisticsSlice.actions
export default statisticsSlice.reducer
