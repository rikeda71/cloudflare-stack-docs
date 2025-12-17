import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import rehypeMermaid from "rehype-mermaid";

// セクションはデフォルトでは展開しない
const collapsed = true;

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Cloudflare Stack Docs",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/withastro/starlight" }],
      sidebar: [
        {
          label: "🔍 RAG Search",
          link: "/search",
        },
        {
          label: "📅 Calendar System",
          autogenerate: { directory: "calendar-system" },
          collapsed,
        },
        {
          label: "📋 Task Management System",
          autogenerate: { directory: "task-manegement-system" },
          collapsed,
        },
        {
          label: "📄 Templates",
          autogenerate: { directory: "_templates" },
          collapsed,
        },
      ],
    }),
    react(),
  ],

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },

    imageService: "cloudflare",
  }),

  markdown: {
    syntaxHighlight: {
      excludeLangs: ["mermaid"],
    },
    rehypePlugins: [rehypeMermaid],
  },
});
