'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function PricingTab() {
  const form = useFormContext();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FormField
        control={form.control}
        name="salary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monthly Salary (AED) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g. 2000"
                min="0"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Monthly salary in AED
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="officeFees"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Office Fees (AED)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g. 5000"
                min="0"
                {...field}
              />
            </FormControl>
            <FormDescription>
              One-time office/agency fees
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
