import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";

export const metadata: Metadata = {
  title: "GitDiagram",
  description:
    "Turn any GitHub repository into an interactive diagram for visualization in seconds.",
  metadataBase: new URL("https://gitdiagram.com"),
  keywords: [
    "github",
    "git diagram",
    "git diagram generator",
    "git diagram tool",
    "git diagram maker",
    "git diagram creator",
    "git diagram",
    "diagram",
    "repository",
    "visualization",
    "code structure",
    "system design",
    "software architecture",
    "software design",
    "software engineering",
    "software development",
    "software architecture",
    "software design",
    "software engineering",
    "software development",
    "open source",
    "open source software",
    "ahmedkhaleel2004",
    "ahmed khaleel",
    "hui zhou",
    "gitdiagram",
    "gitdiagram.com",
    "util-kit.com",
  ],
  authors: [
    { name: "Ahmed Khaleel", url: "https://github.com/ahmedkhaleel2004" },
    { name: "Hui Zhou", url: "https://github.com/huizhou1" },
  ],
  creator: "Ahmed Khaleel, Hui Zhou",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://util-kit.com",
    title: "GitDiagram - Repository to Diagram in Seconds",
    description:
      "Turn any GitHub repository into an interactive diagram for visualization.",
    siteName: "GitDiagram",
    images: [
      {
        url: "/og-image.png", // You'll need to create this image
        width: 1200,
        height: 630,
        alt: "GitDiagram - Repository Visualization Tool",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
