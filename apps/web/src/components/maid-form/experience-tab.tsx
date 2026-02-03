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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Language } from '@/lib/api';

interface ExperienceTabProps {
  languages: Language[];
}

export function ExperienceTab({ languages }: ExperienceTabProps) {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="experienceYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Has Prior Experience</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === 'true')}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experienceDetails"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Experience Details</FormLabel>
              <FormControl>
                <Input
                  placeholder="Brief description of experience (max 70 chars)"
                  maxLength={70}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {(field.value?.length || 0)}/70 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cookingSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cooking Skills</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="willing_to_learn">Willing to Learn</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="babySitter"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Baby Sitter</FormLabel>
                <FormDescription>
                  Can take care of children
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skillsDetails"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Skills Details</FormLabel>
              <FormControl>
                <Input
                  placeholder="Additional skills (max 70 chars)"
                  maxLength={70}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {(field.value?.length || 0)}/70 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="languageIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Languages Spoken</FormLabel>
            <div className="grid gap-2 md:grid-cols-4">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value?.includes(lang.id)}
                    onCheckedChange={(checked) => {
                      const current = field.value || [];
                      if (checked) {
                        field.onChange([...current, lang.id]);
                      } else {
                        field.onChange(current.filter((id: string) => id !== lang.id));
                      }
                    }}
                  />
                  <label className="text-sm">{lang.nameEn}</label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (English)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description about the worker..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bioAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (Arabic)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="وصف مختصر عن العامل..."
                  className="min-h-[100px]"
                  dir="rtl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
