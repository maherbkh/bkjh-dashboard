import { z } from 'zod';

export function createTicketCrudSchema(t: (key: string) => string) {
    return z.object({
        name: z
            .string({ required_error: t('tickets.validation.name_required') })
            .min(2, t('tickets.validation.name_min_length'))
            .max(100, t('tickets.validation.name_max_length')),

        message: z
            .string({ required_error: t('tickets.validation.message_required') })
            .min(10, t('tickets.validation.message_min_length'))
            .max(2000, t('tickets.validation.message_max_length')),

        email: z
            .union([
                z.string().email(t('tickets.validation.email_invalid')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),

        phone: z
            .union([
                z.string().min(1, t('tickets.validation.phone_min_length')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),

        cell: z
            .union([
                z.string().min(1, t('tickets.validation.cell_min_length')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),

        deviceId: z
            .union([
                z.string().min(1, t('tickets.validation.device_id_min_length')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),

        groupId: z
            .number({ invalid_type_error: t('tickets.validation.group_invalid') })
            .positive(t('tickets.validation.group_positive'))
            .optional()
            .nullable(),

        categoryId: z
            .number({ invalid_type_error: t('tickets.validation.category_invalid') })
            .positive(t('tickets.validation.category_positive'))
            .optional()
            .nullable(),

        status: z
            .enum(['pending', 'in_progress', 'resolved', 'closed'], {
                required_error: t('tickets.validation.status_required'),
                invalid_type_error: t('tickets.validation.status_invalid'),
            })
            .default('pending'),
    });
}

export type TicketCrudForm = z.infer<ReturnType<typeof createTicketCrudSchema>>;
