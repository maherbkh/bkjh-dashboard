import { z } from 'zod';

export function createCompanySchema(t: (key: string) => string) {
    return z.object({
        name: z
            .string({ required_error: t('companies.validation.name_required') })
            .min(2, t('companies.validation.name_min_length'))
            .max(255, t('companies.validation.name_max_length')),

        location: z
            .string({ required_error: t('companies.validation.location_required') })
            .min(2, t('companies.validation.location_min_length'))
            .max(100, t('companies.validation.location_max_length')),

        register: z
            .string({ required_error: t('companies.validation.register_required') })
            .min(5, t('companies.validation.register_min_length'))
            .max(255, t('companies.validation.register_max_length')),

        partner: z
            .string({ required_error: t('companies.validation.partner_required') })
            .min(2, t('companies.validation.partner_min_length'))
            .max(255, t('companies.validation.partner_max_length')),

        partnerLocation: z
            .string({ required_error: t('companies.validation.partner_location_required') })
            .min(2, t('companies.validation.partner_location_min_length'))
            .max(100, t('companies.validation.partner_location_max_length')),

        partnerRegister: z
            .string({ required_error: t('companies.validation.partner_register_required') })
            .min(5, t('companies.validation.partner_register_min_length'))
            .max(255, t('companies.validation.partner_register_max_length')),

        management: z
            .string({ required_error: t('companies.validation.management_required') })
            .min(2, t('companies.validation.management_min_length'))
            .max(100, t('companies.validation.management_max_length')),

        addressId: z
            .number({ required_error: t('companies.validation.address_required') })
            .nullable()
            .optional(),
    });
}

export type CompanyForm = z.infer<ReturnType<typeof createCompanySchema>>;
