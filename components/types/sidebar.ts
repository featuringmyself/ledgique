export interface NavigationLink {
    label: string;
    href: string;
    icon: React.ReactNode;
    onClick?: () => void;
    isActive?: boolean;
    badge?: string | number;
    children?: NavigationLink[];
    isExpandable?: boolean;
}

export interface User {
    name: string;
    avatar: string;
    href?: string;
    email?: string;
}

export interface Logo {
    text: string;
    href?: string;
    icon?: React.ReactNode;
}

export interface AppSidebarProps {
    children?: React.ReactNode;
    className?: string;
    defaultOpen?: boolean;
    navigationLinks?: NavigationLink[];
    user?: User;
    logo?: Logo;
    onNavigate?: (href: string) => void;
}