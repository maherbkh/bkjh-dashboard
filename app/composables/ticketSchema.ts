import { z } from 'zod';

export function createTicketSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        requester: z.object({
            name: z
                .string({
                    error: (issue: { input?: unknown }) =>
                        issue.input === undefined
                            ? t('requester.name') + ' ' + t('validation.required')
                            : t('requester.name') + ' ' + t('validation.invalid'),
                })
                .min(2, t('requester.name') + ' ' + t('validation.min_length', { min: 2 }))
                .max(100, t('requester.name') + ' ' + t('validation.max_length', { max: 100 })),
            email: z
                .string({
                    error: (issue: { input?: unknown }) =>
                        issue.input === undefined
                            ? t('requester.email') + ' ' + t('validation.required')
                            : t('requester.email') + ' ' + t('validation.invalid_email'),
                })
                .email(t('requester.email') + ' ' + t('validation.invalid_email')),
            phone: z
                .string({
                    error: (issue: { input?: unknown }) =>
                        issue.input === undefined
                            ? t('requester.phone') + ' ' + t('validation.required')
                            : t('requester.phone') + ' ' + t('validation.invalid'),
                })
                .min(10, t('requester.phone') + ' ' + t('validation.min_length', { min: 10 }))
                .max(20, t('requester.phone') + ' ' + t('validation.max_length', { max: 20 })),
            cell: z
                .string()
                .nullable()
                .optional(),
        }),
        groupId: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('group.singular') + ' ' + t('validation.required')
                        : t('group.singular') + ' ' + t('validation.invalid'),
            }),
        ticketCategoryId: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('category.singular') + ' ' + t('validation.required')
                        : t('category.singular') + ' ' + t('validation.invalid'),
            }),
        message: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('message.singular') + ' ' + t('validation.required')
                        : t('message.singular') + ' ' + t('validation.invalid'),
            })
            .min(10, t('message.singular') + ' ' + t('validation.min_length', { min: 10 }))
            .max(5000, t('message.singular') + ' ' + t('validation.max_length', { max: 5000 })),
        type: z
            .enum(['TICKET', 'TASK'], {
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('type.singular') + ' ' + t('validation.required')
                        : t('type.singular') + ' ' + t('validation.invalid'),
            }),
        adminId: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('admin.singular') + ' ' + t('validation.required')
                        : t('admin.singular') + ' ' + t('validation.invalid'),
            }),
        deviceId: z
            .string()
            .optional(),
    });
}

export type TicketForm = z.infer<ReturnType<typeof createTicketSchema>>;
