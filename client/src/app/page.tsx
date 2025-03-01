import ConvertDocument from "@/components/ConvertDocument";

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8 flex flex-col items-center justify-center relative">
			<div className="w-full max-w-5xl">
				<ConvertDocument />
			</div>
			<footer className="absolute bottom-0 w-full text-center text-slate-400 text-sm py-4 left-0">
				Copyright © 2025, Hizru Boys
			</footer>
		</main>
	);
}
