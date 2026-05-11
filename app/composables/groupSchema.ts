import { z } from 'zod';

export function createGroupSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('global.name') + ' ' + t('validation.required')
                        : t('global.name') + ' ' + t('validation.invalid'),
            })
            .min(2, t('global.name') + ' ' + t('validation.min_length', { min: 2 }))
            .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),
        addressId: z
            .string()
            .optional()
            .nullable(),
        companyIds: z
            .array(z.string())
            .optional()
            .default([]),
        email: z
            .union([z.string(), z.null()])
            .optional()
            .superRefine((val, ctx) => {
                if (val === undefined || val === null || val === '')
                    return;
                if (/\s/.test(val)) {
                    ctx.addIssue({
                        code: 'custom',
                        message: `${t('common.email')} ${t('validation.email_no_whitespace')}`,
                    });
                    return;
                }
                if (!z.string().email().safeParse(val).success) {
                    ctx.addIssue({
                        code: 'custom',
                        message: `${t('common.email')} ${t('validation.email')}`,
                    });
                }
            }),
    });
}
