import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "./providers";


export const metadata: Metadata = {
  title: "Registro Acesso PET",
  description: "Form to register a new user for access security system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
