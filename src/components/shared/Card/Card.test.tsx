import { describe, it, expect } from "vitest";
import { axe } from "jest-axe";
import { render } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it.todo("renders children");
  it.todo("applies correct variant styles");

  it("should have no accessibility issues", async () => {
    const { container } = render(
      <Card>
        <img src="photo.jpg" alt="i am alt text" />
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
