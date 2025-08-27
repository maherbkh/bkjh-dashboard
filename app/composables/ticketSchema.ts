import { z } from 'zod';

export function createTicketSubmissionSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({ required_error: t('global.name') + ' ' + t('validation.required') })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(255, t('global.name') + ' ' + t('validation.max_length', { max: 255 })),
        message: z
            .string({ required_error: t('global.message') + ' ' + t('validation.required') })
            .min(10, t('global.message') + ' ' + t('validation.min_length', { min: 10 }))
            .max(5000, t('global.message') + ' ' + t('validation.max_length', { max: 5000 })),
        email: z
            .union([
                z.string()
                    .email(t('form.email') + ' ' + t('validation.invalid'))
                    .max(255, t('form.email') + ' ' + t('validation.max_length', { max: 255 }))
                    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, t('form.email') + ' ' + t('validation.invalid')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),
        phone: z
            .string({ required_error: t('form.phone') + ' ' + t('validation.required') })
            .min(5, t('form.phone') + ' ' + t('validation.min_length', { min: 5 }))
            .max(16, t('form.phone') + ' ' + t('validation.max_length', { max: 16 }))
            .regex(/^[+]?[0-9\s\-()]+$/, t('form.phone') + ' ' + t('validation.invalid')),
        cell: z
            .union([
                z.string()
                    .min(5, t('form.cell') + ' ' + t('validation.min_length', { min: 5 }))
                    .max(16, t('form.cell') + ' ' + t('validation.max_length', { max: 16 }))
                    .regex(/^[+]?[0-9\s\-()]+$/, t('form.cell') + ' ' + t('validation.invalid')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),
        device_id: z
            .union([
                z.string()
                    .max(255, t('form.device_id') + ' ' + t('validation.max_length', { max: 255 }))
                    .regex(/^[a-zA-Z0-9\-_]+$/, t('form.device_id') + ' ' + t('validation.invalid')),
                z.literal(''),
                z.literal(null),
            ])
            .optional(),
        group_id: z
            .union([
                z.number().min(1, t('group.singular') + ' ' + t('validation.min_value', { min: 1 })),
                z.literal(null),
            ])
            .optional(),
        category_id: z
            .number({ required_error: t('category.singular') + ' ' + t('validation.required') })
            .min(1, t('category.singular') + ' ' + t('validation.min_value', { min: 1 })),
    });
}

export type TicketSubmissionForm = z.infer<ReturnType<typeof createTicketSubmissionSchema>>;
