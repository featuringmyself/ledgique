"use client";

import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";

interface SidebarContextType {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarState = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarStateProvider");
  }
  return context;
};

export const SidebarStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  // Persist sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-open");
    if (savedState !== null) {
      setOpen(JSON.parse(savedState));
    }
  }, []);

  const handleSetOpen: Dispatch<SetStateAction<boolean>> = (value) => {
    setOpen((prevOpen) => {
      const newOpen = typeof value === 'function' ? value(prevOpen) : value;
      localStorage.setItem("sidebar-open", JSON.stringify(newOpen));
      return newOpen;
    });
  };

  return (
    <SidebarContext.Provider value={{ open, setOpen: handleSetOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};