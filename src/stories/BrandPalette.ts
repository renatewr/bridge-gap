import { html, nothing } from "lit";

import "./BrandPalette.css";

// Import the brands data
import brandsData from "../../dist/brands.json";

interface TokenData {
	$type: string;
	$value: string;
	$description?: string;
	$usage?: string[];
	$pairs?: string;
	$a11y?: string;
}

type BrandTokens = Record<string, TokenData>;
type BrandsData = Record<string, BrandTokens>;

const brands = brandsData as BrandsData;

/**
 * Renders a color swatch without text (no accessibility issues)
 */
function renderSwatch(color: string, label: string, large = false) {
	return html`
		<div
			class="color-swatch ${large ? "color-swatch--large" : ""}"
			style="background-color: ${color}"
			title="${label}: ${color}"
		></div>
	`;
}

export interface BrandCardProps {
	brandName: string;
	tokens: BrandTokens;
}

/**
 * Renders a compact brand card showing the color palette (similar to Figma plugin)
 */
export const BrandCard = ({ brandName, tokens }: BrandCardProps) => {
	const primaryScale = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];

	return html`
		<div class="brand-card">
			<div class="brand-card__header">
				<h2 class="brand-card__name">${brandName}</h2>
			</div>
			<div class="brand-card__content">
				<!-- Primary Scale Section -->
				<div class="section">
					<h3 class="section__title">primary-100 to primary-900</h3>
					<div class="scale-swatches">
						${primaryScale.map((step) => {
							const token = tokens[`primary-${step}`];
							return token
								? html`<div class="scale-swatches__swatch" style="background-color: ${token.$value}" title="primary-${step}: ${token.$value}"></div>`
								: nothing;
						})}
					</div>
					<div class="scale-labels">
						${primaryScale.map((step) => html`<span class="scale-labels__label">${step}</span>`)}
					</div>
				</div>

				<!-- Semantic Tokens Section -->
				<div class="section">
					<h3 class="section__title">Semantic Tokens</h3>
					<div class="semantic-tokens">
						<div class="semantic-token">
							<div
								class="semantic-token__swatch"
								style="background-color: ${tokens["primary-surface"]?.$value}"
							>
								<span class="semantic-token__overlay" style="color: ${tokens["primary-on-surface"]?.$value}">AA</span>
							</div>
							<div class="semantic-token__info">
								<span class="semantic-token__name">primary-surface</span>
								<span class="semantic-token__desc">${tokens["primary-surface"]?.$description || "Brand color applied to surfaces"}</span>
							</div>
						</div>
						<div class="semantic-token">
							<div
								class="semantic-token__swatch"
								style="background-color: ${tokens["primary-on-surface"]?.$value}"
							></div>
							<div class="semantic-token__info">
								<span class="semantic-token__name">primary-on-surface</span>
								<span class="semantic-token__desc">${tokens["primary-on-surface"]?.$description || "Text or icons on top of primary-surface"}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Accessible Pairs Section -->
				<div class="section">
					<h3 class="section__title">Accessible Pairs (AAA)</h3>
					<div class="accessible-pairs">
						<div class="accessible-pair">
							<div
								class="accessible-pair__swatch"
								style="background-color: ${tokens["primary-100"]?.$value}"
							>
								<span class="accessible-pair__overlay" style="color: ${tokens["primary-800"]?.$value}">AAA</span>
							</div>
							<div class="accessible-pair__info">
								<span class="accessible-pair__name">100 bg / 800 text</span>
								<span class="accessible-pair__desc">Light background</span>
							</div>
						</div>
						<div class="accessible-pair">
							<div
								class="accessible-pair__swatch"
								style="background-color: ${tokens["primary-200"]?.$value}"
							>
								<span class="accessible-pair__overlay" style="color: ${tokens["primary-900"]?.$value}">AAA</span>
							</div>
							<div class="accessible-pair__info">
								<span class="accessible-pair__name">200 bg / 900 text</span>
								<span class="accessible-pair__desc">Light background</span>
							</div>
						</div>
						<div class="accessible-pair">
							<div
								class="accessible-pair__swatch"
								style="background-color: ${tokens["primary-800"]?.$value}"
							>
								<span class="accessible-pair__overlay" style="color: ${tokens["primary-100"]?.$value}">AAA</span>
							</div>
							<div class="accessible-pair__info">
								<span class="accessible-pair__name">800 bg / 100 text</span>
								<span class="accessible-pair__desc">Dark background</span>
							</div>
						</div>
						<div class="accessible-pair">
							<div
								class="accessible-pair__swatch"
								style="background-color: ${tokens["primary-900"]?.$value}"
							>
								<span class="accessible-pair__overlay" style="color: ${tokens["primary-200"]?.$value}">AAA</span>
							</div>
							<div class="accessible-pair__info">
								<span class="accessible-pair__name">900 bg / 200 text</span>
								<span class="accessible-pair__desc">Dark background</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Gradient Section -->
				${tokens["primary-gradient"] ? html`
					<div class="section">
						<h3 class="section__title">Gradient</h3>
						<div class="gradient-swatch" style="background: ${tokens["primary-gradient"].$value}"></div>
					</div>
				` : nothing}
			</div>
		</div>
	`;
};

