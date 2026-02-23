import { z } from 'zod';

export function createAddressSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        streetName: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('street.singular') + ' ' + t('validation.required')
                        : t('street.singular') + ' ' + t('validation.invalid'),
            })
            .min(2, t('street.singular') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('street.singular') + ' ' + t('validation.max_length', { max: 100 })),

        buildingNumber: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('street_number.singular') + ' ' + t('validation.required')
                        : t('street_number.singular') + ' ' + t('validation.invalid'),
            })
            .min(1, t('street_number.singular') + ' ' + t('validation.min_length', { min: 1 }))
            .max(10, t('street_number.singular') + ' ' + t('validation.max_length', { max: 10 })),

        postalCode: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('postal_code.singular') + ' ' + t('validation.required')
                        : t('postal_code.singular') + ' ' + t('validation.invalid'),
            })
            .length(5, t('postal_code.singular') + ' ' + t('validation.exact_length', { len: 5 })),

        city: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('city.singular') + ' ' + t('validation.required')
                        : t('city.singular') + ' ' + t('validation.invalid'),
            })
            .min(2, t('city.singular') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('city.singular') + ' ' + t('validation.max_length', { max: 100 })),
    });
}

export type AddressForm = z.infer<ReturnType<typeof createAddressSchema>>;
