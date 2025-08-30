"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { SidebarStateProvider } from "./providers/SidebarProvider";

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

  // Show sign-in page for unauthenticated users
  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-neutral-800">
        <div className="text-center space-y-6 p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to Ledgique
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to access your dashboard
            </p>
          </div>
          <SignInButton mode="modal">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // Show sidebar layout for authenticated users
  return (
    <SidebarStateProvider>
      <Sidebar>{children}</Sidebar>
    </SidebarStateProvider>
  );
}