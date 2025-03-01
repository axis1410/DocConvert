export const UNICODES = {
	a: ["а"],
	c: ["с"],
	e: ["е"],
	i: ["і"],
	j: ["ј"],
	n: ["n"],
	o: ["о"],
	p: ["р"],
	v: ["ѵ"],
	x: ["x"],
	y: ["у"],
} as const;

export function replaceWithUnicodeLookalikes(text: string): string {
	if (!text) return text;

	return text
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
}
