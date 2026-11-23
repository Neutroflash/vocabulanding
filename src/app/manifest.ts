import type { MetadataRoute } from "next";

// Lets phones install the site on the home screen with the school crest as its icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vocabulanding",
    short_name: "Vocabulanding",
    description: "Learn English vocabulary and grammar by playing.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f5ff",
    theme_color: "#5b4bdb",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
