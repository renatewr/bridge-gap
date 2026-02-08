import type { Meta, StoryObj } from "@storybook/web-components-vite";

import {
	AllBrands,
	BrandDetail,
	ThemePalette,
	brandNames,
	type AllBrandsProps,
	type BrandDetailProps,
} from "./BrandPalette";

const meta = {
	title: "Design Tokens/Brand Palettes",
	tags: ["autodocs"],
} satisfies Meta;

export default meta;

// Story for viewing all brands in a grid
export const AllBrandsGrid: StoryObj<AllBrandsProps> = {
	render: (args) => AllBrands(args),
	args: {
		filter: "",
		limit: 20,
	},
	argTypes: {
		filter: {
			control: "text",
			description: "Filter brands by name",
		},
		limit: {
			control: { type: "number", min: 0, max: 211 },
			description: "Limit number of brands shown (0 = show all)",
		},
	},
};

// Story for viewing all brands (no limit)
export const AllBrandsFull: StoryObj<AllBrandsProps> = {
	render: (args) => AllBrands(args),
	args: {
		filter: "",
		limit: 0,
	},
};

// Story for viewing a single brand with detailed token info
export const SingleBrand: StoryObj<BrandDetailProps> = {
	render: (args) => BrandDetail(args),
	args: {
		brandName: "www.nettavisen.no",
	},
	argTypes: {
		brandName: {
			control: "select",
			options: brandNames,
			description: "Select a brand to view",
		},
	},
};

// Story for viewing the current theme from the global theme picker
export const CurrentTheme: StoryObj = {
	render: () => ThemePalette(),
};
