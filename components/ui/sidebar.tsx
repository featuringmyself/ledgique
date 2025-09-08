"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX, IconChevronRight } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
  children?: Links[];
  isExpandable?: boolean;
}

export { type Links };

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  hoverOpen: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
  hoverOpen = false,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  hoverOpen?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, hoverOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
  hoverOpen,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  hoverOpen?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate} hoverOpen={hoverOpen}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, animate, setOpen } = useSidebar();
  const [hoverOpen, setHoverOpen] = useState(false);

  const effectiveOpen = open || hoverOpen;

  return (
    <>
      <motion.div
        className={cn(
          "fixed left-0 top-0 h-screen px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] shrink-0 overflow-hidden z-50",
          className
        )}
        animate={{
          width: animate ? (effectiveOpen ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate, hoverOpen } = useSidebar();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const effectiveOpen = open || hoverOpen;
  const isActive = pathname === link.href || (link.children && link.children.some(child => pathname === child.href));
  const shouldExpand = effectiveOpen && isExpanded && (link.children && link.children.length > 0);

  // Reset expanded state when sidebar closes
  React.useEffect(() => {
    if (!effectiveOpen) {
      setIsExpanded(false);
      setIsHovered(false);
    }
  }, [effectiveOpen]);

  const handleClick = (e: React.MouseEvent) => {
    if (link.children && link.children.length > 0) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (effectiveOpen && link.children && link.children.length > 0) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (link.children && link.children.length > 0) {
      setIsExpanded(false);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {link.children && link.children.length > 0 ? (
        <div
          onClick={handleClick}
          className={cn(
            "flex items-center justify-between gap-2 group/sidebar py-2  rounded-md cursor-pointer transition-colors",
            isActive ? "bg-neutral-200 dark:bg-neutral-700" : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {link.icon}
            <motion.span
              animate={{
                display: animate ? (effectiveOpen ? "inline-block" : "none") : "inline-block",
                opacity: animate ? (effectiveOpen ? 1 : 0) : 1,
              }}
              className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
            >
              {link.label}
            </motion.span>
          </div>

          {link.children && link.children.length > 0 && (
            <motion.div
              animate={{
                display: animate ? (effectiveOpen ? "inline-block" : "none") : "inline-block",
                opacity: animate ? (effectiveOpen ? 1 : 0) : 1,
                rotate: shouldExpand ? 90 : 0,
              }}
              className="text-neutral-500 dark:text-neutral-400"
            >
              <IconChevronRight className="h-4 w-4" />
            </motion.div>
          )}
        </div>
      ) : (
        <Link
          href={link.href}
          onClick={handleClick}
          className={cn(
            "flex items-center justify-between gap-2 group/sidebar py-2 px-1 rounded-md cursor-pointer transition-colors",
            isActive ? "bg-neutral-200 dark:bg-neutral-700" : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {link.icon}
            <motion.span
              animate={{
                display: animate ? (effectiveOpen ? "inline-block" : "none") : "inline-block",
                opacity: animate ? (effectiveOpen ? 1 : 0) : 1,
              }}
              className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
            >
              {link.label}
            </motion.span>
          </div>
        </Link>
      )}

      <AnimatePresence>
        {shouldExpand && link.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-6 mt-1 space-y-1">
              {link.children.map((child, idx) => (
                <SidebarSubLink key={idx} link={child} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarSubLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate, hoverOpen } = useSidebar();
  const pathname = usePathname();
  const isActive = pathname === link.href;
  
  const effectiveOpen = open || hoverOpen;

  const handleClick = (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
  };

  return (
    <Link
      href={link.href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm cursor-pointer transition-colors",
        isActive
          ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (effectiveOpen ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (effectiveOpen ? 1 : 0) : 1,
        }}
        className="whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};


