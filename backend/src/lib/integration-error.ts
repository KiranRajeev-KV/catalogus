import axios, { type AxiosError } from "axios";

export type IntegrationProvider = "TMDB" | "ANILIST";
export type IntegrationOperation = "search" | "details";

type IntegrationErrorInput = {
	message: string;
	publicMessage: string;
	provider: IntegrationProvider;
	operation: IntegrationOperation;
	retryable: boolean;
	statusCode: number;
	upstreamStatus?: number;
	retryAttempts?: number;
};

export class IntegrationError extends Error {
	public readonly publicMessage: string;
	public readonly provider: IntegrationProvider;
	public readonly operation: IntegrationOperation;
	public readonly retryable: boolean;
	public readonly statusCode: number;
	public readonly upstreamStatus?: number;
	public readonly retryAttempts?: number;

	constructor(input: IntegrationErrorInput) {
		super(input.message);
		this.name = "IntegrationError";
		this.publicMessage = input.publicMessage;
		this.provider = input.provider;
		this.operation = input.operation;
		this.retryable = input.retryable;
		this.statusCode = input.statusCode;
		if (input.upstreamStatus !== undefined) {
			this.upstreamStatus = input.upstreamStatus;
		}
		if (input.retryAttempts !== undefined) {
			this.retryAttempts = input.retryAttempts;
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
	retryable: boolean,
	upstreamStatus?: number,
): string {
	if (upstreamStatus === 401 || upstreamStatus === 403) {
		return `${provider} integration is not configured correctly.`;
	}

	if (retryable) {
		return `${provider} is temporarily unavailable. Please try again.`;
	}

	return `Failed to fetch data from ${provider}.`;
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
		const retryable =
			isTimeout ||
			isNetworkError ||
			upstreamStatus === 429 ||
			(upstreamStatus !== undefined && upstreamStatus >= 500);

		return new IntegrationError({
			message: `${provider} ${operation} request failed`,
			publicMessage: getPublicMessage(provider, retryable, upstreamStatus),
			provider,
			operation,
			retryable,
			statusCode: retryable ? 503 : 502,
			...(upstreamStatus !== undefined ? { upstreamStatus } : {}),
			...(retryAttempts !== undefined ? { retryAttempts } : {}),
		});
	}

	return new IntegrationError({
		message: `${provider} ${operation} request failed`,
		publicMessage: `${provider} is temporarily unavailable. Please try again.`,
		provider,
		operation,
		retryable: true,
		statusCode: 503,
	});
}
