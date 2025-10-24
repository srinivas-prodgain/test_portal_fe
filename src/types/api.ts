import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export type TApiResponse<T = undefined> = {
  message: string
  data?: T
}

export type TApiError = AxiosError<{
  message: string
  error?: string
}>

export type TApiPromise<T> = Promise<T>

export type TQueryOpts<TData> = Omit<
  UseQueryOptions<TData, TApiError>,
  'queryKey' | 'queryFn'
>

export type TMutationOpts<TPayload, TResponse> = Omit<
  UseMutationOptions<TResponse, TApiError, TPayload>,
  'mutationKey' | 'mutationFn'
>

