import { z } from 'zod';

export function createEventCategorySchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('global.name') + ' ' + t('validation.required')
                        : t('global.name') + ' ' + t('validation.invalid'),
            })
            .min(1, t('global.name') + ' ' + t('validation.min_length', { min: 1 }))
            .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),

        isActive: z.boolean().optional().default(true),

        position: z
            .number({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('common.position') + ' ' + t('validation.required')
                        : t('common.position') + ' ' + t('validation.invalid'),
            })
            .int(t('common.position') + ' ' + t('validation.integer'))
            .min(0, t('common.position') + ' ' + t('validation.min_value', { min: 0 }))
            .optional()
            .default(0),

        parentId: z
            .string()
            .uuid(t('event_category.parent') + ' ' + t('validation.uuid'))
            .nullable()
            .optional()
            .default(null),
    });
}

export type EventCategoryForm = z.infer<ReturnType<typeof createEventCategorySchema>>;
