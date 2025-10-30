import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authAPI, profileAPI } from "../../services/api"

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await authAPI.getCurrentUser()
    return response.data.data.user
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error fetching user")
  }
})

export const updateProfile = createAsyncThunk("auth/updateProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await profileAPI.updateProfile(profileData)
    return response.data.data?.user || response.data.user
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error al actualizar perfil")
  }
})

export const changePassword = createAsyncThunk("auth/changePassword", async (passwordData, { rejectWithValue }) => {
  try {
    const response = await profileAPI.changePassword(passwordData)
    return response.data.message
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error al cambiar contraseña")
  }
})

export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(credentials)
    const { user, token } = response.data.data

    localStorage.setItem("token", token)

    return { user, token }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error al iniciar sesión")
  }
})

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
    },
    clearCredentials: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      // Update Profile cases
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Change Password cases
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Login cases
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.isLoading = false
        state.error = null
      })
  },
})

export const { setCredentials, clearCredentials, setLoading } = authSlice.actions

export default authSlice.reducer