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
 * Renders a compact brand card showing the color palette
 */
export const BrandCard = ({ brandName, tokens }: BrandCardProps) => {
	const primaryScale = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];

	return html`
		<div class="brand-card">
			<div class="brand-card__header">
				<h2 class="brand-card__name">${brandName}</h2>
			</div>
			<div class="brand-card__colors">
				<div class="color-scale">
					${primaryScale.map((step) => {
						const token = tokens[`primary-${step}`];
						return token
							? html`
								<div class="color-scale__row">
									<div class="color-scale__swatch" style="background-color: ${token.$value}" title="${token.$value}"></div>
									<span class="color-scale__name">primary-${step}</span>
								</div>
							`
							: nothing;
					})}
				</div>
				<div class="semantic-row">
					<div
						class="semantic-swatch"
						style="background-color: ${tokens["primary-surface"]?.$value}; color: ${tokens["primary-onSurface"]?.$value}"
					>
						<span class="semantic-swatch__name">primary</span>
					</div>
					<div
						class="semantic-swatch"
						style="background-color: ${tokens["primary-100"]?.$value}; color: ${tokens["primary-800"]?.$value}"
					>
						<span class="semantic-swatch__name">100/800</span>
					</div>
					<div
						class="semantic-swatch"
						style="background-color: ${tokens["primary-200"]?.$value}; color: ${tokens["primary-900"]?.$value}"
					>
						<span class="semantic-swatch__name">200/900</span>
					</div>
				</div>
				${tokens["primary-gradient"] ? html`
					<div class="gradient-row" style="background: ${tokens["primary-gradient"].$value}"></div>
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
						style="background-color: ${tokens["primary-surface"]?.$value}; color: ${tokens["primary-onSurface"]?.$value}"
					>
						<span class="semantic-swatch__name">primary-surface</span>
						<span class="semantic-swatch__value">${tokens["primary-surface"]?.$value}</span>
					</div>
					<div
						class="semantic-swatch"
						style="background-color: ${tokens["primary-onSurface"]?.$value}; color: ${tokens["primary-surface"]?.$value}"
					>
						<span class="semantic-swatch__name">primary-onSurface</span>
						<span class="semantic-swatch__value">${tokens["primary-onSurface"]?.$value}</span>
					</div>
				</div>
				<div class="token-info">
					<div class="token-info__item">
						<span class="token-info__label">surface</span>
						<span class="token-info__value">${tokens["primary-surface"]?.$description}</span>
					</div>
					<div class="token-info__item">
						<span class="token-info__label">onSurface</span>
						<span class="token-info__value">
							${tokens["primary-onSurface"]?.$description}
							${tokens["primary-onSurface"]?.$a11y ? html`<span class="a11y-badge">${tokens["primary-onSurface"].$a11y}</span>` : nothing}
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

export interface AllBrandsProps {
	filter?: string;
	limit?: number;
}

// Token scale descriptions for the legend
const scaleDescriptions: Record<string, string> = {
	"100": "Lightest shade, AAA compatible with 800",
	"200": "Very light shade",
	"300": "Light shade",
	"400": "Borders and separators",
	"500": "Primary brand color",
	"600": "Medium dark shade",
	"700": "Dark shade",
	"800": "Very dark shade, AAA compatible with 100",
	"900": "Darkest shade",
	"surface": "Brand color applied to surfaces",
	"onSurface": "Text or icons on top of primary-surface",
};

/**
 * Renders the legend showing the scale with descriptions
 */
const ScaleLegend = () => {
	const primaryScale = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
	const semanticTokens = ["surface", "onSurface"];

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
