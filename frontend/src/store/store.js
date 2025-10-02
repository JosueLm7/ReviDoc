import { configureStore } from "@reduxjs/toolkit"
import documentsReducer from "./slices/documentsSlice"
import reviewsReducer from "./slices/reviewsSlice"
import statisticsReducer from "./slices/statisticsSlice"
import uiReducer from "./slices/uiSlice"
import { ReturnType } from "react"

export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    reviews: reviewsReducer,
    statistics: statisticsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
})

