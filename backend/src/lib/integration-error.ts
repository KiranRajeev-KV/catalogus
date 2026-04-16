import axios, { type AxiosError } from "axios";

export type IntegrationProvider = "TMDB" | "ANILIST";
export type IntegrationOperation = "search" | "details";
export type IntegrationErrorCode =
	| "PROVIDER_RATE_LIMITED"
	| "PROVIDER_UNAVAILABLE"
	| "PROVIDER_BAD_CONFIG"
	| "PROVIDER_BAD_RESPONSE"
	| "INTERNAL_ERROR";

type IntegrationErrorInput = {
	message: string;
	publicMessage: string;
	provider: IntegrationProvider;
	operation: IntegrationOperation;
	code: IntegrationErrorCode;
	retryable: boolean;
	statusCode: number;
	upstreamStatus?: number;
	retryAttempts?: number;
	retryAfterMs?: number;
	suggestedBackoffMs?: number;
};

export class IntegrationError extends Error {
	public readonly publicMessage: string;
	public readonly provider: IntegrationProvider;
	public readonly operation: IntegrationOperation;
	public readonly code: IntegrationErrorCode;
	public readonly retryable: boolean;
	public readonly statusCode: number;
	public readonly upstreamStatus?: number;
	public readonly retryAttempts?: number;
	public readonly retryAfterMs?: number;
	public readonly suggestedBackoffMs?: number;

	constructor(input: IntegrationErrorInput) {
		super(input.message);
		this.name = "IntegrationError";
		this.publicMessage = input.publicMessage;
		this.provider = input.provider;
		this.operation = input.operation;
		this.code = input.code;
		this.retryable = input.retryable;
		this.statusCode = input.statusCode;
		if (input.upstreamStatus !== undefined) {
			this.upstreamStatus = input.upstreamStatus;
		}
		if (input.retryAttempts !== undefined) {
			this.retryAttempts = input.retryAttempts;
		}
		if (input.retryAfterMs !== undefined) {
			this.retryAfterMs = input.retryAfterMs;
		}
		if (input.suggestedBackoffMs !== undefined) {
			this.suggestedBackoffMs = input.suggestedBackoffMs;
		}
	}
}

function getRetryAttempts(error: AxiosError): number | undefined {
	const retryConfig = error.config?.["axios-retry"] as
		| { retryCount?: unknown }
		| undefined;

	return typeof retryConfig?.retryCount === "number"
		? retryConfig.retryCount
		: undefined;
}

function getPublicMessage(
	provider: IntegrationProvider,
	code: IntegrationErrorCode,
	upstreamStatus?: number,
): string {
	if (code === "PROVIDER_RATE_LIMITED") {
		return `${provider} rate limit reached. Please try again shortly.`;
	}

	if (upstreamStatus === 401 || upstreamStatus === 403) {
		return `${provider} integration is not configured correctly.`;
	}

	if (code === "PROVIDER_UNAVAILABLE") {
		return `${provider} is temporarily unavailable. Please try again.`;
	}

	return `Failed to fetch data from ${provider}.`;
}

function getRetryAfterMs(error: AxiosError): number | undefined {
	const retryAfterHeader = error.response?.headers?.["retry-after"];
	if (!retryAfterHeader) {
		return undefined;
	}

	const value = Array.isArray(retryAfterHeader)
		? retryAfterHeader[0]
		: retryAfterHeader;
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return undefined;
	}

	return parsed * 1000;
}

export function toIntegrationError(
	provider: IntegrationProvider,
	operation: IntegrationOperation,
	error: unknown,
): IntegrationError {
	if (error instanceof IntegrationError) {
		return error;
	}

	if (axios.isAxiosError(error)) {
		const upstreamStatus = error.response?.status;
		const isTimeout = error.code === "ECONNABORTED";
		const isNetworkError = !error.response;
		const retryAttempts = getRetryAttempts(error);
		const retryAfterMs = getRetryAfterMs(error);
		const retryable =
			isTimeout ||
			isNetworkError ||
			upstreamStatus === 429 ||
			(upstreamStatus !== undefined && upstreamStatus >= 500);
		const suggestedBackoffMs = retryAfterMs ?? 2000;
		const code: IntegrationErrorCode =
			upstreamStatus === 429
				? "PROVIDER_RATE_LIMITED"
				: upstreamStatus === 401 || upstreamStatus === 403
					? "PROVIDER_BAD_CONFIG"
					: retryable
						? "PROVIDER_UNAVAILABLE"
						: "PROVIDER_BAD_RESPONSE";

		return new IntegrationError({
			message: `${provider} ${operation} request failed`,
			publicMessage: getPublicMessage(provider, code, upstreamStatus),
			provider,
			operation,
			code,
			retryable,
			statusCode: retryable ? 503 : 502,
			...(upstreamStatus !== undefined ? { upstreamStatus } : {}),
			...(retryAttempts !== undefined ? { retryAttempts } : {}),
			...(retryAfterMs !== undefined ? { retryAfterMs } : {}),
			...(suggestedBackoffMs !== undefined ? { suggestedBackoffMs } : {}),
		});
	}

	return new IntegrationError({
		message: `${provider} ${operation} request failed`,
		publicMessage: `${provider} is temporarily unavailable. Please try again.`,
		provider,
		operation,
		code: "INTERNAL_ERROR",
		retryable: true,
		statusCode: 503,
		suggestedBackoffMs: 2000,
	});
}
