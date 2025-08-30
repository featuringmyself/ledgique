import { useState, useCallback, useEffect, Dispatch, SetStateAction } from "react";

interface UseSidebarProps {
    defaultOpen?: boolean;
    breakpoint?: number;
}

export function useSidebar({ defaultOpen = false, breakpoint = 768 }: UseSidebarProps = {}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < breakpoint;
            setIsMobile(mobile);
            
            // Auto-close on mobile when switching from desktop
            if (mobile && isOpen) {
                setIsOpen(false);
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        
        return () => window.removeEventListener("resize", checkMobile);
    }, [breakpoint, isOpen]);

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const open = useCallback(() => {
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const setOpen: Dispatch<SetStateAction<boolean>> = useCallback((value) => {
        setIsOpen(value);
    }, []);

    return {
        isOpen,
        isMobile,
        toggle,
        open,
        close,
        setOpen,
    };
}