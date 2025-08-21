import { z } from 'zod';

export function createCategorySchema(t: (key: string) => string) {
    return z.object({
        name: z
            .string({ required_error: t('categories.validation.name_required') })
            .min(2, t('categories.validation.name_min_length'))
            .max(100, t('categories.validation.name_max_length')),
    });
}

export type CategoryForm = z.infer<ReturnType<typeof createCategorySchema>>;
