import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { documentsAPI, reviewsAPI } from "../../services/api"

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
    console.log("🔵 Iniciando upload en thunk...")
    const response = await documentsAPI.uploadDocument(formData)
    console.log("✅ Upload exitoso en thunk:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ Error completo en uploadDocument thunk:", error)

    let errorMessage = "Error desconocido al subir el documento"

    if (error.response) {
      errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `Error ${error.response.status}: ${error.response.statusText}`
    } else if (error.request) {
      errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión."
    } else {
      errorMessage = error.message || "Error de configuración"
    }

    console.error("📝 Mensaje de error final:", errorMessage)
    return rejectWithValue(errorMessage)
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

export const createReview = createAsyncThunk("documents/createReview", async (documentId, { rejectWithValue }) => {
  try {
    console.log("[v0] Creando review para documento:", documentId)
    const response = await reviewsAPI.createReview(documentId)
    console.log("[v0] Review creada:", response.data)
    return response.data
  } catch (error) {
    console.error("[v0] Error creando review:", error)
    return rejectWithValue(error.response?.data?.message || "Error creating review")
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
        state.error = null
        // ✅ IMPORTANTE: La estructura real de tu backend
        state.documents = action.payload.data?.documents || []
        state.pagination = action.payload.data?.pagination || initialState.pagination
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
        if (action.payload.document) {
          state.documents.unshift(action.payload.document)
        }
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
        state.error = null
        state.currentDocument = action.payload
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update document
      .addCase(updateDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        const index = state.documents.findIndex((doc) => doc.id === action.payload.id)
        if (index !== -1) {
          state.documents[index] = action.payload
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.documents = state.documents.filter((doc) => doc.id !== action.payload)
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create review
      .addCase(createReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        if (state.currentDocument) {
          state.currentDocument.reviews = [...(state.currentDocument.reviews || []), action.payload]
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, clearCurrentDocument, clearError } = documentsSlice.actions
export default documentsSlice.reducer