import { z } from 'zod';

export function createRoleSchema(t: (key: string) => string) {
    return z.object({
        name: z
            .string({ required_error: t('roles.validation.name_required') })
            .min(2, t('roles.validation.name_min_length'))
            .max(255, t('roles.validation.name_max_length')),
        slug: z
            .string()
            .optional()
            .refine(val => !val || /^[a-z0-9-]+$/.test(val), {
                message: t('roles.validation.slug_format'),
            }),
        is_active: z.preprocess(
            (val) => val ?? true,
            z.boolean()
        ),
        position: z.number().min(0).optional().default(0),
        permission_ids: z.array(z.number()).optional().default([]),
    });
}

export type RoleForm = z.infer<ReturnType<typeof createRoleSchema>>;
