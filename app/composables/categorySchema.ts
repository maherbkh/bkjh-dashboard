import { z } from 'zod';

export function createCategorySchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('global.name') + ' ' + t('validation.required')
                        : t('global.name') + ' ' + t('validation.invalid'),
            })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),
        position: z
            .number({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('position.singular') + ' ' + t('validation.required')
                        : t('position.singular') + ' ' + t('validation.invalid'),
            })
            .min(0, t('position.singular') + ' ' + t('validation.min_value', { min: 0 }))
            .max(9999, t('position.singular') + ' ' + t('validation.max_value', { max: 9999 })),
        isActive: z
            .boolean({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('common.status') + ' ' + t('validation.required')
                        : t('common.status') + ' ' + t('validation.invalid'),
            })
            .default(true),
        parentId: z
            .string()
            .nullable()
            .optional(),
    });
}

export type CategoryForm = z.infer<ReturnType<typeof createCategorySchema>>;
