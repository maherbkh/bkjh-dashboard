import { z } from 'zod';

export function createUserSchema(
    t: (key: string, params?: Record<string, string | number>) => string,
    mode: 'create' | 'edit' = 'create',
) {
    // Shared rules
    const baseSchema = {
        firstName: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('user.first_name') + ' ' + t('validation.required')
                        : t('user.first_name') + ' ' + t('validation.invalid'),
            })
            .min(1, t('user.first_name') + ' ' + t('validation.min_length', { min: 1 }))
            .max(255, t('user.first_name') + ' ' + t('validation.max_length', { max: 255 })),

        lastName: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('user.last_name') + ' ' + t('validation.required')
                        : t('user.last_name') + ' ' + t('validation.invalid'),
            })
            .min(1, t('user.last_name') + ' ' + t('validation.min_length', { min: 1 }))
            .max(255, t('user.last_name') + ' ' + t('validation.max_length', { max: 255 })),

        email: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('form.email') + ' ' + t('validation.required')
                        : t('form.email') + ' ' + t('validation.invalid'),
            })
            .email(t('form.email') + ' ' + t('validation.invalid'))
            .max(255, t('form.email') + ' ' + t('validation.max_length', { max: 255 })),

        username: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('user.username') + ' ' + t('validation.required')
                        : t('user.username') + ' ' + t('validation.invalid'),
            })
            .min(1, t('user.username') + ' ' + t('validation.min_length', { min: 1 }))
            .max(255, t('user.username') + ' ' + t('validation.max_length', { max: 255 })),

        role_id: z
            .union([
                z.number().int(t('role.singular') + ' ' + t('validation.integer')).positive(t('role.singular') + ' ' + t('validation.invalid')),
                z.null(),
                z.undefined(),
            ])
            .optional(),

        isActive: z.boolean().optional(),
        isSuperAdmin: z.boolean().optional(),
    };

    // Password validation based on mode
    const getPasswordSchema = () => {
        switch (mode) {
            case 'edit':
                return {
                    password: z
                        .any()
                        .refine(
                            (val) => {
                                if (val === null || val === undefined || val === '') {
                                    return true;
                                }
                                else if (typeof val !== 'string') {
                                    return false;
                                }
                                else {
                                    return val.length >= 8 && val.length <= 255;
                                }
                            },
                            {
                                message: t('form.password') + ' ' + t('validation.min_length', { min: 8 }),
                            },
                        )
                        .optional(),
                };

            case 'create':
            default:
                return {
                    password: z
                        .string({
                            error: (issue: { input?: unknown }) =>
                                issue.input === undefined
                                    ? t('form.password') + ' ' + t('validation.required')
                                    : t('form.password') + ' ' + t('validation.invalid'),
                        })
                        .min(8, t('form.password') + ' ' + t('validation.min_length', { min: 8 }))
                        .max(255, t('form.password') + ' ' + t('validation.max_length', { max: 255 })),
                };
        }
    };

    return z.object({
        ...baseSchema,
        ...getPasswordSchema(),
    });
}

export type UserForm = z.infer<ReturnType<typeof createUserSchema>>;
