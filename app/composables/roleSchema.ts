import { z } from 'zod';

export function createRoleSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({ required_error: t('global.name') + ' ' + t('validation.required') })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(255, t('global.name') + ' ' + t('validation.max_length', { max: 255 })),
        slug: z
            .string()
            .optional()
            .refine(val => !val || /^[a-z0-9-]+$/.test(val), {
                message: t('global.slug') + ' ' + t('validation.slug_format'),
            }),
        is_active: z.preprocess(
            (val) => val ?? true,
            z.boolean()
        ),
        position: z.number().min(0, t('position.singular') + ' ' + t('validation.min_value', { min: 0 })).optional().default(0),
        permission_ids: z.array(z.number()).optional().default([]),
    });
}

export type RoleForm = z.infer<ReturnType<typeof createRoleSchema>>;
