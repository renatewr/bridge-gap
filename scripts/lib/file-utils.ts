/**
 * Converts a domain name to a valid, consistent filename.
 * "www.aasanetidende.no" -> "www.aasanetidende.no"
 * "www-aasanetidende-no" -> "www.aasanetidende.no"
 */
export function sanitizeDomainName(domain: string): string {
	return domain
		.toLowerCase()
		.replace(/-/g, ".") // Convert hyphens to dots
		.replace(/[^a-z0-9.]/g, "") // Remove invalid characters, keep dots
		.replace(/\.+/g, ".") // Collapse multiple dots
		.replace(/^\.|\.$/g, ""); // Remove leading/trailing dots
}
