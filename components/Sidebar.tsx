"use client";
import React, { Dispatch, SetStateAction } from "react";
import { Sidebar as SidebarUI, SidebarBody, SidebarLink, useSidebar } from "./ui/sidebar";
import { useSidebarState } from "./providers/SidebarProvider";
import {
    IconArrowLeft,
    IconBrandTabler,
    IconBook,
    IconFileInvoice,
    IconUsers,
    IconUsersGroup,
    IconCreditCardPay
} from "@tabler/icons-react";
import { motion } from "motion/react";
import logo from "@/public/logo.png"
import { SignOutButton, useUser } from "@clerk/nextjs";

import Image from "next/image";
import Link from "next/link";

export function Sidebar({ children }: { children?: React.ReactNode }) {
    const { user } = useUser();
    const { open, setOpen } = useSidebarState();

    // Explicit type assertion to ensure compatibility
    const handleSetOpen: Dispatch<SetStateAction<boolean>> = setOpen;


    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
            label: "Client",
            href: "/client",
            icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
            children: [
                {
                    label: "All Clients",
                    href: "/client",
                    icon: <IconUsers className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
                {
                    label: "Add Client",
                    href: "/client/add",
                    icon: <IconUsers className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
            ],
        },
        {
            label: "Invoice",
            href: "/invoice",
            icon: <IconFileInvoice className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
            children: [
                {
                    label: "All Invoices",
                    href: "/invoice",
                    icon: <IconFileInvoice className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
                {
                    label: "Create Invoice",
                    href: "/invoice/create",
                    icon: <IconFileInvoice className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
            ],
        },
        {
            label: "Payments",
            href: "/payments",
            icon: <IconCreditCardPay className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
            children: [
                {
                    label: "All Payments",
                    href: "/payments",
                    icon: <IconCreditCardPay className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
                {
                    label: "Payment History",
                    href: "/payments/history",
                    icon: <IconCreditCardPay className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
            ],
        },
        {
            label: "Reports",
            href: "/reports",
            icon: <IconBook className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
            children: [
                {
                    label: "Financial Reports",
                    href: "/reports",
                    icon: <IconBook className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
                {
                    label: "Analytics",
                    href: "/reports/analytics",
                    icon: <IconBook className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
            ],
        },
        {
            label: "Team",
            href: "/team",
            icon: <IconUsersGroup className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
            children: [
                {
                    label: "Team Members",
                    href: "/team",
                    icon: <IconUsersGroup className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
                {
                    label: "Invite Members",
                    href: "/team/invite",
                    icon: <IconUsersGroup className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-400" />,
                },
            ],
        },
    ];

    return (
        <div className="flex w-full min-h-screen bg-gray-100 dark:bg-neutral-800">
            <SidebarUI open={open} setOpen={handleSetOpen} hoverOpen={true}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        <LogoComponent />
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                            <LogoutButton />
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: user?.fullName || user?.emailAddresses[0]?.emailAddress || "User",
                                href: "/profile",
                                icon: (
                                    <Image
                                        src={user?.imageUrl || "https://assets.aceternity.com/manu.png"}
                                        className="h-7 w-7 shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </SidebarUI>
            <main className="flex flex-1">
                {children || <Dashboard />}
            </main>
        </div>
    );
}

const LogoComponent = () => {
    const { open, hoverOpen } = useSidebar();
    const effectiveOpen = open || hoverOpen;

    return effectiveOpen ? <Logo /> : <LogoIcon />;
};

const LogoutButton = () => {
    const { open, hoverOpen } = useSidebar();
    const effectiveOpen = open || hoverOpen;

    return (
        <SignOutButton>
            <div className="flex items-center gap-2 p-2 text-sm font-normal text-neutral-700 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer">
                <IconArrowLeft className="h-5 w-5 shrink-0" />
                {effectiveOpen && <span>Logout</span>}
            </div>
        </SignOutButton>
    );
};

export const Logo = () => {
    return (
        <Link
            href="/"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <Image src={logo} alt="Logo of Ledgique biggy" className="h-[2rem] w-auto" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-pre text-black dark:text-white"
            >
                Ledgique
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            href="/"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <Image src={logo} alt="Logo of Ledgique" className="h-[2rem] w-auto" />
        </Link>
    );
};

const Dashboard = () => {
    return (
        <div className="flex flex-1">
            <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex gap-2">
                    {[...new Array(4)].map((_, idx) => (
                        <div
                            key={idx}
                            className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
                        />
                    ))}
                </div>
                <div className="flex flex-1 gap-2">
                    {[...new Array(2)].map((_, idx) => (
                        <div
                            key={idx}
                            className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};