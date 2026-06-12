import { axe } from "jest-axe";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Button from "./Button";

describe("Button", () => {
  it.todo("renders with label text");
  it.todo("calls onClick handler when clicked");
  it.todo("does not call onClick when disabled");
  it.todo("applies correct variant class");

  it("has no accessibility violations", async () => {
    const { container } = render(<Button variant="primary">Click</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
