class SidebarState {
    collapsed = $state(false);
    mobileOpen = $state(false);
    customWidth = $state(256);
    isDragging = $state(false);

    readonly RAIL_WIDTH = 72; // 4.5rem
    readonly DEFAULT_WIDTH = 256; // 16rem
    readonly MIN_WIDTH = 190;
    readonly MAX_WIDTH = 420;

    constructor() {
        if (typeof window !== "undefined") {
            const savedCollapsed = localStorage.getItem("noirerp_sidebar_collapsed");
            if (savedCollapsed !== null) {
                this.collapsed = savedCollapsed === "true";
            }
            const savedWidth = localStorage.getItem("noirerp_sidebar_width");
            if (savedWidth !== null) {
                const w = parseInt(savedWidth, 10);
                if (!isNaN(w) && w >= this.MIN_WIDTH && w <= this.MAX_WIDTH) {
                    this.customWidth = w;
                }
            }
        }
    }

    get width(): number {
        if (this.collapsed) {
            return this.RAIL_WIDTH;
        }
        return this.customWidth;
    }

    setWidth(w: number) {
        this.customWidth = Math.max(this.MIN_WIDTH, Math.min(this.MAX_WIDTH, w));
        if (typeof window !== "undefined") {
            localStorage.setItem("noirerp_sidebar_width", String(this.customWidth));
        }
    }

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
