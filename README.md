# 🚀 Welcome to MotionForge Code Scaffold

A modern, production-ready web application scaffold powered by cutting-edge technologies, designed to accelerate your development with high-performance video creation and professional UI tools.

## ✨ Technology Stack

This scaffold provides a robust foundation built with:

### 🎯 Core Framework
- **⚡ Next.js 16** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Fetch** - Promise-based HTTP request

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution

### 🎨 Advanced UI Features
- **📊 TanStack Table** - Headless UI for building tables and datagrids
- **🖱️ DND Kit** - Modern drag and drop toolkit for React
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing
- **🎬 MotionForge** - High-performance programmatic video creation framework

### 🌍 Internationalization & Utilities
- **🌍 Next Intl** - Internationalization library for Next.js
- **📅 Date-fns** - Modern JavaScript date utility library
- **🪝 ReactUse** - Collection of essential React hooks for modern development

## 🎯 Why This Scaffold?

- **🏎️ Fast Development** - Pre-configured tooling and best practices
- **🎨 Beautiful UI** - Complete shadcn/ui component library with advanced interactions
- **🔒 Type Safety** - Full TypeScript configuration with Zod validation
- **📱 Responsive** - Mobile-first design principles with smooth animations
- **🎬 Video Export** - Frame-accurate video rendering with WebCodecs support
- **🗄️ Database Ready** - Prisma ORM configured for rapid backend development
- **🔐 Auth Included** - NextAuth.js for secure authentication flows
- **📊 Data Visualization** - Charts, tables, and drag-and-drop functionality
- **🌍 i18n Ready** - Multi-language support with Next Intl
- **🚀 Production Ready** - Optimized build and deployment settings
- **🤖 AI-Friendly** - Professional guidelines for Google Gemini and GLM

## 🚀 Quick Start

There are two ways to use MotionForge depending on your needs:

### 1. Starting a New Project (Recommended)
Use the CLI to bootstrap a complete video project with templates and configurations ready to go.

```bash
# This will work once you publish the package to NPM
npx create-motionforge@latest
```

**Note:** If you haven't published to NPM yet, you can test it locally from this repo:
```bash
cd packages/create-motionforge
bun run start
```

### 2. Adding to an Existing Project
If you already have a Next.js or React project, just install the library:

```bash
npm install motionforge
```

## 🛠️ Development Setup (for Framework Contributors)

If you want to contribute to the MotionForge framework or run the main scaffold:

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) to see the main framework demo.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and configurations
```

## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag-and-drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Fetch + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Internationalization**: Multi-language support with Next Intl
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Essential Hooks**: 100+ useful React hooks with ReactUse for common patterns

## 🎬 MotionForge Video Framework

MotionForge is a high-performance, React-based programmatic video framework. It is designed to be a modern alternative to Remotion, offering seamless integration with Next.js and Tailwind CSS.

### 🚀 Getting Started
To create a new project:
```bash
npx create-motionforge@latest
```

To add to an existing project:
```bash
npm install motionforge
```

### Key Features:
- **Frame-Perfect Rendering**: deterministic animations driven by frame number.
- **High-Speed Export**: Frame-by-frame video export using WebCodecs.
- **Cinematic Effects**: Native support for spring physics, 3D transforms, and particle systems.
- **AI-Powered**: Comes with specialized guidelines for Google Gemini to generate high-quality video code.

### Exporting Video:
Use the "Export" button in the Player to render your composition to a high-quality WebM video.

## 🚀 CI/CD & Automated Publishing

MotionForge is configured with GitHub Actions to automate testing and publishing.

### Automated Publishing
Whenever you push a change to the `main` branch, the workflow will:
1.  Run the CI verification suite (Lint, Build, Type-check).
2.  Check if the version in `package.json` for `motionforge` or `create-motionforge` has been bumped.
3.  If a new version is detected, it will automatically publish the package to NPM with **Provenance** (secure, verifiable builds).

### How to set up
To enable automated publishing, you must add your NPM token to your GitHub repository:
1.  Go to your GitHub Repository **Settings** > **Secrets and variables** > **Actions**.
2.  Create a **New repository secret**.
3.  Name: `NPM_TOKEN`.
4.  Value: Your NPM Access Token (Automation type recommended).

---

Built with ❤️ for the developer community.