export interface BrandDetailProps {
	brandName: string;
}

/**
 * Renders a detailed view of a single brand's tokens
 */
export const BrandDetail = ({ brandName }: BrandDetailProps) => {
	const tokens = brands[brandName];
	if (!tokens) {
		return html`<div class="brand-palette">Brand not found: ${brandName}</div>`;
	}

	const primaryScale = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];

	return html`
		<div class="brand-palette brand-detail">
			<div class="brand-palette__header">
				<h1 class="brand-palette__title">${brandName}</h1>
				<p class="brand-palette__subtitle">Design tokens with accessibility information</p>
			</div>

			<div class="brand-card">
				<div class="brand-card__header">
					<h2 class="brand-card__name">Primary Scale</h2>
				</div>
				<div class="brand-card__colors">
					<div class="color-row">
						${primaryScale.map((step) => {
							const token = tokens[`primary-${step}`];
							return token
								? renderSwatch(token.$value, step)
								: nothing;
						})}
					</div>
				</div>

				<div class="token-info">
					${primaryScale.map((step) => {
						const token = tokens[`primary-${step}`];
						if (!token) return nothing;
						return html`
							<div class="token-info__item">
								<span class="token-info__label">primary-${step}</span>
								<span class="token-info__value">
									${token.$description}
									${token.$a11y ? html`<span class="a11y-badge">${token.$a11y}</span>` : nothing}
								</span>
							</div>
						`;
					})}
				</div>
			</div>

			<div class="brand-card" style="margin-top: 24px">
				<div class="brand-card__header">
					<h2 class="brand-card__name">Semantic Tokens</h2>
				</div>
				<div class="semantic-row">
					<div
						class="semantic-swatch"
						style="background-color: ${tokens["primary-surface"]?.$value}; color: ${tokens["primary-on-surface"]?.$value}"
					>
						<span class="semantic-swatch__name">primary-surface</span>
						<span class="semantic-swatch__value">${tokens["primary-surface"]?.$value}</span>
					</div>
					<div
						class="semantic-swatch"
						style="background-color: ${tokens["primary-on-surface"]?.$value}; color: ${tokens["primary-surface"]?.$value}"
					>
						<span class="semantic-swatch__name">primary-on-surface</span>
						<span class="semantic-swatch__value">${tokens["primary-on-surface"]?.$value}</span>
					</div>
				</div>
				<div class="token-info">
					<div class="token-info__item">
						<span class="token-info__label">surface</span>
						<span class="token-info__value">${tokens["primary-surface"]?.$description}</span>
					</div>
					<div class="token-info__item">
						<span class="token-info__label">on-surface</span>
						<span class="token-info__value">
							${tokens["primary-on-surface"]?.$description}
							${tokens["primary-on-surface"]?.$a11y ? html`<span class="a11y-badge">${tokens["primary-on-surface"].$a11y}</span>` : nothing}
						</span>
					</div>
				</div>
			</div>



			<div class="brand-card" style="margin-top: 24px">
				<div class="brand-card__header">
					<h2 class="brand-card__name">Base Colors</h2>
				</div>
				<div class="color-row">
					${renderSwatch(tokens["white"]?.$value || "#fff", "white", true)}
					${renderSwatch(tokens["black"]?.$value || "#000", "black", true)}
				</div>
			</div>
		</div>
	`;
};

/**
 * Renders the palette using CSS variables from the globally selected theme.
 * Uses the theme selected in the Storybook toolbar.
 */
