import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============ ধরন (TYPES) ============

interface OptimisticConfig<TData, TInput> {
  queryKey: string[]
  newData: TData | ((old: TData | undefined, input: TInput) => TData)
  apiCall: () => Promise<{ success: boolean; data?: TData; error?: string }>
  successMessage?: string
  errorMessage?: string
  rollbackMessage?: string
}

// ============ অপটিমিস্টিক আপডেট ============

/**
 * ব্যর্থ হলে স্বয়ংক্রিয়ভাবে রোলব্যাক সহ একটি অপটিমিস্টিক আপডেট সম্পাদন করা হচ্ছে।
 *
 * সাথে সাথে React Query ক্যাশে `newData` দিয়ে আপডেট করা হচ্ছে, ব্যাকগ্রাউন্ডে
 * `apiCall` চালানো হচ্ছে, এবং কল ব্যর্থ হলে রোলব্যাক করা হচ্ছে।
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

  // চলমান রিফেচ বাতিল করা হচ্ছে যাতে এগুলো আমাদের অপটিমিস্টিক আপডেট ওভাররাইট না করে
  await queryClient.cancelQueries({ queryKey })

  // পূর্ববর্তী মানের স্ন্যাপশট নেওয়া হচ্ছে
  const previousData = queryClient.getQueryData<TData>(queryKey)

  // নতুন মান দিয়ে অপটিমিস্টিক্যালি আপডেট করা হচ্ছে
  queryClient.setQueryData<TData>(queryKey, (old) => {
    if (typeof newData === 'function') {
      return (newData as (old: TData | undefined, input: TInput) => TData)(old, undefined as TInput)
    }
    return newData
  })

  try {
    const result = await apiCall()

    if (result.success) {
      // ঐচ্ছিকভাবে সার্ভার প্রতিক্রিয়া ক্যাশে সিঙ্ক করা হচ্ছে
      if (result.data !== undefined) {
        queryClient.setQueryData<TData>(queryKey, result.data)
      }
      if (successMessage) {
        toast.success(successMessage)
      }
    } else {
      // API রিপোর্ট করা ব্যর্থতায় রোলব্যাক করা হচ্ছে
      queryClient.setQueryData<TData>(queryKey, previousData)
      toast.error(result.error || errorMessage)
    }
  } catch {
    // অপ্রত্যাশিত ত্রুটিতে রোলব্যাক করা হচ্ছে
    queryClient.setQueryData<TData>(queryKey, previousData)
    toast.error(errorMessage)
  } finally {
    // ক্যাশে সিঙ্ক আছে তা নিশ্চিত করতে সমাপ্তির পর সর্বদা রিফেচ করা হচ্ছে
    queryClient.invalidateQueries({ queryKey })
  }
}