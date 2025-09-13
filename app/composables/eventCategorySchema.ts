import { z } from "zod";

export function createEventCategorySchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    name: z
      .string({ required_error: t('global.name') + ' ' + t('validation.required') })
      .min(1, t('global.name') + ' ' + t('validation.min_length', { min: 1 }))
      .max(100, t('global.name') + ' ' + t('validation.max_length', { max: 100 })),

    isActive: z.boolean().optional().default(true),

    position: z
      .number({ required_error: t('common.position') + ' ' + t('validation.required') })
      .int(t('common.position') + ' ' + t('validation.integer'))
      .min(0, t('common.position') + ' ' + t('validation.min_value', { min: 0 }))
      .optional()
      .default(0),

    parentId: z
      .string()
      .uuid(t('event_category.parent') + ' ' + t('validation.uuid'))
      .nullable()
      .optional()
      .default(null),
  });
}

export type EventCategoryForm = z.infer<ReturnType<typeof createEventCategorySchema>>;
