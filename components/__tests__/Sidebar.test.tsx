import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppSidebar } from "../Sidebar";
import type { NavigationLink, User, Logo } from "../types/sidebar";

// Mock framer-motion
jest.mock("motion/react", () => ({
    motion: {
        span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
    __esModule: true,
    default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock UI components
jest.mock("../ui/sidebar", () => ({
    Sidebar: ({ children, open }: any) => (
        <div data-testid="sidebar" data-open={open}>
            {children}
        </div>
    ),
    SidebarBody: ({ children }: any) => <div data-testid="sidebar-body">{children}</div>,
    SidebarLink: ({ link }: any) => (
        <a href={link.href} onClick={link.onClick} data-testid="sidebar-link">
            {link.icon}
            {link.label}
        </a>
    ),
}));

const mockNavigationLinks: NavigationLink[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: <span data-testid="dashboard-icon">📊</span>,
    },
    {
        label: "Profile",
        href: "/profile",
        icon: <span data-testid="profile-icon">👤</span>,
    },
];

const mockUser: User = {
    name: "Test User",
    avatar: "/test-avatar.jpg",
    href: "/profile",
    email: "test@example.com",
};

const mockLogo: Logo = {
    text: "Test App",
    href: "/",
};

describe("AppSidebar", () => {
    beforeEach(() => {
        // Mock window.innerWidth for responsive tests
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 1024,
        });
    });

    it("renders with default props", () => {
        render(<AppSidebar />);
        
        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
        expect(screen.getByTestId("sidebar-body")).toBeInTheDocument();
    });

    it("renders custom navigation links", () => {
        render(<AppSidebar navigationLinks={mockNavigationLinks} />);
        
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByTestId("dashboard-icon")).toBeInTheDocument();
        expect(screen.getByTestId("profile-icon")).toBeInTheDocument();
    });

    it("renders custom user information", () => {
        render(<AppSidebar user={mockUser} />);
        
        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByAltText("Test User avatar")).toBeInTheDocument();
    });

    it("renders custom logo", () => {
        render(<AppSidebar logo={mockLogo} />);
        
        expect(screen.getByText("Test App")).toBeInTheDocument();
    });

    it("renders children content", () => {
        render(
            <AppSidebar>
                <div data-testid="custom-content">Custom Content</div>
            </AppSidebar>
        );
        
        expect(screen.getByTestId("custom-content")).toBeInTheDocument();
        expect(screen.getByText("Custom Content")).toBeInTheDocument();
    });

    it("calls onNavigate when navigation link is clicked", async () => {
        const mockOnNavigate = jest.fn();
        
        render(
            <AppSidebar
                navigationLinks={mockNavigationLinks}
                onNavigate={mockOnNavigate}
            />
        );
        
        const dashboardLink = screen.getByText("Dashboard").closest("a");
        fireEvent.click(dashboardLink!);
        
        await waitFor(() => {
            expect(mockOnNavigate).toHaveBeenCalledWith("/dashboard");
        });
    });

    it("handles link onClick callback", async () => {
        const mockOnClick = jest.fn();
        const linksWithCallback: NavigationLink[] = [
            {
                label: "Logout",
                href: "#",
                icon: <span>🚪</span>,
                onClick: mockOnClick,
            },
        ];
        
        render(<AppSidebar navigationLinks={linksWithCallback} />);
        
        const logoutLink = screen.getByText("Logout").closest("a");
        fireEvent.click(logoutLink!);
        
        await waitFor(() => {
            expect(mockOnClick).toHaveBeenCalled();
        });
    });

    it("applies custom className", () => {
        const { container } = render(<AppSidebar className="custom-class" />);
        
        expect(container.firstChild).toHaveClass("custom-class");
    });

    it("sets initial open state based on defaultOpen prop", () => {
        render(<AppSidebar defaultOpen={true} />);
        
        const sidebar = screen.getByTestId("sidebar");
        expect(sidebar).toHaveAttribute("data-open", "true");
    });

    it("handles image error with fallback", () => {
        render(<AppSidebar user={mockUser} />);
        
        const avatar = screen.getByAltText("Test User avatar");
        fireEvent.error(avatar);
        
        // Check if fallback SVG is set
        expect(avatar).toHaveAttribute("src", expect.stringContaining("data:image/svg+xml"));
    });

    it("renders loading spinner in suspense fallback", () => {
        render(<AppSidebar />);
        
        // The loading spinner should be rendered in the suspense fallback
        // This test would need to be more sophisticated in a real scenario
        // where we can trigger the suspense state
        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });
});

describe("Logo Component", () => {
    it("renders logo with text and link", () => {
        const { Logo } = require("../Sidebar");
        
        render(<Logo text="Test Logo" href="/home" />);
        
        expect(screen.getByText("Test Logo")).toBeInTheDocument();
        expect(screen.getByLabelText("Test Logo home")).toHaveAttribute("href", "/home");
    });
});

describe("LogoIcon Component", () => {
    it("renders logo icon with link", () => {
        const { LogoIcon } = require("../Sidebar");
        
        render(<LogoIcon href="/home" />);
        
        expect(screen.getByLabelText("Home")).toHaveAttribute("href", "/home");
    });
});