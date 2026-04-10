"use client";

import { useAuth } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { SidebarStateProvider } from "./providers/SidebarProvider";
import { AiChatWidget } from "./AiChatWidget";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-neutral-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  // Middleware now protects all app routes, so signed-out states should not render here.
  if (!isSignedIn) {
    return null;
  }

  // Show sidebar layout for authenticated users
  return (
    <SidebarStateProvider>
      <Sidebar>{children}</Sidebar>
      <AiChatWidget />
    </SidebarStateProvider>
  );
}