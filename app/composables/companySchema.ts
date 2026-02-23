import { z } from 'zod';

export function createCompanySchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('global.name') + ' ' + t('validation.required')
                        : t('global.name') + ' ' + t('validation.invalid'),
            })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(255, t('global.name') + ' ' + t('validation.max_length', { max: 255 })),

        location: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('location.singular') + ' ' + t('validation.required')
                        : t('location.singular') + ' ' + t('validation.invalid'),
            })
            .min(2, t('location.singular') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('location.singular') + ' ' + t('validation.max_length', { max: 100 })),

        register: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('common.register') + ' ' + t('validation.required')
                        : t('common.register') + ' ' + t('validation.invalid'),
            })
            .min(5, t('common.register') + ' ' + t('validation.min_length', { min: 5 }))
            .max(255, t('common.register') + ' ' + t('validation.max_length', { max: 255 })),

        partner: z.object({
            name: z
                .string({
                    error: (issue: { input?: unknown }) =>
                        issue.input === undefined
                            ? t('partner.singular') + ' ' + t('validation.required')
                            : t('partner.singular') + ' ' + t('validation.invalid'),
                })
                .min(2, t('partner.singular') + ' ' + t('validation.min_length', { min: 2 }))
                .max(255, t('partner.singular') + ' ' + t('validation.max_length', { max: 255 })),

            location: z
                .string({
                    error: (issue: { input?: unknown }) =>
                        issue.input === undefined
                            ? t('partner.location') + ' ' + t('validation.required')
                            : t('partner.location') + ' ' + t('validation.invalid'),
                })
                .min(2, t('partner.location') + ' ' + t('validation.min_length', { min: 2 }))
                .max(100, t('partner.location') + ' ' + t('validation.max_length', { max: 100 })),

            register: z
                .string({
                    error: (issue: { input?: unknown }) =>
                        issue.input === undefined
                            ? t('partner.register') + ' ' + t('validation.required')
                            : t('partner.register') + ' ' + t('validation.invalid'),
                })
                .min(5, t('partner.register') + ' ' + t('validation.min_length', { min: 5 }))
                .max(255, t('partner.register') + ' ' + t('validation.max_length', { max: 255 })),
        }),

        management: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('global.management') + ' ' + t('validation.required')
                        : t('global.management') + ' ' + t('validation.invalid'),
            })
            .min(2, t('global.management') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('global.management') + ' ' + t('validation.max_length', { max: 100 })),

        addressId: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('address.singular') + ' ' + t('validation.required')
                        : t('address.singular') + ' ' + t('validation.invalid'),
            })
            .nullable()
            .optional(),
    });
}

export type CompanyForm = z.infer<ReturnType<typeof createCompanySchema>>;
