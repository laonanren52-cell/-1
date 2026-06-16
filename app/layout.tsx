import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "PingFang SC", "sans-serif"],
});

export const metadata: Metadata = {
  title: "人生打卡",
  description: "把生活小事做成成就系统的 AI 打卡 App",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "人生打卡",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "人生打卡",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7CAB9A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={"min-h-[100dvh] " + notoSans.className}>
        <div className="fixed top-1 left-3 z-0 text-[9px] text-ivory-300/40 select-none pointer-events-none font-mono tracking-[0.05em]">v2026.1</div>
        <main className="mx-auto min-h-[100dvh] max-w-md bg-ivory-100 pb-safe">
          {children}
        </main>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.register("/sw.js").catch(() => {});
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
