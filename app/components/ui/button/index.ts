import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
    'cursor-pointer group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-button transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    {
        variants: {
            variant: {
                default:
          'bg-primary text-primary-foreground hover:bg-primary',
                destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline:
          'border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
                secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary hover:border-secondary/80 dark:bg-secondary/60 dark:text-secondary-foreground/80 dark:hover:bg-secondary/50',
                ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                'default': 'h-9 px-4 py-2 has-[>svg]:px-4',
                'sm': 'h-8 rounded-full gap-2 px-4 has-[>svg]:px-2.5',
                'lg': 'h-10 rounded-full px-6 has-[>svg]:px-4',
                'icon': 'size-8 !rounded-lg',
                'icon-sm': 'size-6 !rounded-md',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
