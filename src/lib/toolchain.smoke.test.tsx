import { render, screen } from "@testing-library/react";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

function Greeting({ name }: { name: string }): React.JSX.Element {
	return <p>Hello, {name}</p>;
}

describe("testing toolchain", () => {
	it("renders a component and matches jest-dom matchers", () => {
		render(<Greeting name="Origin" />);
		expect(screen.getByText("Hello, Origin")).toBeInTheDocument();
	});

	it("runs fast-check property assertions", () => {
		fc.assert(
			fc.property(fc.integer(), fc.integer(), (a, b) => {
				expect(a + b).toBe(b + a);
			}),
			{ numRuns: 100 },
		);
	});
});
