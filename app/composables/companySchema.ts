import { z } from 'zod';

export function createCompanySchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({ required_error: t('global.name') + ' ' + t('validation.required') })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(255, t('global.name') + ' ' + t('validation.max_length', { max: 255 })),

        location: z
            .string({ required_error: t('location.singular') + ' ' + t('validation.required') })
            .min(2, t('location.singular') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('location.singular') + ' ' + t('validation.max_length', { max: 100 })),

        register: z
            .string({ required_error: t('common.register') + ' ' + t('validation.required') })
            .min(5, t('common.register') + ' ' + t('validation.min_length', { min: 5 }))
            .max(255, t('common.register') + ' ' + t('validation.max_length', { max: 255 })),

        partner: z.object({
            name: z
                .string({ required_error: t('partner.singular') + ' ' + t('validation.required') })
                .min(2, t('partner.singular') + ' ' + t('validation.min_length', { min: 2 }))
                .max(255, t('partner.singular') + ' ' + t('validation.max_length', { max: 255 })),
            
            location: z
                .string({ required_error: t('partner.location') + ' ' + t('validation.required') })
                .min(2, t('partner.location') + ' ' + t('validation.min_length', { min: 2 }))
                .max(100, t('partner.location') + ' ' + t('validation.max_length', { max: 100 })),
            
            register: z
                .string({ required_error: t('partner.register') + ' ' + t('validation.required') })
                .min(5, t('partner.register') + ' ' + t('validation.min_length', { min: 5 }))
                .max(255, t('partner.register') + ' ' + t('validation.max_length', { max: 255 })),
        }),

        management: z
            .string({ required_error: t('global.management') + ' ' + t('validation.required') })
            .min(2, t('global.management') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('global.management') + ' ' + t('validation.max_length', { max: 100 })),

        addressId: z
            .string({ required_error: t('address.singular') + ' ' + t('validation.required') })
            .nullable()
            .optional(),
    });
}

export type CompanyForm = z.infer<ReturnType<typeof createCompanySchema>>;
