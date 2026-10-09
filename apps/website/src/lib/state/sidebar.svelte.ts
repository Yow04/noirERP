class SidebarState {
    mobileOpen = $state(false);

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
