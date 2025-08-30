import type { User, Logo } from "../types/sidebar";

export const SIDEBAR_CONFIG = {
    // Animation settings
    animation: {
        duration: 0.2,
        ease: "easeInOut",
    },
    
    // Breakpoints
    breakpoints: {
        mobile: 768,
    },
    
    // Default dimensions
    dimensions: {
        collapsed: 60,
        expanded: 240,
    },
} as const;


export const DEFAULT_LOGO: Logo = {
    text: "Ledgique",
    href: "/",
};