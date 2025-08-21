import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';

export { default as Badge } from './Badge.vue';

export const badgeVariants = cva(
    'inline-flex items-center uppercase justify-center rounded-full border px-5 py-0.5 text-xs font-light w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden shadow-sm',
    {
        variants: {
            variant: {
                default:
          'bg-primary/80 text-primary-foreground [a&]:hover:bg-primary/90 border-primary',
                secondary:
          'bg-background text-secondary-foreground [a&]:hover:bg-secondary/90 border-secondary',

                destructive:
         'bg-destructive/80 text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                success:
          'bg-success/80 text-white [a&]:hover:bg-success/90',
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
