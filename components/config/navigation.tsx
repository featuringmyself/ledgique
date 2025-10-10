import {
    IconArrowLeft,
    IconBrandTabler,
    IconReceipt,
    IconSettings,
    IconUserBolt,
    IconNotes,
} from "@tabler/icons-react";
import type { NavigationLink } from "../types/sidebar";

export const DEFAULT_NAVIGATION_LINKS: NavigationLink[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Notes",
        href: "/notes",
        icon: <IconNotes className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Expenses",
        href: "/expenses",
        icon: <IconReceipt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Profile",
        href: "/profile",
        icon: <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Logout",
        href: "#",
        icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        onClick: () => {
            // Handle logout logic here
            if (typeof window !== "undefined") {
                console.log("Logout clicked");
                // Add your logout logic here
            }
        },
    },
];