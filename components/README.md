# Production-Grade Sidebar Component

A fully-featured, accessible, and production-ready sidebar component built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ **TypeScript Support** - Full type safety with comprehensive interfaces
- ✅ **Responsive Design** - Mobile-first approach with automatic mobile behavior
- ✅ **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- ✅ **Error Boundaries** - Graceful error handling with fallback UI
- ✅ **Performance Optimized** - Memoized components, lazy loading, efficient re-renders
- ✅ **Customizable** - Flexible props for navigation links, user info, and branding
- ✅ **Dark Mode** - Built-in dark mode support
- ✅ **Animation** - Smooth transitions with Framer Motion
- ✅ **State Management** - Custom hook for sidebar state with responsive behavior

## Usage

### Basic Usage

```tsx
import { AppSidebar } from "@/components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppSidebar>
      {children}
    </AppSidebar>
  );
}
```

### Advanced Usage

```tsx
import { AppSidebar } from "@/components/Sidebar";
import { IconHome, IconUser } from "@tabler/icons-react";

const customLinks = [
  {
    label: "Home",
    href: "/",
    icon: <IconHome className="h-5 w-5" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <IconUser className="h-5 w-5" />,
    onClick: () => console.log("Profile clicked"),
  },
];

const customUser = {
  name: "Jane Doe",
  avatar: "/avatar.jpg",
  href: "/profile",
  email: "jane@example.com",
};

const customLogo = {
  text: "My App",
  href: "/",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppSidebar
      navigationLinks={customLinks}
      user={customUser}
      logo={customLogo}
      defaultOpen={true}
      onNavigate={(href) => console.log("Navigating to:", href)}
    >
      {children}
    </AppSidebar>
  );
}
```

## Props

### AppSidebarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to render in the main area |
| `className` | `string` | - | Additional CSS classes |
| `defaultOpen` | `boolean` | `false` | Initial sidebar state |
| `navigationLinks` | `NavigationLink[]` | Default links | Array of navigation items |
| `user` | `User` | Default user | User information for profile section |
| `logo` | `Logo` | Default logo | Logo configuration |
| `onNavigate` | `(href: string) => void` | - | Callback when navigation occurs |

### NavigationLink

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | `string` | ✅ | Display text for the link |
| `href` | `string` | ✅ | URL or route path |
| `icon` | `React.ReactNode` | ✅ | Icon component |
| `onClick` | `() => void` | - | Click handler |
| `isActive` | `boolean` | - | Active state indicator |
| `badge` | `string \| number` | - | Badge content |

### User

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | ✅ | User's display name |
| `avatar` | `string` | ✅ | Avatar image URL |
| `href` | `string` | - | Profile link URL |
| `email` | `string` | - | User's email address |

### Logo

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | `string` | ✅ | Logo text |
| `href` | `string` | - | Logo link URL |
| `icon` | `React.ReactNode` | - | Logo icon |

## Hooks

### useSidebar

Custom hook for managing sidebar state with responsive behavior.

```tsx
import { useSidebar } from "@/components/hooks/useSidebar";

function MyComponent() {
  const { isOpen, toggle, isMobile } = useSidebar({ defaultOpen: false });
  
  return (
    <button onClick={toggle}>
      {isOpen ? "Close" : "Open"} Sidebar
    </button>
  );
}
```

## Configuration

The sidebar uses a centralized configuration file for default values and settings:

```tsx
// components/config/sidebar.config.ts
export const SIDEBAR_CONFIG = {
  animation: {
    duration: 0.2,
    ease: "easeInOut",
  },
  breakpoints: {
    mobile: 768,
  },
  dimensions: {
    collapsed: 60,
    expanded: 240,
  },
};
```

## Error Handling

The sidebar includes comprehensive error handling:

- **Error Boundaries** - Catches and handles component errors gracefully
- **Image Fallbacks** - Automatic fallback for broken avatar images
- **Loading States** - Suspense boundaries with loading spinners
- **Responsive Fallbacks** - Graceful degradation on smaller screens

## Accessibility

- **ARIA Labels** - Proper labeling for screen readers
- **Keyboard Navigation** - Full keyboard support
- **Focus Management** - Proper focus handling
- **Semantic HTML** - Uses semantic elements (`nav`, `main`, etc.)
- **Color Contrast** - Meets WCAG guidelines

## Performance

- **Memoization** - Components and values are memoized to prevent unnecessary re-renders
- **Lazy Loading** - Content is loaded lazily with Suspense
- **Efficient Updates** - State updates are optimized with useCallback
- **Bundle Splitting** - Components can be code-split for better loading

## Dependencies

- React 18+
- TypeScript 4.5+
- Tailwind CSS 3+
- Framer Motion
- @tabler/icons-react
- Next.js (for Image component)

## File Structure

```
components/
├── Sidebar.tsx              # Main sidebar component
├── ErrorBoundary.tsx        # Error boundary wrapper
├── LoadingSpinner.tsx       # Loading component
├── types/
│   └── sidebar.ts          # TypeScript interfaces
├── hooks/
│   └── useSidebar.ts       # Sidebar state hook
├── config/
│   └── sidebar.config.ts   # Configuration constants
└── ui/
    └── sidebar.tsx         # Base UI components
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use in your projects!