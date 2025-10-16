import { z } from 'zod';

export function createAttendeeSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        firstName: z
            .string({ required_error: t('common.first_name') + ' ' + t('validation.required') })
            .min(2, t('common.first_name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(50, t('common.first_name') + ' ' + t('validation.max_length', { max: 50 })),
        lastName: z
            .string({ required_error: t('common.last_name') + ' ' + t('validation.required') })
            .min(2, t('common.last_name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(50, t('common.last_name') + ' ' + t('validation.max_length', { max: 50 })),
        email: z
            .string({ required_error: t('common.email') + ' ' + t('validation.required') })
            .email(t('common.email') + ' ' + t('validation.invalid_email')),
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
    }).refine((data) => {
        // If isEmployee is true, groupId and occupationId are required
        if (data.isEmployee) {
            return data.groupId && data.occupationId;
        }
        return true;
    }, {
        message: t('validation.employee_fields_required'),
        path: ['groupId'], // This will show the error on the groupId field
    }).refine((data) => {
        // If isEmployee is true, occupationId is required
        if (data.isEmployee) {
            return data.occupationId;
        }
        return true;
    }, {
        message: t('validation.employee_fields_required'),
        path: ['occupationId'], // This will show the error on the occupationId field
    });
}

export type AttendeeForm = z.infer<ReturnType<typeof createAttendeeSchema>>;
