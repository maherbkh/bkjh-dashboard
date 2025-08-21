import { z } from 'zod';

export function createTicketSubmissionSchema(t: (key: string) => string) {
    return z.object({
        name: z
            .string({ required_error: t('ticket.validation.name_required') })
            .min(2, t('ticket.validation.name_min_length'))
            .max(255, t('ticket.validation.name_max_length')),
        message: z
            .string({ required_error: t('ticket.validation.message_required') })
            .min(10, t('ticket.validation.message_min_length'))
            .max(5000, t('ticket.validation.message_max_length')),
        email: z
            .union([
                z.string()
                    .email(t('ticket.validation.email_invalid'))
                    .max(255, t('ticket.validation.email_max_length'))
                    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, t('ticket.validation.email_invalid')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),
        phone: z
            .string({ required_error: t('ticket.validation.phone_required') })
            .min(5, t('ticket.validation.phone_min_length'))
            .max(16, t('ticket.validation.phone_max_length'))
            .regex(/^[+]?[0-9\s\-()]+$/, t('ticket.validation.phone_invalid')),
        cell: z
            .union([
                z.string()
                    .min(5, t('ticket.validation.cell_min_length'))
                    .max(16, t('ticket.validation.cell_max_length'))
                    .regex(/^[+]?[0-9\s\-()]+$/, t('ticket.validation.cell_invalid')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),
        device_id: z
            .union([
                z.string()
                    .max(255, t('ticket.validation.device_id_max_length'))
                    .regex(/^[a-zA-Z0-9\-_]+$/, t('ticket.validation.device_id_invalid')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),
        group_id: z
            .union([
                z.number().min(1, t('ticket.validation.group_id_min')),
                z.literal(null),
            ])
            .optional(),
        category_id: z
            .number({ required_error: t('ticket.validation.category_required') })
            .min(1, t('ticket.validation.category_min')),
    });
}

export type TicketSubmissionForm = z.infer<ReturnType<typeof createTicketSubmissionSchema>>;
