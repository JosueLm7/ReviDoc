import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { reviewsAPI } from "../../services/api"

// Async thunks
export const fetchReviews = createAsyncThunk("reviews/fetchReviews", async (params = {}, { rejectWithValue }) => {
  try {
    const response = await reviewsAPI.getReviews(params)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error fetching reviews")
  }
})

export const fetchReviewById = createAsyncThunk("reviews/fetchReviewById", async (id, { rejectWithValue }) => {
  try {
    const response = await reviewsAPI.getReviewById(id)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error fetching review")
  }
})

export const createReview = createAsyncThunk("reviews/createReview", async (documentId, { rejectWithValue }) => {
  try {
    const response = await reviewsAPI.createReview(documentId)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error creating review")
  }
})

export const addFeedback = createAsyncThunk("reviews/addFeedback", async ({ id, feedback }, { rejectWithValue }) => {
  try {
    const response = await reviewsAPI.addFeedback(id, feedback)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error adding feedback")
  }
})

const initialState = {
  reviews: [],
  currentReview: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  filters: {
    status: "",
    search: "",
  },
  isLoading: false,
  error: null,
}

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentReview: (state) => {
      state.currentReview = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false
        state.reviews = action.payload.reviews
        state.pagination = action.payload.pagination
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Fetch review by ID
      .addCase(fetchReviewById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentReview = action.payload.review
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create review
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload.review)
      })

      // Add feedback
      .addCase(addFeedback.fulfilled, (state, action) => {
        const index = state.reviews.findIndex((review) => review._id === action.payload.review._id)
        if (index !== -1) {
          state.reviews[index] = action.payload.review
        }
        if (state.currentReview?._id === action.payload.review._id) {
          state.currentReview = action.payload.review
        }
      })
  },
})

export const { setFilters, clearCurrentReview, clearError } = reviewsSlice.actions
export default reviewsSlice.reducer
