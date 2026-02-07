/**
 * Converts a domain name to a valid, consistent filename.
 * "www.aasanetidende.no" -> "www-aasanetidende-no"
 */
export function sanitizeDomainName(domain: string): string {
	return domain
		.toLowerCase()
		.replace(/\./g, "-")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-") // Collapse multiple hyphens
		.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}
