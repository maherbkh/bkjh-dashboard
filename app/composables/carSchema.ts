import { z } from 'zod';

export function createCarSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    const maxSchema = z.preprocess(
        (value) => {
            if (value === '' || value === undefined) return null;
            return value;
        },
        z
            .number({
                error: () => t('car.max') + ' ' + t('validation.invalid'),
            })
            .int(t('car.max') + ' ' + t('validation.integer'))
            .min(1, t('car.max') + ' ' + t('validation.min_value', { min: 1 }))
            .max(999999, t('car.max') + ' ' + t('validation.max', { max: 999999 }))
            .nullable(),
    );

    return z
        .object({
            model: z
                .string({
                    error: (issue: { input?: unknown }) =>
                        issue.input === undefined
                            ? t('car.model') + ' ' + t('validation.required')
                            : t('car.model') + ' ' + t('validation.invalid'),
                })
                .trim()
                .min(1, t('car.model') + ' ' + t('validation.required'))
                .max(100, t('car.model') + ' ' + t('validation.max_length', { max: 100 })),
            plateNumber: z
                .string({
                    error: (issue: { input?: unknown }) =>
                        issue.input === undefined
                            ? t('car.plate_number') + ' ' + t('validation.required')
                            : t('car.plate_number') + ' ' + t('validation.invalid'),
                })
                .trim()
                .min(1, t('car.plate_number') + ' ' + t('validation.required'))
                .max(10, t('car.plate_number') + ' ' + t('validation.max_length', { max: 10 }))
                .transform(value => value.toUpperCase()),
            type: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
            automatic: z.boolean().optional().default(false),
            max: maxSchema.optional().default(null),
        })
        .superRefine((values, ctx) => {
            const isElectricOrHybrid = values.type === 'electric' || values.type === 'hybrid';
            const hasMax = values.max !== null && values.max !== undefined;

            if (isElectricOrHybrid && !hasMax) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['max'],
                    message: t('dashboard.booking.cars.errors.max_required_for_electric_hybrid'),
                });
            }

            if (!isElectricOrHybrid && hasMax) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['max'],
                    message: t('dashboard.booking.cars.errors.max_must_be_null_for_fuel_types'),
                });
            }
        });
}

export type CarForm = z.infer<ReturnType<typeof createCarSchema>>;
