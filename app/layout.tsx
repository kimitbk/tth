import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Decorations, SoundControl } from "@/components/Chrome";
import { GameProvider, THEME_STORAGE_KEY } from "@/components/GameProvider";
import { DEFAULT_THEME, THEME_LIST } from "@/lib/themes";
import "./globals.css";

const display = Baloo_2({ subsets: ["latin", "vietnamese"], weight: ["600", "700", "800"], variable: "--font-display" });
const body = Nunito({ subsets: ["latin", "vietnamese"], weight: ["400", "600", "700", "800"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Kids Adventure World – Học để mở khóa",
  description: "Thế giới phiêu lưu cho bé: giải câu đố Toán, Tiếng Việt, Tiếng Anh để mở khóa nhân vật và trang bị.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Set the saved theme before first paint so there is no flash of the default theme.
const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var ok=${JSON.stringify(
  THEME_LIST.map((t) => t.id),
)};document.documentElement.dataset.theme=ok.indexOf(t)>-1?t:${JSON.stringify(DEFAULT_THEME)};}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <GameProvider>
          <Decorations />
          <main className="app">{children}</main>
          <SoundControl />
        </GameProvider>
      </body>
    </html>
  );
}
