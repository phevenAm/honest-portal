import type { AxeMatchers } from "jest-axe";
import "vitest";

declare module "vitest" {
  interface Assertion<R = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
