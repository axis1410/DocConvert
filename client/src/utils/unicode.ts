export const UNICODES = {
	a: ["а"],
	c: ["с"],
	e: ["е"],
	i: ["і"],
	j: ["ј"],
	o: ["о"],
	p: ["р"],
	v: ["ѵ"],
	x: ["х"],
	y: ["у"],
} as const;

export function replaceWithUnicodeLookalikes(text: string): string {
	console.log("=== Starting text replacement ===");
	console.log("Input:", text, "Type:", typeof text);

	// Return early if not a string
	if (typeof text !== "string") {
		console.log("Not a string, returning original");
		return text;
	}

	const result = text
		.split("")
		.map((char) => {
			const lowerChar = char.toLowerCase();
			if (UNICODES[lowerChar as keyof typeof UNICODES]) {
				const replacements = UNICODES[lowerChar as keyof typeof UNICODES];
				const replacement = replacements[Math.floor(Math.random() * replacements.length)];
				console.log(`Converting '${char}' to '${replacement}'`);
				return char === lowerChar ? replacement : replacement.toUpperCase();
			}
			return char;
		})
		.join("");

	console.log("=== End text replacement ===");
	console.log("Output:", result);
	return result;
}
