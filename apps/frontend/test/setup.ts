import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// @testing-library/react doesn't auto-register cleanup under Vitest the way
// it does under Jest — do it explicitly so each test starts with an empty DOM.
afterEach(() => {
  cleanup();
});
