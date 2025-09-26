"use client";

import { useEffect } from "react";

export default function Page() {
	useEffect(() => {
		window.location.href = "/";
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-8xl font-bold text-white mb-8">
					ClipBoy
				</h1>
				<p className="text-2xl text-gray-300">
					Redirecting...
				</p>
			</div>
		</div>
	);
}