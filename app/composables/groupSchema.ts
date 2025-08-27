import { z } from 'zod';

export function createGroupSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({ required_error: t('global.name') + ' ' + t('validation.required') })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),
        address_id: z
            .number()
            .optional()
            .nullable(),
        company_ids: z
            .array(z.number())
            .optional()
            .default([]),
    });
}

export type GroupForm = z.infer<ReturnType<typeof createGroupSchema>>;
