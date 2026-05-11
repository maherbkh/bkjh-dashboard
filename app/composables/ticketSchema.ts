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
            email: z.preprocess(
                val => (val === null || val === undefined || val === '' ? undefined : val),
                z
                    .string({
                        error: () => t('requester.email') + ' ' + t('validation.invalid_email'),
                    })
                    .email(t('requester.email') + ' ' + t('validation.invalid_email'))
                    .optional(),
            ),
            phone: z.preprocess(
                val => (val === null || val === undefined || val === '' ? undefined : val),
                z
                    .string({
                        error: () => t('requester.phone') + ' ' + t('validation.invalid'),
                    })
                    .min(10, t('requester.phone') + ' ' + t('validation.min_length', { min: 10 }))
                    .max(20, t('requester.phone') + ' ' + t('validation.max_length', { max: 20 }))
                    .optional(),
            ),
            cell: z.preprocess(
                val => (val === null || val === undefined || val === '' ? undefined : val),
                z
                    .string({
                        error: () => t('requester.cell') + ' ' + t('validation.invalid'),
                    })
                    .min(10, t('requester.cell') + ' ' + t('validation.min_length', { min: 10 }))
                    .max(20, t('requester.cell') + ' ' + t('validation.max_length', { max: 20 }))
                    .optional(),
            ),
        }),
        /** Select may emit `null` when cleared; optional strings only allow `undefined`. */
        groupId: z.preprocess(
            val => (val === null || val === undefined || val === '' ? undefined : val),
            z.string().optional(),
        ),
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
        adminId: z.preprocess(
            val => (val === null || val === undefined || val === '' ? undefined : val),
            z.string().optional(),
        ),
        deviceId: z.preprocess(
            val => (val === null || val === undefined || val === '' ? undefined : val),
            z.string().optional(),
        ),
    }).superRefine((formData, context) => {
        if (formData.requester.phone || formData.requester.cell) {
            return;
        }

        const message = t('validation.phone_or_cell_required');
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['requester', 'phone'],
            message,
        });
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['requester', 'cell'],
            message,
        });
    });
}

export type TicketForm = z.infer<ReturnType<typeof createTicketSchema>>;
