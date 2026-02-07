import type { Preview } from "@storybook/web-components-vite";
import { brands } from "./brands";

// Create toolbar items from brands list
const brandItems = brands.map((brand) => {
	// Create a readable title from the brand name
	const title = brand
		.replace(/^www-/, "")
		.replace(/-no$/, " (NO)")
		.replace(/-dk$/, " (DK)")
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return { value: brand, title };
});

// Load CSS for a brand
function loadBrandCSS(brand: string) {
	// Remove existing brand stylesheet
	const existingLink = document.getElementById("brand-theme");
	if (existingLink) {
		existingLink.remove();
	}

	// Add new brand stylesheet
	const link = document.createElement("link");
	link.id = "brand-theme";
	link.rel = "stylesheet";
	link.href = `/css/${brand}.css`;
	document.head.appendChild(link);
}

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: "todo",
		},
	},

	globalTypes: {
		brand: {
			description: "Brand theme",
			toolbar: {
				title: "Brand",
				icon: "globe",
				items: brandItems,
				dynamicTitle: true,
			},
		},
	},

	initialGlobals: {
		brand: brands[0],
	},

	decorators: [
		(story, context) => {
			const brand = context.globals.brand || brands[0];
			loadBrandCSS(brand);
			return story();
		},
	],
};

export default preview;
