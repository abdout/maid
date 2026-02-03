import { useToastContext } from '@/context/toast-context';

/**
 * Hook to show toast notifications
 *
 * @example
 * const toast = useToast();
 * toast.success('Saved!');
 * toast.error('Failed to save');
 * toast.warning('Check your input');
 * toast.info('Processing...');
 */
export function useToast() {
  const context = useToastContext();

  return {
    /**
     * Show a success toast (green)
     * @param message The message to display
     * @param title Optional title
     */
    success: context.success,

    /**
     * Show an error toast (red)
     * @param message The message to display
     * @param title Optional title
     */
    error: context.error,

    /**
     * Show a warning toast (yellow)
     * @param message The message to display
     * @param title Optional title
     */
    warning: context.warning,

    /**
     * Show an info toast (blue)
     * @param message The message to display
     * @param title Optional title
     */
    info: context.info,

    /**
     * Show a toast with custom configuration
     * @param config Toast configuration object
     */
    show: context.showToast,

    /**
     * Hide a specific toast by ID
     * @param id The toast ID to hide
     */
    hide: context.hideToast,
  };
}
