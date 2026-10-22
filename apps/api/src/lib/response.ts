import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export interface ApiResponseEnvelope<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    meta?: Record<string, any>;
    total?: number;
    page?: number;
    limit?: number;
}

export function sendSuccess<T = any>(
    c: Context,
    data?: T,
    message = "Request succeeded",
    status: ContentfulStatusCode = 200,
    meta?: { total?: number; page?: number; limit?: number; [key: string]: any }
) {
    return c.json<ApiResponseEnvelope<T>>(
        {
            success: true,
            message,
            ...(data !== undefined ? { data } : {}),
            ...(meta ? { ...meta, meta } : {}),
        },
        status
    );
}

export function sendError(
    c: Context,
    message = "An error occurred",
    status: ContentfulStatusCode = 500,
    error?: unknown
) {
    const errorDetails = error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : undefined;

    return c.json<ApiResponseEnvelope>(
        {
            success: false,
            message,
            ...(errorDetails ? { error: errorDetails } : {}),
        },
        status
    );
}
