import { z } from 'zod';

export function createProfileEditSchema(t: (key: string) => string) {
    return z.object({
        firstName: z
            .string({ required_error: t('profile.validation.first_name_required') })
            .min(1, t('profile.validation.first_name_min_length'))
            .max(255, t('profile.validation.first_name_max_length')),

        lastName: z
            .string({ required_error: t('profile.validation.last_name_required') })
            .min(1, t('profile.validation.last_name_min_length'))
            .max(255, t('profile.validation.last_name_max_length')),

        email: z
            .string({ required_error: t('profile.validation.email_required') })
            .email(t('profile.validation.email_invalid'))
            .max(255, t('profile.validation.email_max_length')),

        username: z
            .string({ required_error: t('profile.validation.username_required') })
            .min(1, t('profile.validation.username_min_length'))
            .max(255, t('profile.validation.username_max_length')),
    });
}

export function createPasswordChangeSchema(t: (key: string) => string) {
    return z.object({
        old_password: z
            .string({ required_error: t('profile.validation.current_password_required') })
            .min(1, t('profile.validation.current_password_required')),

        new_password: z
            .string({ required_error: t('profile.validation.new_password_required') })
            .min(6, t('profile.validation.new_password_min_length'))
            .max(255, t('profile.validation.new_password_max_length')),

        new_password_confirmation: z
            .string({ required_error: t('profile.validation.confirm_password_required') })
            .min(1, t('profile.validation.confirm_password_required')),
    }).refine(data => data.new_password === data.new_password_confirmation, {
        message: t('profile.validation.passwords_do_not_match'),
        path: ['new_password_confirmation'],
    });
}
