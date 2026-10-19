import type { AlertVariant } from './alert.svelte';

export interface AlertStateOptions {
	title?: string | null;
	variant?: AlertVariant;
	duration?: number;
}

export class AlertState {
	message = $state<string | null>(null);
	title = $state<string | null>(null);
	variant = $state<AlertVariant>('destructive');
	visible = $state(false);
	private timer: ReturnType<typeof setTimeout> | null = null;

	constructor(initial?: { message?: string; title?: string; variant?: AlertVariant }) {
		if (initial?.message) {
			this.show(initial.message, { title: initial.title, variant: initial.variant });
		}
	}

	show(message: string, options?: AlertStateOptions) {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}

		this.message = message;
		this.title = options?.title ?? null;
		this.variant = options?.variant ?? 'destructive';
		this.visible = Boolean(message && message.trim().length > 0);

		if (options?.duration && options.duration > 0 && typeof window !== 'undefined') {
			this.timer = setTimeout(() => {
				this.clear();
			}, options.duration);
		}
	}

	error(message: string, title?: string, duration?: number) {
		this.show(message, { title, variant: 'destructive', duration });
	}

	success(message: string, title?: string, duration?: number) {
		this.show(message, { title, variant: 'success', duration });
	}

	warning(message: string, title?: string, duration?: number) {
		this.show(message, { title, variant: 'warning', duration });
	}

	info(message: string, title?: string, duration?: number) {
		this.show(message, { title, variant: 'info', duration });
	}

	clear() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.message = null;
		this.title = null;
		this.visible = false;
	}
}

export function createAlertState(initial?: { message?: string; title?: string; variant?: AlertVariant }) {
	return new AlertState(initial);
}
