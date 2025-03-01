"use client";

import { processDocument } from "@/actions/processDocument";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileStatus {
	file: File;
	status: "pending" | "converting" | "completed" | "error";
	error?: string;
}

export default function ConvertDocument() {
	const [selectedFiles, setSelectedFiles] = useState<FileStatus[]>([]);
	const [isConverting, setIsConverting] = useState(false);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const newFiles = acceptedFiles.map((file) => ({
			file,
			status: "pending" as const,
		}));
		setSelectedFiles((prev) => [...prev, ...newFiles]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
		},
		multiple: false,
		maxFiles: 1,
	});

	const handleRemoveFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	async function convertFile(fileStatus: FileStatus, index: number) {
		try {
			setSelectedFiles((prev) =>
				prev.map((item, i) => (i === index ? { ...item, status: "converting" } : item))
			);

			const formData = new FormData();
			formData.append("document", fileStatus.file);

			const result = await processDocument(formData);

			const blob = new Blob([result], {
				type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			});

			const originalName = fileStatus.file.name;
			const nameWithoutExt = originalName.replace(".docx", "");
			const outputFileName = `${nameWithoutExt}-converted.docx`;

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = outputFileName;
			a.click();
			window.URL.revokeObjectURL(url);

			setSelectedFiles((prev) =>
				prev.map((item, i) => (i === index ? { ...item, status: "completed" } : item))
			);
		} catch (error) {
			setSelectedFiles((prev) =>
				prev.map((item, i) =>
					i === index ? { ...item, status: "error", error: "Conversion failed" } : item
				)
			);
		}
	}

	async function handleConvertAll() {
		if (isConverting || selectedFiles.length === 0) return;
		setIsConverting(true);

		try {
			const fileStatus = selectedFiles[0];
			await convertFile(fileStatus, 0);
		} catch (error) {
			console.error("Conversion failed:", error);
		} finally {
			setIsConverting(false);
		}
	}

	return (
		<div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-white">Document Converter</h1>
				<p className="text-slate-300">Convert your documents to different formats easily.</p>
			</div>

			<div className="space-y-4">
				<div className="bg-white/5 rounded-lg p-4 border border-white/10">
					<div
						{...getRootProps()}
						className="text-center p-6 cursor-pointer rounded-lg border-2 border-dashed border-slate-500 hover:border-slate-400 transition-colors"
					>
						<input {...getInputProps()} />
						<p className="text-slate-300">Drag and drop your files here or click to browse</p>
					</div>
				</div>

				<div className="flex gap-4">
					<select className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-2 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
						<option value="">Select output format</option>
						<option value="pdf">PDF</option>
						<option value="docx">DOCX</option>
						<option value="txt">TXT</option>
					</select>

					<button
						onClick={handleConvertAll}
						disabled={isConverting || selectedFiles.length === 0}
						className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg hover:shadow-blue-500/25"
					>
						Convert
					</button>
				</div>
			</div>
		</div>
	);
}
