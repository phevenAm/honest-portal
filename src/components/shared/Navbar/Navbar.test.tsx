import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderWithProviders } from '../../../__testUtils__/testUtils';
import Navbar from "./Navbar";

const DummyProfile = {
  first_name: "John",
  last_name: "Doe"
}

const renderNavbar = () =>
  renderWithProviders(<Navbar />, {})


vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    isAdmin: false,
    signOut: vi.fn(),
    userProfile: DummyProfile,
    displayName: 'Dummy Username'
  })
}))

describe("Navbar", () => {
  it("renders navigation links for client role", () => {
    renderNavbar();
    const logo = screen.getByTestId('logo-link')
    expect(logo).toBeVisible()

  });
  it.todo("renders navigation links for admin role");
  it.todo("calls signOut when logout is triggered");
  it.todo("toggles dark mode");
});
