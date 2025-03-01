"use server";

import { replaceWithUnicodeLookalikes } from "@/utils/unicode";
import AdmZip from "adm-zip";
import { Document, Packer, Paragraph, TextRun } from "docx";
import xml2js, { parseString } from "xml2js";

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

		const result: any = await new Promise((resolve, reject) => {
			parseString(documentContent, (err, result) => {
				if (err) reject(err);
				else resolve(result);
			});
		});

		const processTextNodes = (obj: any): any => {
			if (!obj) return obj;

			if (obj["w:t"]) {
				const textContent = obj["w:t"];

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

				if (textContent && typeof textContent === "object" && textContent._) {
					return {
						...obj,
						"w:t": {
							...textContent,
							_: replaceWithUnicodeLookalikes(textContent._),
						},
					};
				}

				if (typeof textContent === "string") {
					return {
						...obj,
						"w:t": replaceWithUnicodeLookalikes(textContent),
					};
				}
			}

			if (Array.isArray(obj)) {
				return obj.map((item) => processTextNodes(item));
			}

			if (typeof obj === "object") {
				const newObj: any = {};
				for (const [key, value] of Object.entries(obj)) {
					newObj[key] = processTextNodes(value);
				}
				return newObj;
			}

			return obj;
		};

		if (result["w:document"]?.["w:body"]) {
			result["w:document"]["w:body"] = processTextNodes(result["w:document"]["w:body"]);
		}

		const builder = new xml2js.Builder();
		const newXml = builder.buildObject(result);

		const newZip = new AdmZip(buffer);
		newZip.updateFile("word/document.xml", Buffer.from(newXml));

		return newZip.toBuffer();
	} catch (error) {
		throw error;
	}
}
