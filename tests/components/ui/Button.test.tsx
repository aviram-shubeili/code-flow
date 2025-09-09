/**
 * Button Component Test
 *
 * This test demonstrates:
 * - Component rendering with different props
 * - Event handling testing
 * - Accessibility testing
 * - Loading state testing
 * - Proper TypeScript usage in tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import Button, { type ButtonProps } from "@/components/ui/Button";

describe("Button", () => {
  const defaultProps: ButtonProps = {
    children: "Test Button",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<Button {...defaultProps} />);

    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-blue-600"); // primary variant default
    expect(button).toHaveClass("h-10"); // medium size default
  });

  it("renders different variants correctly", () => {
    const variants: Array<NonNullable<ButtonProps["variant"]>> = [
      "primary",
      "secondary",
      "outline",
      "ghost",
    ];

    variants.forEach((variant) => {
      const { unmount } = render(
        <Button variant={variant}>Test {variant}</Button>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      unmount();
    });
  });

  it("renders different sizes correctly", () => {
    const sizes: Array<NonNullable<ButtonProps["size"]>> = ["sm", "md", "lg"];

    sizes.forEach((size) => {
      const { unmount } = render(<Button size={size}>Test {size}</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      unmount();
    });
  });

  it("handles click events correctly", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state correctly", () => {
    render(<Button loading>Loading Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(button).toHaveTextContent("⏳Loading...");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies custom className correctly", () => {
    const customClass = "custom-test-class";
    render(<Button className={customClass}>Custom Class Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(customClass);
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});
