import { z } from "zod";

export function createEventTargetSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    code: z
      .string({ required_error: t('event_target.code') + ' ' + t('validation.required') })
      .min(1, t('event_target.code') + ' ' + t('validation.min_length', { min: 1 }))
      .max(10, t('event_target.code') + ' ' + t('validation.max_length', { max: 10 }))
      .regex(/^[A-Z0-9_]+$/, t('event_target.code') + ' ' + t('validation.code_format')),

    name: z
      .string({ required_error: t('global.name') + ' ' + t('validation.required') })
      .min(1, t('global.name') + ' ' + t('validation.min_length', { min: 1 }))
      .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),

    slug: z
      .string()
      .max(100, t('event_target.slug') + ' ' + t('validation.max_length', { max: 100 }))
      .regex(/^[a-z0-9-]+$/, t('event_target.slug') + ' ' + t('validation.slug_format'))
      .optional(),

    position: z
      .number({ required_error: t('common.position') + ' ' + t('validation.required') })
      .int(t('common.position') + ' ' + t('validation.integer'))
      .min(0, t('common.position') + ' ' + t('validation.min_value', { min: 0 }))
      .optional()
      .default(0),
  });
}

export type EventTargetForm = z.infer<ReturnType<typeof createEventTargetSchema>>;