export const ThemePalette = () => {
	const primaryScale = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];

	return html`
		<div class="brand-palette brand-detail">
			<div class="brand-palette__header">
				<h1 class="brand-palette__title">Current Theme</h1>
				<p class="brand-palette__subtitle">Using CSS variables from the selected brand theme</p>
			</div>

			<div class="brand-card">
				<div class="brand-card__content">
					<!-- Primary Scale Section -->
					<div class="section">
						<h3 class="section__title">primary-100 to primary-900</h3>
						<div class="scale-swatches">
							${primaryScale.map((step) => html`
								<div class="scale-swatches__swatch" style="background-color: var(--primary-${step})"></div>
							`)}
						</div>
						<div class="scale-labels">
							${primaryScale.map((step) => html`<span class="scale-labels__label">${step}</span>`)}
						</div>
					</div>

					<!-- Semantic Tokens Section -->
					<div class="section">
						<h3 class="section__title">Semantic Tokens</h3>
						<div class="semantic-tokens">
							<div class="semantic-token">
								<div
									class="semantic-token__swatch"
									style="background-color: var(--primary-surface)"
								>
									<span class="semantic-token__overlay" style="color: var(--primary-on-surface)">AA</span>
								</div>
								<div class="semantic-token__info">
									<span class="semantic-token__name">primary-surface</span>
									<span class="semantic-token__desc">Brand color applied to surfaces</span>
								</div>
							</div>
							<div class="semantic-token">
								<div
									class="semantic-token__swatch"
									style="background-color: var(--primary-on-surface)"
								></div>
								<div class="semantic-token__info">
									<span class="semantic-token__name">primary-on-surface</span>
									<span class="semantic-token__desc">Text or icons on top of primary-surface</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Accessible Pairs Section -->
					<div class="section">
						<h3 class="section__title">Accessible Pairs (AAA)</h3>
						<div class="accessible-pairs">
							<div class="accessible-pair">
								<div
									class="accessible-pair__swatch"
									style="background-color: var(--primary-100)"
								>
									<span class="accessible-pair__overlay" style="color: var(--primary-800)">AAA</span>
								</div>
								<div class="accessible-pair__info">
									<span class="accessible-pair__name">100 bg / 800 text</span>
									<span class="accessible-pair__desc">Light background</span>
								</div>
							</div>
							<div class="accessible-pair">
								<div
									class="accessible-pair__swatch"
									style="background-color: var(--primary-200)"
								>
									<span class="accessible-pair__overlay" style="color: var(--primary-900)">AAA</span>
								</div>
								<div class="accessible-pair__info">
									<span class="accessible-pair__name">200 bg / 900 text</span>
									<span class="accessible-pair__desc">Light background</span>
								</div>
							</div>
							<div class="accessible-pair">
								<div
									class="accessible-pair__swatch"
									style="background-color: var(--primary-800)"
								>
									<span class="accessible-pair__overlay" style="color: var(--primary-100)">AAA</span>
								</div>
								<div class="accessible-pair__info">
									<span class="accessible-pair__name">800 bg / 100 text</span>
									<span class="accessible-pair__desc">Dark background</span>
								</div>
							</div>
							<div class="accessible-pair">
								<div
									class="accessible-pair__swatch"
									style="background-color: var(--primary-900)"
								>
									<span class="accessible-pair__overlay" style="color: var(--primary-200)">AAA</span>
								</div>
								<div class="accessible-pair__info">
									<span class="accessible-pair__name">900 bg / 200 text</span>
									<span class="accessible-pair__desc">Dark background</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Gradient Section -->
					<div class="section">
						<h3 class="section__title">Gradient</h3>
						<div class="gradient-swatch" style="background: var(--primary-gradient)"></div>
					</div>
				</div>
			</div>
		</div>
	`;
};

export interface AllBrandsProps {
	filter?: string;
	limit?: number;
}

// Token scale descriptions for the legend
const scaleDescriptions: Record<string, string> = {
	"100": "Lightest shade, AAA compatible with 800",
	"200": "Very light shade, AAA compatible with 900",
	"300": "Light shade",
	"400": "Borders and separators",
	"500": "Primary brand color",
	"600": "Medium dark shade",
	"700": "Dark shade",
	"800": "Very dark shade, AAA compatible with 100",
	"900": "Darkest shade, AAA compatible with 200",
	"surface": "Brand color applied to surfaces",
	"on-surface": "Text or icons on top of primary-surface",
};

/**
 * Renders the legend showing the scale with descriptions
 */
