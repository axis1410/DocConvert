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

		// Get document.xml content
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

		// Process text while preserving structure
		const processTextNodes = (obj: any): any => {
			if (!obj) return obj;

			// If it's a text node
			if (obj._ !== undefined) {
				return {
					...obj,
					_: replaceWithUnicodeLookalikes(obj._),
				};
			}

			// If it's an array
			if (Array.isArray(obj)) {
				return obj.map((item) => processTextNodes(item));
			}

			// If it's an object
			if (typeof obj === "object") {
				const newObj: any = {};
				for (const [key, value] of Object.entries(obj)) {
					newObj[key] = processTextNodes(value);
				}
				return newObj;
			}

			// If it's a string (text content)
			if (typeof obj === "string") {
				return replaceWithUnicodeLookalikes(obj);
			}

			return obj;
		};

		// Process the document content
		if (result.document?.body) {
			result.document.body = processTextNodes(result.document.body);
		}

		// Convert back to XML
		const builder = new xml2js.Builder();
		const newXml = builder.buildObject(result);

		// Create new zip with modified content
		const newZip = new AdmZip(buffer);
		newZip.updateFile("word/document.xml", Buffer.from(newXml));

		// Get the modified document as buffer
		return newZip.toBuffer();
	} catch (error) {
		console.error("Error processing document:", error);
		throw new Error(error instanceof Error ? error.message : "Unknown error occurred");
	}
}
