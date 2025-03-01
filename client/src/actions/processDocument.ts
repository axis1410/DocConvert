// app/actions/processDocument.ts
"use server";

import { replaceWithUnicodeLookalikes } from "@/utils/unicode";
import AdmZip from "adm-zip";
import { Document, Packer, Paragraph, TextRun } from "docx";
import xml2js, { parseString } from "xml2js";

// Helper type for text processing
type TextNode = {
	_: string;
	$: { [key: string]: string };
};

export async function processDocument(formData: FormData) {
	try {
		const file = formData.get("document") as File;
		if (!file) {
			throw new Error("No file provided");
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const zip = new AdmZip(buffer);

		const documentXml = zip.getEntry("word/document.xml");
		if (!documentXml) {
			throw new Error("Invalid DOCX file");
		}

		const documentContent = documentXml.getData().toString();

		// Parse the XML
		const result: any = await new Promise((resolve, reject) => {
			parseString(documentContent, (err, result) => {
				if (err) reject(err);
				else resolve(result);
			});
		});

		const processTextNodes = (obj: any): any => {
			if (!obj) return obj;

			// Process text (w:t)
			if (obj["w:t"]) {
				const textContent = obj["w:t"];

				// Handle array of strings
				if (Array.isArray(textContent)) {
					return {
						...obj,
						"w:t": textContent.map((item) => {
							if (typeof item === "string") {
								return replaceWithUnicodeLookalikes(item);
							}
							if (item && typeof item === "object" && item._) {
								return {
									...item,
									_: replaceWithUnicodeLookalikes(item._),
								};
							}
							return item;
						}),
					};
				}

				// Handle object with _ property
				if (textContent && typeof textContent === "object" && textContent._) {
					return {
						...obj,
						"w:t": {
							...textContent,
							_: replaceWithUnicodeLookalikes(textContent._),
						},
					};
				}

				// Handle direct string
				if (typeof textContent === "string") {
					return {
						...obj,
						"w:t": replaceWithUnicodeLookalikes(textContent),
					};
				}
			}

			// Handle arrays
			if (Array.isArray(obj)) {
				return obj.map((item) => processTextNodes(item));
			}

			// Handle objects
			if (typeof obj === "object") {
				const newObj: any = {};
				for (const [key, value] of Object.entries(obj)) {
					newObj[key] = processTextNodes(value);
				}
				return newObj;
			}

			return obj;
		};

		// Start processing from the document body - corrected path
		if (result["w:document"]?.["w:body"]) {
			console.log("Found document body");
			result["w:document"]["w:body"] = processTextNodes(result["w:document"]["w:body"]);
		}

		// Convert back to XML
		const builder = new xml2js.Builder();
		const newXml = builder.buildObject(result);

		// Create new zip with modified content
		const newZip = new AdmZip(buffer);
		newZip.updateFile("word/document.xml", Buffer.from(newXml));

		return newZip.toBuffer();
	} catch (error) {
		console.error("Error processing document:", error);
		throw error;
	}
}
