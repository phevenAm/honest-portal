import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AdminClientsPage from "../AdminClientsPage";
import { store } from "../../../../store";

test("renders AdminClientsPage component", () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <AdminClientsPage />
      </BrowserRouter>
    </Provider>
  );

  expect(
    screen.getByRole("heading", { name: /clients/i })
  ).toBeInTheDocument();
});