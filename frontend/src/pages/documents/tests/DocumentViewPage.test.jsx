import { render, screen } from "@testing-library/react";
import DocumentViewPage from "../DocumentViewPage";

test("muestra mensaje de carga", () => {
  render(<DocumentViewPage />);
  expect(screen.getByText(/cargando/i)).toBeInTheDocument();
});