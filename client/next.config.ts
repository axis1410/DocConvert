import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	experimental: {
		serverActions: {
			allowedOrigins: ["1pr9w0mj-3000.inc1.devtunnels.ms", "localhost:3000"],
		},
	},
};

export default nextConfig;
