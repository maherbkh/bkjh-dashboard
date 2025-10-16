import { z } from 'zod';

export function createAttendeeSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        firstName: z
            .string({ required_error: t('global.first_name') + ' ' + t('validation.required') })
            .min(2, t('global.first_name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(50, t('global.first_name') + ' ' + t('validation.max_length', { max: 50 })),
        lastName: z
            .string({ required_error: t('global.last_name') + ' ' + t('validation.required') })
            .min(2, t('global.last_name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(50, t('global.last_name') + ' ' + t('validation.max_length', { max: 50 })),
        email: z
            .string({ required_error: t('global.email') + ' ' + t('validation.required') })
            .email(t('global.email') + ' ' + t('validation.invalid_email')),
        groupId: z
            .string()
            .optional()
            .nullable(),
        occupationId: z
            .string()
            .optional()
            .nullable(),
        isEmployee: z
            .boolean({ required_error: t('attendee.is_employee') + ' ' + t('validation.required') })
            .default(false),
        isActive: z
            .boolean({ required_error: t('common.status') + ' ' + t('validation.required') })
            .default(true),
    });
}

export type AttendeeForm = z.infer<ReturnType<typeof createAttendeeSchema>>;
