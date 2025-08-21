import { z } from 'zod';

export function createUserSchema(t: (key: string) => string, mode: 'create' | 'edit' = 'create') {
    const baseSchema = {
        firstName: z
            .string({ required_error: t('users.validation.first_name_required') })
            .min(1, t('users.validation.first_name_min_length'))
            .max(255, t('users.validation.first_name_max_length')),

        lastName: z
            .string({ required_error: t('users.validation.last_name_required') })
            .min(1, t('users.validation.last_name_min_length'))
            .max(255, t('users.validation.last_name_max_length')),

        email: z
            .string({ required_error: t('users.validation.email_required') })
            .email(t('users.validation.email_invalid'))
            .max(255, t('users.validation.email_max_length')),

        username: z
            .string({ required_error: t('users.validation.username_required') })
            .min(1, t('users.validation.username_min_length'))
            .max(255, t('users.validation.username_max_length')),

        role_id: z
            .number({ required_error: t('users.validation.role_required') })
            .int(t('users.validation.role_invalid'))
            .positive(t('users.validation.role_invalid')),

        isActive: z
            .boolean()
            .optional(),

        isSuperAdmin: z
            .boolean()
            .optional(),
    };

    // Add password field based on mode
    if (mode === 'create') {
        return z.object({
            ...baseSchema,
            password: z
                .string({ required_error: t('users.validation.password_required') })
                .min(8, t('users.validation.password_min_length'))
                .max(255, t('users.validation.password_max_length')),
        });
    }
    else {
        return z.object({
            ...baseSchema,
            password: z
                .string()
                .min(8, t('users.validation.password_min_length'))
                .max(255, t('users.validation.password_max_length'))
                .optional(),
        });
    }
}

export type UserForm = z.infer<ReturnType<typeof createUserSchema>>;
