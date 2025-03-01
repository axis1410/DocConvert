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
		multiple: true,
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

			// Create output filename
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
		if (isConverting) return;

		setIsConverting(true);

		// Convert files sequentially
		for (let i = 0; i < selectedFiles.length; i++) {
			if (selectedFiles[i].status === "pending" || selectedFiles[i].status === "error") {
				await convertFile(selectedFiles[i], i);
			}
		}

		setIsConverting(false);
	}

	return (
		<div className="max-w-3xl mx-auto">
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-gray-800 mb-4">DOCX Unicode Converter</h1>
				<p className="text-gray-600">Convert multiple documents while preserving all formatting</p>
			</div>

			<div className="bg-white rounded-2xl shadow-xl p-8">
				{/* Dropzone */}
				<div
					{...getRootProps()}
					className={`
                        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                        transition-all duration-200 ease-in-out
                        ${
													isDragActive
														? "border-blue-500 bg-blue-50"
														: "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
												}
                    `}
				>
					<input {...getInputProps()} />
					<div className="space-y-4">
						<div className="flex justify-center">
							<svg
								className="w-12 h-12 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								/>
							</svg>
						</div>
						<div>
							<p className="text-lg text-gray-700">
								{isDragActive ? "Drop your DOCX files here..." : "Drag & drop your DOCX files here"}
							</p>
							<p className="text-sm text-gray-500 mt-2">or click to select files</p>
						</div>
					</div>
				</div>

				{/* File List */}
				{selectedFiles.length > 0 && (
					<div className="mt-6 space-y-3">
						{selectedFiles.map((fileStatus, index) => (
							<div
								key={`${fileStatus.file.name}-${index}`}
								className="p-4 bg-blue-200 rounded-lg flex items-center justify-between"
							>
								<div className="flex s-center flex-1 mr-4">
									<svg
										className="w-5 h-5 text-gray-500 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									<span className="text-sm font-medium text-gray-700 truncate">
										{fileStatus.file.name}
									</span>
								</div>

								{/* Status Indicator */}
								<div className="flex items-center">
									{fileStatus.status === "converting" && (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />
									)}
									{fileStatus.status === "completed" && (
										<svg
											className="w-5 h-5 text-green-500 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									)}
									{fileStatus.status === "error" && (
										<svg
											className="w-5 h-5 text-red-500 mr-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									)}

									{/* Remove Button */}
									<button
										onClick={() => handleRemoveFile(index)}
										className="text-gray-500 hover:text-red-500 transition-colors"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Convert All Button */}
				<button
					onClick={handleConvertAll}
					disabled={isConverting || selectedFiles.length === 0}
					className={`
                        mt-6 w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                        ${
													isConverting || selectedFiles.length === 0
														? "bg-gray-300 cursor-not-allowed text-gray-500"
														: "bg-blue-500 hover:bg-blue-600 text-white"
												}
                    `}
				>
					{isConverting ? (
						<div className="flex items-center justify-center">
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
							Converting Files...
						</div>
					) : (
						`Convert ${selectedFiles.length} File${selectedFiles.length !== 1 ? "s" : ""}`
					)}
				</button>
			</div>

			<div className="mt-8 text-center text-sm text-gray-500">
				<p>Supports multiple .docx files • Preserves all formatting</p>
			</div>
		</div>
	);
}
