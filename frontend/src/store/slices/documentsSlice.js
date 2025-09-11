import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { documentsAPI } from "../../services/api"

// Async thunks
export const fetchDocuments = createAsyncThunk("documents/fetchDocuments", async (params = {}, { rejectWithValue }) => {
  try {
    const response = await documentsAPI.getDocuments(params)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error fetching documents")
  }
})

export const uploadDocument = createAsyncThunk("documents/uploadDocument", async (formData, { rejectWithValue }) => {
  try {
    const response = await documentsAPI.uploadDocument(formData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error uploading document")
  }
})

export const fetchDocumentById = createAsyncThunk("documents/fetchDocumentById", async (id, { rejectWithValue }) => {
  try {
    const response = await documentsAPI.getDocumentById(id)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error fetching document")
  }
})

export const updateDocument = createAsyncThunk(
  "documents/updateDocument",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await documentsAPI.updateDocument(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error updating document")
    }
  },
)

export const deleteDocument = createAsyncThunk("documents/deleteDocument", async (id, { rejectWithValue }) => {
  try {
    await documentsAPI.deleteDocument(id)
    return id
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Error deleting document")
  }
})

const initialState = {
  documents: [],
  currentDocument: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  filters: {
    status: "",
    category: "",
    search: "",
  },
  isLoading: false,
  error: null,
}

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents = action.payload.documents
        state.pagination = action.payload.pagination
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents.unshift(action.payload.document)
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Fetch document by ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentDocument = action.payload.document
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update document
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex((doc) => doc._id === action.payload.document._id)
        if (index !== -1) {
          state.documents[index] = action.payload.document
        }
        if (state.currentDocument?._id === action.payload.document._id) {
          state.currentDocument = action.payload.document
        }
      })

      // Delete document
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((doc) => doc._id !== action.payload)
        if (state.currentDocument?._id === action.payload) {
          state.currentDocument = null
        }
      })
  },
})

export const { setFilters, clearCurrentDocument, clearError } = documentsSlice.actions
export default documentsSlice.reducer
