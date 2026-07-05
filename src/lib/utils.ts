/**
 * Sanitize user input by stripping HTML tags and trimming.
 * Prevents stored XSS when content is rendered via dangerouslySetInnerHTML.
 */
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')   // strip HTML tags
    .trim();
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

