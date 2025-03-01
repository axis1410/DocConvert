"use client";

import { processDocument } from "@/actions/processDocument";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ConvertDocument() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length > 0) {
			setSelectedFile(acceptedFiles[0]);
			setError(null);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
		},
		multiple: false,
	});

	async function handleConvert() {
		if (!selectedFile) {
			setError("Please select a document first");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const formData = new FormData();
			formData.append("document", selectedFile);

			const result = await processDocument(formData);

			const blob = new Blob([result], {
				type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			});

			// Create output filename
			const originalName = selectedFile.name;
			const nameWithoutExt = originalName.replace(".docx", "");
			const outputFileName = `${nameWithoutExt}-converted.docx`;

			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = outputFileName;
			a.click();
			window.URL.revokeObjectURL(url);

			// Show success message
			const successMessage = document.getElementById("success-message");
			if (successMessage) {
				successMessage.style.opacity = "1";
				setTimeout(() => {
					successMessage.style.opacity = "0";
				}, 3000);
			}
		} catch (error) {
			console.error("Error:", error);
			if (error instanceof Error && error.message.includes("Invalid Server Actions request")) {
				setError(
					"Server configuration error. Please try accessing the app directly without using a tunnel."
				);
			} else {
				setError("An error occurred while processing the document");
			}
		} finally {
			setLoading(false);
		}
	}

	const handleRemoveFile = () => {
		setSelectedFile(null);
		setError(null);
	};

	return (
		<div className="max-w-2xl mx-auto">
			{/* Header Section */}
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-gray-800 mb-4">DOCX Unicode Converter</h1>
				<p className="text-gray-600">Convert your document text while preserving all formatting</p>
			</div>

			{/* Main Content */}
			<div className="bg-white rounded-2xl shadow-xl p-8">
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
						<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clipRule="evenodd"
							/>
						</svg>
						{error}
					</div>
				)}

				{/* Success Message */}
				<div
					id="success-message"
					className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg opacity-0 transition-opacity duration-300"
				>
					Document converted successfully!
				</div>

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
								{isDragActive ? "Drop your DOCX file here..." : "Drag & drop your DOCX file here"}
							</p>
							<p className="text-sm text-gray-500 mt-2">or click to select a file</p>
						</div>
					</div>
				</div>

				{/* Selected File Display */}
				{selectedFile && (
					<div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
						<div className="flex items-center">
							<svg
								className="w-5 h-5 text-blue-500 mr-2"
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
							<span className="text-sm text-blue-600 font-medium">{selectedFile.name}</span>
						</div>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleRemoveFile();
							}}
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
				)}

				{/* Convert Button */}
				<button
					onClick={handleConvert}
					disabled={loading || !selectedFile}
					className={`
                        mt-6 w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                        ${
													loading || !selectedFile
														? "bg-gray-300 cursor-not-allowed text-gray-500"
														: "bg-blue-500 hover:bg-blue-600 text-white"
												}
                    `}
				>
					{loading ? (
						<div className="flex items-center justify-center">
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
							Converting...
						</div>
					) : (
						"Convert Document"
					)}
				</button>
			</div>

			{/* Footer */}
			<div className="mt-8 text-center text-sm text-gray-500">
				<p>Supports .docx files • Preserves all formatting</p>
			</div>
		</div>
	);
}
