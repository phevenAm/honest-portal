import React from "react"
import { render } from "@testing-library/react";
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from "react-router-dom"
import { store } from "../store";


export const StoreAndRouterWrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <Provider store={store}>
    <Router>
      {children}
    </Router>
  </Provider>
)

export const renderWithProviders = (ui: React.ReactElement, options: {}) => render(ui, { wrapper: StoreAndRouterWrapper, ...options })
