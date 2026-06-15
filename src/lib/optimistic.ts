import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============ TYPES ============

interface OptimisticConfig<TData, TInput> {
  queryKey: string[]
  newData: TData | ((old: TData | undefined, input: TInput) => TData)
  apiCall: () => Promise<{ success: boolean; data?: TData; error?: string }>
  successMessage?: string
  errorMessage?: string
  rollbackMessage?: string
}

// ============ OPTIMISTIC UPDATE ============

/**
 * Perform an optimistic update with automatic rollback on failure.
 *
 * Immediately updates the React Query cache with `newData`, fires the
 * `apiCall` in the background, and rolls back if the call fails.
 *
 * @example
 * ```ts
 * optimisticUpdate(queryClient, {
 *   queryKey: ['tickets', ticketId],
 *   newData: (old) => ({ ...old!, status: 'completed' }),
 *   apiCall: () => apiClient.put(`/api/maintenance/tickets/${ticketId}`, { status: 'completed' }),
 *   successMessage: 'Ticket updated',
 *   errorMessage: 'Failed to update ticket',
 * })
 * ```
 */
export async function optimisticUpdate<TData, TInput>(
  queryClient: QueryClient,
  config: OptimisticConfig<TData, TInput>
): Promise<void> {
  const {
    queryKey,
    newData,
    apiCall,
    successMessage,
    errorMessage = 'Something went wrong. Please try again.',
    rollbackMessage = 'Changes were reverted.',
  } = config

  // Cancel any outgoing refetches so they don't overwrite our optimistic update
  await queryClient.cancelQueries({ queryKey })

  // Snapshot the previous value
  const previousData = queryClient.getQueryData<TData>(queryKey)

  // Optimistically update to the new value
  queryClient.setQueryData<TData>(queryKey, (old) => {
    if (typeof newData === 'function') {
      return (newData as (old: TData | undefined, input: TInput) => TData)(old, undefined as TInput)
    }
    return newData
  })

  try {
    const result = await apiCall()

    if (result.success) {
      // Optionally sync the server response back into the cache
      if (result.data !== undefined) {
        queryClient.setQueryData<TData>(queryKey, result.data)
      }
      if (successMessage) {
        toast.success(successMessage)
      }
    } else {
      // Rollback on API-reported failure
      queryClient.setQueryData<TData>(queryKey, previousData)
      toast.error(result.error || errorMessage)
    }
  } catch {
    // Rollback on unexpected error
    queryClient.setQueryData<TData>(queryKey, previousData)
    toast.error(errorMessage)
  } finally {
    // Always refetch after settling to ensure cache is in sync
    queryClient.invalidateQueries({ queryKey })
  }
}