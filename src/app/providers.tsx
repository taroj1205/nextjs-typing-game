// app/providers.tsx
"use client";

import { NextUIProvider } from "@nextui-org/react";
import { MenuBar } from "@/components/MenuBar";
import { useSelectedLayoutSegment } from "next/navigation";
import { NavMenu } from "@/components/NavMenu";

import {
	ColorModeScript,
	UIProvider,
	createColorModeManager,
	defaultConfig,
} from "@yamada-ui/react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
	const colorModeManager = createColorModeManager("cookie");
	const currentColorMode = colorModeManager.get();
	const segment = useSelectedLayoutSegment();

	return (
		<NextUIProvider>
			<UIProvider colorModeManager={colorModeManager}>
				<ColorModeScript
					type="cookie"
					nonce="testing"
					initialColorMode={defaultConfig.initialColorMode}
				/>
				<div className="w-screen h-10"></div>
				<div className="w-screen fixed top-0 bg-white z-50">
					<NavMenu />
				</div>
				{children}
			</UIProvider>
		</NextUIProvider>
	);
};