const ScaleLegend = () => {
	const primaryScale = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
	const semanticTokens = ["surface", "on-surface"];

	return html`
		<div class="scale-legend">
			<h2 class="scale-legend__title">Color Scale Reference</h2>
			<div class="scale-legend__content">
				<div class="scale-legend__palette">
					${primaryScale.map((step) => html`
						<div class="scale-legend__swatch" style="background-color: var(--primary-${step})"></div>
					`)}
				</div>
				<div class="scale-legend__items">
					${primaryScale.map((step) => html`
						<div class="scale-legend__row">
							<span class="scale-legend__step">--primary-${step}</span>
							<span class="scale-legend__description">${scaleDescriptions[step]}</span>
						</div>
					`)}
				</div>
			</div>
			<div class="scale-legend__semantic">
				<h3 class="scale-legend__subtitle">Semantic Tokens</h3>
				<div class="scale-legend__content">
					<div class="scale-legend__palette">
						${semanticTokens.map((token) => html`
							<div class="scale-legend__swatch" style="background-color: var(--primary-${token})"></div>
						`)}
					</div>
					<div class="scale-legend__items">
						${semanticTokens.map((token) => html`
							<div class="scale-legend__row">
								<span class="scale-legend__step">--primary-${token}</span>
								<span class="scale-legend__description">${scaleDescriptions[token]}</span>
							</div>
						`)}
					</div>
				</div>
			</div>
		</div>
	`;
};

/**
 * Renders the scale documentation showing category labels, step numbers, and swatches
 * Inspired by the color scale documentation pattern
 */
const ScaleDocumentation = () => {
	const primaryScale = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];

	// Category spans for grouping scale steps
	const categories = [
		{ label: "Backgrounds", steps: ["100", "200"] },
		{ label: "Interactive components", steps: ["300", "400", "500"] },
		{ label: "Solid colors", steps: ["600", "700"] },
		{ label: "Accessible text", steps: ["800", "900"] },
	];

	return html`
		<div class="scale-doc">
			<h2 class="scale-doc__title">Primary Color Scale</h2>
			<div class="scale-doc__categories">
				${categories.map((cat) => html`
					<div class="scale-doc__category" style="flex: ${cat.steps.length}">
						<span class="scale-doc__category-label">${cat.label}</span>
					</div>
				`)}
			</div>
			<div class="scale-doc__brackets">
				${categories.map((cat) => html`
					<div class="scale-doc__bracket" style="flex: ${cat.steps.length}">
						<div class="scale-doc__bracket-line"></div>
					</div>
				`)}
			</div>
			<div class="scale-doc__steps">
				${primaryScale.map((step) => html`
					<div class="scale-doc__step">${step}</div>
				`)}
			</div>
			<div class="scale-doc__swatches">
				${primaryScale.map((step) => html`
					<div class="scale-doc__swatch" style="background-color: var(--primary-${step})"></div>
				`)}
			</div>
			<div class="scale-doc__semantic">
				<div class="scale-doc__semantic-item">
					<div class="scale-doc__semantic-swatch" style="background-color: var(--primary-surface)">
						<span style="color: var(--primary-on-surface)">AA</span>
					</div>
					<span class="scale-doc__semantic-label">surface / on-surface</span>
				</div>
				<div class="scale-doc__semantic-item">
					<div class="scale-doc__semantic-swatch" style="background-color: var(--primary-100)">
						<span style="color: var(--primary-800)">AAA</span>
					</div>
					<span class="scale-doc__semantic-label">100 / 800 pairing</span>
				</div>
				<div class="scale-doc__semantic-item">
					<div class="scale-doc__semantic-swatch" style="background-color: var(--primary-200)">
						<span style="color: var(--primary-900)">AAA</span>
					</div>
					<span class="scale-doc__semantic-label">200 / 900 pairing</span>
				</div>
			</div>
		</div>
	`;
};

/**
 * Renders a grid of all brand palettes
 */
export const AllBrands = ({ filter = "", limit = 0 }: AllBrandsProps) => {
	let brandNames = Object.keys(brands);

	// Filter brands if search term provided
	if (filter) {
		const lowerFilter = filter.toLowerCase();
		brandNames = brandNames.filter((name) =>
			name.toLowerCase().includes(lowerFilter),
		);
	}

	// Limit results if specified
	if (limit > 0) {
		brandNames = brandNames.slice(0, limit);
	}

	return html`
		<div class="brand-palette">
			<div class="brand-palette__header">
				<h1 class="brand-palette__title">Brand Color Palettes</h1>
				<p class="brand-palette__subtitle">
					Showing ${brandNames.length} of ${Object.keys(brands).length} brands
					${filter ? html` matching "${filter}"` : nothing}
				</p>
			</div>
			${ScaleDocumentation()}
			${ScaleLegend()}
			<div class="brand-palette__grid">
				${brandNames.map((brandName) =>
					BrandCard({ brandName, tokens: brands[brandName] }),
				)}
			</div>
		</div>
	`;
};

// Export brands list for stories
export const brandNames = Object.keys(brands);
