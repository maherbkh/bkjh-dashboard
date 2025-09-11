import { z } from 'zod';

export function createCategorySchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({ required_error: t('global.name') + ' ' + t('validation.required') })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),
        position: z
            .number({ required_error: t('position.singular') + ' ' + t('validation.required') })
            .min(0, t('position.singular') + ' ' + t('validation.min_value', { min: 0 }))
            .max(9999, t('position.singular') + ' ' + t('validation.max_value', { max: 9999 })),
        isActive: z
            .boolean({ required_error: t('status.singular') + ' ' + t('validation.required') })
            .default(true),
        parentId: z
            .string()
            .nullable()
            .optional(),
    });
}

export type CategoryForm = z.infer<ReturnType<typeof createCategorySchema>>;
