import { z } from 'zod';

export function createAddressSchema(t: (key: string) => string) {
    return z.object({
        street: z
            .string({ required_error: t('addresses.validation.street_required') })
            .min(2, t('addresses.validation.street_min_length'))
            .max(100, t('addresses.validation.street_max_length')),

        postalCode: z
            .string({ required_error: t('addresses.validation.postal_code_required') })
            .length(5, t('addresses.validation.postal_code_exact_length')),

        number: z
            .string({ required_error: t('addresses.validation.number_required') })
            .min(1, t('addresses.validation.number_min_length'))
            .max(10, t('addresses.validation.number_max_length')),

        city: z
            .string({ required_error: t('addresses.validation.city_required') })
            .min(2, t('addresses.validation.city_min_length'))
            .max(100, t('addresses.validation.city_max_length')),
    });
}

export type AddressForm = z.infer<ReturnType<typeof createAddressSchema>>;
