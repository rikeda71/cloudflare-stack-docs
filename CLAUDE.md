# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based documentation site using Starlight framework, deployed on Cloudflare Workers. It serves as the documentation hub for development projects.

## Common Development Commands

### Basic Commands
```bash
# Install dependencies (using pnpm)
pnpm install

# Start development server on http://localhost:4321
pnpm dev

# Build for production
pnpm build

# Preview with Cloudflare Workers locally
pnpm preview

# Deploy to Cloudflare Workers
pnpm deploy
```

### Code Quality Commands
```bash
# Format all code with Biome
pnpm format

# Run linter with auto-fix
pnpm lint

# Run both format and lint
pnpm check

# Check Japanese text with textlint
pnpm textlint

# Auto-fix Japanese text issues
pnpm textlint:fix
```

### Testing and Development
```bash
# Run development on different port if 4321 is occupied
pnpm dev -- --port 3000

# Generate Cloudflare Workers types
pnpm cf-typegen
```

## Architecture and Structure

### Technology Stack
- **Framework**: Astro with Starlight theme
- **Runtime**: Cloudflare Workers with nodejs_compat
- **Package Manager**: pnpm
- **Code Quality**:
  - Biome (code formatter and linter)
  - textlint with preset-ja-technical-writing (Japanese text linter)
- **Language**: TypeScript

### Key Configuration Files
- `astro.config.ts`: Configures Starlight sidebar structure and Cloudflare adapter
- `wrangler.jsonc`: Cloudflare Workers deployment settings
- `biome.jsonc`: Code formatting and linting rules (2 spaces, LF line endings, 120 char width)
- `.textlintrc.json`: Japanese text linting configuration using preset-ja-technical-writing

### Content Organization
The documentation content follows a specific structure:
- All documentation lives in `src/content/docs/`
- Currently organized into sections: `potz` (project docs) and `_templates` (doc templates)
- Sidebar is auto-generated based on directory structure as defined in astro.config.ts

### Documentation Writing Guidelines

#### Japanese Documentation Quality Control
**IMPORTANT**: When writing or editing Japanese documentation in this repository, you MUST use the `japanese-technical-docs-writer` skill to review and improve the text quality. This ensures consistency and adherence to Japanese technical writing standards.

To use the skill:
```bash
# For reviewing/improving existing documentation
/japanese-technical-docs-writer [file-path]

# For creating new documentation
/japanese-technical-docs-writer create [file-path]
```

The skill will:
1. Automatically fix common issues using textlint
2. Identify manual corrections needed
3. Provide improvement suggestions for readability and clarity
4. Ensure compliance with Japanese technical writing standards

#### Frontmatter Requirements
Every markdown file MUST include a `title` field in frontmatter:
```markdown
---
title: Page Title (REQUIRED)
description: Optional page description
---
```

#### Content Placement Rules
This repository should only contain human-reviewed documentation:
- Design docs, manuals, architecture diagrams
- Concepts, philosophies, and strategic thinking

Development-specific documentation (README, AI-generated specs) should remain in individual project repositories.

### Adding New Documentation

To create documentation for a new project:
```bash
# Create project directory
mkdir -p src/content/docs/<project-name>

# Create index page with required frontmatter
echo '---
title: Project Name
description: Project description
---

# Project Name

Project overview here' > src/content/docs/<project-name>/index.md
```

### Image Handling
Images should be placed in `src/assets/` and referenced with relative paths:
```markdown
![Alt text](../../../assets/image.png)
```

## Deployment Process

The site automatically deploys to Cloudflare Workers when changes are merged to the `main` branch. Manual deployment is available via `pnpm deploy`.

## Important Notes

- The development server runs on port 4321 by default
- All markdown files support MDX features from Starlight
- The site uses Cloudflare's image service for optimization
- Biome enforces consistent code style (2 spaces, semicolons, trailing commas)
- textlint enforces Japanese technical writing standards for documentation quality
- The project uses Astro's content collections for type-safe content management
