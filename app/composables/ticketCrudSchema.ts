import { z } from 'zod';

export function createTicketCrudSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({ required_error: t('global.name') + ' ' + t('validation.required') })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),

        message: z
            .string({ required_error: t('global.message') + ' ' + t('validation.required') })
            .min(10, t('global.message') + ' ' + t('validation.min_length', { min: 10 }))
            .max(2000, t('global.message') + ' ' + t('validation.max_length', { max: 2000 })),

        email: z
            .union([
                z.string().email(t('form.email') + ' ' + t('validation.invalid')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),

        phone: z
            .union([
                z.string().min(1, t('form.phone') + ' ' + t('validation.min_length', { min: 1 })),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),

        cell: z
            .union([
                z.string().min(1, t('form.cell') + ' ' + t('validation.min_length', { min: 1 })),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),

        deviceId: z
            .union([
                z.string().min(1, t('form.device_id') + ' ' + t('validation.min_length', { min: 1 })),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),

        groupId: z
            .number({ invalid_type_error: t('group.singular') + ' ' + t('validation.invalid') })
            .positive(t('group.singular') + ' ' + t('validation.positive'))
            .optional()
            .nullable(),

        categoryId: z
            .number({ invalid_type_error: t('category.singular') + ' ' + t('validation.invalid') })
            .positive(t('category.singular') + ' ' + t('validation.positive'))
            .optional()
            .nullable(),

        status: z
            .enum(['pending', 'in_progress', 'resolved', 'closed'], {
                required_error: t('common.status') + ' ' + t('validation.required'),
                invalid_type_error: t('common.status') + ' ' + t('validation.invalid'),
            })
            .default('pending'),
    });
}

export type TicketCrudForm = z.infer<ReturnType<typeof createTicketCrudSchema>>;
