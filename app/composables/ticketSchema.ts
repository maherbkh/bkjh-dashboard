import { z } from 'zod';

export function createTicketSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        requester: z.object({
            name: z
                .string({ required_error: t('requester.name') + ' ' + t('validation.required') })
                .min(2, t('requester.name') + ' ' + t('validation.min_length', { min: 2 }))
                .max(100, t('requester.name') + ' ' + t('validation.max_length', { max: 100 })),
            email: z
                .string({ required_error: t('requester.email') + ' ' + t('validation.required') })
                .email(t('requester.email') + ' ' + t('validation.invalid_email')),
            phone: z
                .string({ required_error: t('requester.phone') + ' ' + t('validation.required') })
                .min(10, t('requester.phone') + ' ' + t('validation.min_length', { min: 10 }))
                .max(20, t('requester.phone') + ' ' + t('validation.max_length', { max: 20 })),
            cell: z
                .string()
                .nullable()
                .optional(),
        }),
        groupId: z
            .string({ required_error: t('group.singular') + ' ' + t('validation.required') }),
        ticketCategoryId: z
            .string({ required_error: t('category.singular') + ' ' + t('validation.required') }),
        message: z
            .string({ required_error: t('message.singular') + ' ' + t('validation.required') })
            .min(10, t('message.singular') + ' ' + t('validation.min_length', { min: 10 }))
            .max(5000, t('message.singular') + ' ' + t('validation.max_length', { max: 5000 })),
        type: z
            .enum(['TICKET', 'TASK'], {
                required_error: t('type.singular') + ' ' + t('validation.required'),
            }),
        adminId: z
            .string({ required_error: t('admin.singular') + ' ' + t('validation.required') }),
        deviceId: z
            .string()
            .optional(),
    });
}

export type TicketForm = z.infer<ReturnType<typeof createTicketSchema>>;