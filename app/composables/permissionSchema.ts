import { z } from 'zod';

export function createPermissionSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({ required_error: t('global.name') + ' ' + t('validation.required') })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(255, t('global.name') + ' ' + t('validation.max_length', { max: 255 })),
        slug: z
            .string()
            .optional()
            .refine(val => !val || /^[a-z0-9_]+$/.test(val), {
                message: t('global.slug') + ' ' + t('validation.slug_format'),
            }),
        group: z.string().optional(),
        module: z.string().optional(),
        is_active: z.boolean().optional().default(true),
        position: z.number().min(0, t('position.singular') + ' ' + t('validation.min_value', { min: 0 })).optional().default(0),
    });
}

export type PermissionForm = z.infer<ReturnType<typeof createPermissionSchema>>;
