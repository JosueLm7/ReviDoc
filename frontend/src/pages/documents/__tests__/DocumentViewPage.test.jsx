import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import DocumentViewPage from "../DocumentViewPage"
import { render as customRender } from "../../../utils/test-utils"

// Mock de useParams y useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "123" }),
  useNavigate: () => jest.fn(),
}))

// Mock de Redux
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
}))

import { useSelector } from "react-redux"

describe("DocumentViewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should show loading state", () => {
    useSelector.mockImplementation(selector => selector({
      documents: {
        currentDocument: null,
        isLoading: true,
        error: null
      }
    }))

    customRender(<DocumentViewPage />)

    expect(screen.getByText(/cargando documento/i)).toBeInTheDocument()
  })

  it("should show error state", () => {
    useSelector.mockImplementation(selector => selector({
      documents: {
        currentDocument: null,
        isLoading: false,
        error: "Error al cargar el documento"
      }
    }))

    customRender(<DocumentViewPage />)

    expect(screen.getByText(/error al cargar el documento/i)).toBeInTheDocument()
  })

  it("should show document when loaded", () => {
    const mockDocument = {
      id: "123",
      title: "Test Document",
      content: "This is test content",
      fileType: "pdf",
      createdAt: "2023-01-01"
    }

    useSelector.mockImplementation(selector => selector({
      documents: {
        currentDocument: mockDocument,
        isLoading: false,
        error: null
      }
    }))

    customRender(<DocumentViewPage />)

    expect(screen.getByText("Test Document")).toBeInTheDocument()
    expect(screen.getByText("This is test content")).toBeInTheDocument()
  })
})