import { z } from 'zod';

export function createCategorySchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({ required_error: t('global.name') + ' ' + t('validation.required') })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),
    });
}

export type CategoryForm = z.infer<ReturnType<typeof createCategorySchema>>;
