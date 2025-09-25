import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';

export { default as Badge } from './Badge.vue';

export const badgeVariants = cva(
    'inline-flex items-center uppercase justify-center rounded-full border px-5 py-0.5 font-medium text-xs w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
    {
        variants: {
            variant: {
                default:
          'bg-primary/80 text-primary-foreground [a&]:hover:bg-primary/90 border-primary',
                secondary:
          'bg-background text-secondary-foreground [a&]:hover:bg-secondary/90 border-secondary',

                destructive:
         'bg-red-300 text-red-800 [a&]:hover:bg-success/90 border-red-400/25',
                success:
          'bg-green-300 text-green-800 [a&]:hover:bg-success/90 border-green-400/25',
          pending:
          'bg-yellow-300 text-yellow-800 [a&]:hover:bg-yellow/90 border-yellow-400/25',
                outline:
          'text-foreground/80 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;
