import { z } from 'zod';
import { SettingValueType, AppDomain } from '~/types/settings';

export function createSettingSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        key: z
            .string({ required_error: t('validation.required') })
            .min(1, t('validation.required'))
            .max(255, t('validation.max_length', { max: 255 }))
            .regex(
                /^[a-z0-9._-]+$/,
                t('validation.invalid_key_format') || 'Key must contain only lowercase letters, numbers, dots, underscores, and hyphens',
            ),

        name: z
            .string({ required_error: t('validation.required') })
            .min(1, t('validation.required'))
            .max(255, t('validation.max_length', { max: 255 })),

        description: z
            .string()
            .nullable()
            .optional()
            .or(z.literal('')),

        type: z
            .nativeEnum(SettingValueType)
            .default(SettingValueType.STRING)
            .optional(),

        value: z
            .any()
            .optional()
            .nullable(),

        apps: z
            .array(z.nativeEnum(AppDomain))
            .default([])
            .optional(),

        isPublic: z
            .boolean()
            .default(false)
            .optional(),

        parentId: z
            .string()
            .nullable()
            .optional(),
    })
        .superRefine((data, ctx) => {
        // SECTION type doesn't require a value
            if (data.type === SettingValueType.SECTION) {
                return;
            }
            // For all other types, value is required
            if (data.value === undefined || data.value === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('validation.required'),
                    path: ['value'],
                });
            }
        });
}

export type SettingForm = z.infer<ReturnType<typeof createSettingSchema>>;
