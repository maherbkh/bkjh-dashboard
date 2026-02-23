import { z } from 'zod';

export function createGroupSchema(t: (key: string, params?: Record<string, string | number>) => string) {
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
        addressId: z
            .string()
            .optional()
            .nullable(),
        companyIds: z
            .array(z.string())
            .optional()
            .default([]),
    });
}

export type GroupForm = z.infer<ReturnType<typeof createGroupSchema>>;
