import { z } from 'zod';

export function createGroupSchema(t: (key: string) => string) {
    return z.object({
        name: z
            .string({ required_error: t('groups.validation.name_required') })
            .min(2, t('groups.validation.name_min_length'))
            .max(100, t('groups.validation.name_max_length')),
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
