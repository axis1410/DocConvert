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
	if (typeof text !== "string") {
		return text;
	}

	const result = text
		.split("")
		.map((char) => {
			const lowerChar = char.toLowerCase();
			if (UNICODES[lowerChar as keyof typeof UNICODES]) {
				const replacements = UNICODES[lowerChar as keyof typeof UNICODES];
				const replacement = replacements[Math.floor(Math.random() * replacements.length)];

				return char === lowerChar ? replacement : replacement.toUpperCase();
			}
			return char;
		})
		.join("");

	return result;
}
