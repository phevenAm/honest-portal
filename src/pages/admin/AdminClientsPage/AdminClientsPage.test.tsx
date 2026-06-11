import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { store } from "../../../store";
import AdminClientsPage from "./AdminClientsPage";

test("renders AdminClientsPage component", () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <AdminClientsPage />
      </BrowserRouter>
    </Provider>,
  );

  expect(screen.getByRole("heading", { name: /clients/i })).toBeInTheDocument();
});
