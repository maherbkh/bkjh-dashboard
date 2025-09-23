import { z } from 'zod';

// Follow existing validation style used in other CRUD schemas
// - required_error messages composed with translation keys
// - min/max constraints with translated messages
// - uuid validation for foreign keys
// - numeric ranges with int() where applicable

export function createEventSchema(
    t: (key: string, params?: Record<string, string | number>) => string,
) {
    const EventType = z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']);

    const ScheduleItem = z.object({
        date: z
            .string({ required_error: t('date.singular') + ' ' + t('validation.required') })
            .min(1, t('date.singular') + ' ' + t('validation.min_length', { min: 1 })),
        startTime: z
            .string({ required_error: t('event.start_time') + ' ' + t('validation.required') })
            .regex(/^\d{2}:\d{2}$/u, t('event.start_time') + ' ' + t('validation.time_format')),
        endTime: z
            .string({ required_error: t('event.end_time') + ' ' + t('validation.required') })
            .regex(/^\d{2}:\d{2}$/u, t('event.end_time') + ' ' + t('validation.time_format')),
        note: z
            .string()
            .max(1000, t('note.singular') + ' ' + t('validation.max_length', { max: 1000 }))
            .optional(),
    });

    return z.object({
        title: z
            .string({ required_error: t('event.title') + ' ' + t('validation.required') })
            .min(1, t('event.title') + ' ' + t('validation.min_length', { min: 1 }))
            .max(200, t('event.title') + ' ' + t('validation.max_length', { max: 200 })),

        description: z
            .string()
            .max(2000, t('form.description') + ' ' + t('validation.max_length', { max: 2000 }))
            .optional(),

        shortDescription: z
            .string()
            .max(500, t('event.short_description') + ' ' + t('validation.max_length', { max: 500 }))
            .optional(),

        note: z
            .string()
            .max(1000, t('note.singular') + ' ' + t('validation.max_length', { max: 1000 }))
            .optional(),

        type: EventType,

        eventCategoryId: z
            .string()
            .uuid(t('event_category.singular') + ' ' + t('validation.uuid'))
            .nullable()
            .optional()
            .default(null),

        eventTargetId: z
            .string()
            .uuid(t('event_target.singular') + ' ' + t('validation.uuid'))
            .nullable()
            .optional()
            .default(null),

        adminId: z
            .string({ required_error: t('user.admin') + ' ' + t('validation.required') })
            .uuid(t('user.admin') + ' ' + t('validation.uuid')),

        maxCapacity: z
            .number({ required_error: t('event.max_capacity') + ' ' + t('validation.required') })
            .int(t('event.max_capacity') + ' ' + t('validation.integer'))
            .min(1, t('event.max_capacity') + ' ' + t('validation.min_value', { min: 1 }))
            .max(10000, t('event.max_capacity') + ' ' + t('validation.max_value', { max: 10000 })),

        room: z
            .string()
            .max(200, t('event.room') + ' ' + t('validation.max_length', { max: 200 }))
            .optional(),

        location: z
            .string()
            .max(200, t('event.location') + ' ' + t('validation.max_length', { max: 200 }))
            .optional(),

        isActive: z.boolean().optional().default(true),

        schedules: z.array(ScheduleItem).optional().default([]),
    });
}

export type EventForm = z.infer<ReturnType<typeof createEventSchema>>;
