import { z } from 'zod';

export function createPermissionSchema(t: (key: string) => string) {
    return z.object({
        name: z
            .string({ required_error: t('permissions.validation.name_required') })
            .min(2, t('permissions.validation.name_min_length'))
            .max(255, t('permissions.validation.name_max_length')),
        slug: z
            .string()
            .optional()
            .refine(val => !val || /^[a-z0-9_]+$/.test(val), {
                message: t('permissions.validation.slug_format'),
            }),
        group: z.string().optional(),
        module: z.string().optional(),
        is_active: z.boolean().optional().default(true),
        position: z.number().min(0).optional().default(0),
    });
}

export type PermissionForm = z.infer<ReturnType<typeof createPermissionSchema>>;
