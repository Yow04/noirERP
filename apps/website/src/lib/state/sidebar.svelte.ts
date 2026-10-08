class SidebarState {
    collapsed = $state(false);
    mobileOpen = $state(false);

    constructor() {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("noirerp_sidebar_collapsed");
            if (saved !== null) {
                this.collapsed = saved === "true";
            }
        }
    }

    /**
     * Unified toggle method:
     * - On mobile (< 768px): toggles mobile drawer
     * - On desktop (>= 768px): toggles rail collapse/expand
     */
    toggle() {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            this.mobileOpen = !this.mobileOpen;
        } else {
            this.collapsed = !this.collapsed;
            if (typeof window !== "undefined") {
                localStorage.setItem("noirerp_sidebar_collapsed", String(this.collapsed));
            }
        }
    }

    toggleCollapse() {
        this.collapsed = !this.collapsed;
        if (typeof window !== "undefined") {
            localStorage.setItem("noirerp_sidebar_collapsed", String(this.collapsed));
        }
    }

    setCollapsed(val: boolean) {
        this.collapsed = val;
        if (typeof window !== "undefined") {
            localStorage.setItem("noirerp_sidebar_collapsed", String(this.collapsed));
        }
    }

    toggleMobile() {
        this.mobileOpen = !this.mobileOpen;
    }

    openMobile() {
        this.mobileOpen = true;
    }

    closeMobile() {
        this.mobileOpen = false;
    }
}

export const sidebarState = new SidebarState();
