import { z } from 'zod';

export function createSpeakerSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        name: z
            .string({ required_error: t('global.name') + ' ' + t('validation.required') })
            .min(1, t('global.name') + ' ' + t('validation.min_length', { min: 1 }))
            .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),

        qualification: z
            .string()
            .max(500, t('speaker.qualification') + ' ' + t('validation.max_length', { max: 500 }))
            .optional(),

        avatar: z.string().uuid().optional().nullable(),

        isActive: z.boolean().optional().default(true),
    });
}

export type SpeakerForm = z.infer<ReturnType<typeof createSpeakerSchema>>;
