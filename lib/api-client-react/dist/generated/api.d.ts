import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ErrorResponse, GrandChallengeClaimResponse, HealthStatus, PlayerSaveInput, PlayerSaveResponse } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPlayerSaveUrl: () => string;
/**
 * @summary Get the signed-in player's cloud save
 */
export declare const getPlayerSave: (options?: RequestInit) => Promise<PlayerSaveResponse>;
export declare const getGetPlayerSaveQueryKey: () => readonly ["/api/player/save"];
export declare const getGetPlayerSaveQueryOptions: <TData = Awaited<ReturnType<typeof getPlayerSave>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPlayerSave>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPlayerSave>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPlayerSaveQueryResult = NonNullable<Awaited<ReturnType<typeof getPlayerSave>>>;
export type GetPlayerSaveQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get the signed-in player's cloud save
 */
export declare function useGetPlayerSave<TData = Awaited<ReturnType<typeof getPlayerSave>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPlayerSave>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSavePlayerGameUrl: () => string;
/**
 * @summary Save the signed-in player's game progress
 */
export declare const savePlayerGame: (playerSaveInput: PlayerSaveInput, options?: RequestInit) => Promise<PlayerSaveResponse>;
export declare const getSavePlayerGameMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof savePlayerGame>>, TError, {
        data: BodyType<PlayerSaveInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof savePlayerGame>>, TError, {
    data: BodyType<PlayerSaveInput>;
}, TContext>;
export type SavePlayerGameMutationResult = NonNullable<Awaited<ReturnType<typeof savePlayerGame>>>;
export type SavePlayerGameMutationBody = BodyType<PlayerSaveInput>;
export type SavePlayerGameMutationError = ErrorType<ErrorResponse>;
/**
* @summary Save the signed-in player's game progress
*/
export declare const useSavePlayerGame: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof savePlayerGame>>, TError, {
        data: BodyType<PlayerSaveInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof savePlayerGame>>, TError, {
    data: BodyType<PlayerSaveInput>;
}, TContext>;
export declare const getClaimGrandChallengeRewardUrl: () => string;
/**
 * Awards 1,000,000 coins once per signed-in player after all three required daily missions are completed.
 * @summary Claim the one-time Grand Challenge reward
 */
export declare const claimGrandChallengeReward: (options?: RequestInit) => Promise<GrandChallengeClaimResponse>;
export declare const getClaimGrandChallengeRewardMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof claimGrandChallengeReward>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof claimGrandChallengeReward>>, TError, void, TContext>;
export type ClaimGrandChallengeRewardMutationResult = NonNullable<Awaited<ReturnType<typeof claimGrandChallengeReward>>>;
export type ClaimGrandChallengeRewardMutationError = ErrorType<ErrorResponse>;
/**
* @summary Claim the one-time Grand Challenge reward
*/
export declare const useClaimGrandChallengeReward: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof claimGrandChallengeReward>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof claimGrandChallengeReward>>, TError, void, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map