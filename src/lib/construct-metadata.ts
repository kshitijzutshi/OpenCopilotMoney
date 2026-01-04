import type { Metadata } from "next";
import { siteMetadata } from "./site-metadata";

export const HOME_DOMAIN =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://badget.tech"
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000";

export const APP_HOSTNAMES = new Set([
  "badget.tech",
  "preview.badget.tech",
  "localhost:8888",
  "localhost:3000",
  "localhost",
]);

export function constructMetadata({
  title = siteMetadata.name,
  description = siteMetadata.description,
  image = `${HOME_DOMAIN}/opengraph-image`,
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: siteMetadata.name,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@badget",
    },
    icons,
    metadataBase: new URL(HOME_DOMAIN),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export const truncate = (str: string | null, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length - 3)}...`;
};
