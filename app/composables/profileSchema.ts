import { z } from 'zod';

export function createProfileEditSchema(t: (key: string) => string) {
    return z.object({
        firstName: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('profile.validation.first_name_required')
                        : t('validation.invalid'),
            })
            .min(1, t('profile.validation.first_name_min_length'))
            .max(255, t('profile.validation.first_name_max_length')),

        lastName: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('profile.validation.last_name_required')
                        : t('validation.invalid'),
            })
            .min(1, t('profile.validation.last_name_min_length'))
            .max(255, t('profile.validation.last_name_max_length')),

        email: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('profile.validation.email_required')
                        : t('profile.validation.email_invalid'),
            })
            .email(t('profile.validation.email_invalid'))
            .max(255, t('profile.validation.email_max_length')),

        username: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('profile.validation.username_required')
                        : t('profile.validation.username_max_length'),
            })
            .min(1, t('profile.validation.username_min_length'))
            .max(255, t('profile.validation.username_max_length')),
    });
}

export function createPasswordChangeSchema(t: (key: string) => string) {
    return z.object({
        old_password: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('profile.validation.current_password_required')
                        : t('profile.validation.current_password_required'),
            })
            .min(1, t('profile.validation.current_password_required')),

        new_password: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('profile.validation.new_password_required')
                        : t('validation.invalid'),
            })
            .min(6, t('profile.validation.new_password_min_length'))
            .max(255, t('profile.validation.new_password_max_length')),

        new_password_confirmation: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('profile.validation.confirm_password_required')
                        : t('profile.validation.confirm_password_required'),
            })
            .min(1, t('profile.validation.confirm_password_required')),
    }).refine(data => data.new_password === data.new_password_confirmation, {
        message: t('profile.validation.passwords_do_not_match'),
        path: ['new_password_confirmation'],
    });
}
