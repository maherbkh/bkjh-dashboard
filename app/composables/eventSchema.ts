import { z } from 'zod';

// Follow existing validation style used in other CRUD schemas
// - required_error messages composed with translation keys
// - min/max constraints with translated messages
// - uuid validation for foreign keys
// - numeric ranges with int() where applicable

function toMinutes(time: string): number {
    const parts = time.split(':');
    const hours = Number(parts[0] ?? 0);
    const minutes = Number(parts[1] ?? 0);
    return hours * 60 + minutes;
}

function getScheduleItemSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        date: z
            .string({ required_error: t('date.singular') + ' ' + t('validation.required') })
            .min(1, t('date.singular') + ' ' + t('validation.required'))
            .regex(/^\d{4}-\d{2}-\d{2}$/u, t('date.singular') + ' ' + t('validation.date_format')),
        startTime: z
            .string({ required_error: t('event.start_time') + ' ' + t('validation.required') })
            .min(1, t('event.start_time') + ' ' + t('validation.required'))
            .regex(/^\d{2}:\d{2}$/u, t('event.start_time') + ' ' + t('validation.time_format')),
        endTime: z
            .string({ required_error: t('event.end_time') + ' ' + t('validation.required') })
            .min(1, t('event.end_time') + ' ' + t('validation.required'))
            .regex(/^\d{2}:\d{2}$/u, t('event.end_time') + ' ' + t('validation.time_format')),
        note: z.string().max(500, t('note.singular') + ' ' + t('validation.max_length', { max: 500 })).optional().nullable(),
    }).refine(val => toMinutes(val.endTime) > toMinutes(val.startTime), {
        message: t('event.end_time') + ' ' + t('validation.greater_than', { field: t('event.start_time') }),
        path: ['endTime'],
    });
}

function scheduleArrayWithGlobalRules(t: (key: string, params?: Record<string, string | number>) => string) {
    const Item = getScheduleItemSchema(t);
    return z.array(Item).superRefine((items, ctx) => {
        // length 1–30
        if (items.length < 1 || items.length > 30) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('validation.array_length_between', { min: 1, max: 30 }),
                path: [],
            });
        }

        // duplicates and overlaps per date
        const byDate: Record<string, { start: number; end: number; idx: number }[]> = {};
        items.forEach((it, idx) => {
            const key = it.date || '';
            byDate[key] = byDate[key] || [];
            const startMinutes = toMinutes(it.startTime);
            const endMinutes = toMinutes(it.endTime);
            const range = { start: startMinutes, end: endMinutes, idx };

            // duplicates
            const listForDup = byDate[key] || [];
            const dup = listForDup.find(r => r.start === range.start && r.end === range.end);
            if (dup) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('validation.duplicate_item'),
                    path: [idx],
                });
            }

            // overlaps (touching edges allowed)
            const rangesForDate = byDate[key] || [];
            for (const r of rangesForDate) {
                const overlaps = range.start < r.end && range.end > r.start; // strict intersection
                if (overlaps) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('validation.time_overlap'),
                        path: [idx],
                    });
                    break;
                }
            }

            rangesForDate.push(range);
            byDate[key] = rangesForDate;
        });
    });
}

export function createEventSchema(
    t: (key: string, params?: Record<string, string | number>) => string,
) {
    const EventType = z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']);

    return z.object({
        title: z
            .string({ required_error: t('event.title') + ' ' + t('validation.required') })
            .trim()
            .min(1, t('event.title') + ' ' + t('validation.min_length', { min: 1 }))
            .max(200, t('event.title') + ' ' + t('validation.max_length', { max: 200 })),

        description: z
            .string({ required_error: t('form.description') + ' ' + t('validation.required') })
            .max(10000, t('form.description') + ' ' + t('validation.max_length', { max: 10000 })),
        shortDescription: z
            .string({ required_error: t('event.short_description') + ' ' + t('validation.required') })
            .max(500, t('event.short_description') + ' ' + t('validation.max_length', { max: 500 })),
        note: z.string().max(1000, t('note.singular') + ' ' + t('validation.max_length', { max: 1000 })).optional(),

        type: EventType,

        eventCategoryId: z
            .string({ required_error: t('event_category.singular') + ' ' + t('validation.required') })
            .uuid(t('event_category.singular') + ' ' + t('validation.uuid')),
        eventTargetId: z
            .string({ required_error: t('event_target.singular') + ' ' + t('validation.required') })
            .uuid(t('event_target.singular') + ' ' + t('validation.uuid')),
        adminId: z.string().uuid(t('user.admin') + ' ' + t('validation.uuid')).optional(),

        maxCapacity: z
            .number({ required_error: t('event.max_capacity') + ' ' + t('validation.required') })
            .int(t('event.max_capacity') + ' ' + t('validation.integer'))
            .min(1, t('event.max_capacity') + ' ' + t('validation.min_value', { min: 1 }))
            .max(10000, t('event.max_capacity') + ' ' + t('validation.max_value', { max: 10000 })),

        room: z.string().max(200, t('event.room') + ' ' + t('validation.max_length', { max: 200 })).optional(),
        location: z.string().max(200, t('event.location') + ' ' + t('validation.max_length', { max: 200 })).optional(),
        isActive: z.boolean().optional().default(true),
        forKids: z.boolean().optional().default(false),

        cover: z.string().uuid().optional().nullable(),

        speakers: z.array(z.string().uuid(t('speaker.singular') + ' ' + t('validation.uuid'))).optional().default([]),
        schedules: scheduleArrayWithGlobalRules(t).default([]),
    });
}

export function updateEventSchema(
    t: (key: string, params?: Record<string, string | number>) => string,
) {
    const EventType = z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']);

    return z.object({
        title: z
            .string({ required_error: t('event.title') + ' ' + t('validation.required') })
            .trim()
            .min(1, t('event.title') + ' ' + t('validation.min_length', { min: 1 }))
            .max(200, t('event.title') + ' ' + t('validation.max_length', { max: 200 })),
        description: z
            .string({ required_error: t('form.description') + ' ' + t('validation.required') })
            .max(10000, t('form.description') + ' ' + t('validation.max_length', { max: 10000 })),
        shortDescription: z
            .string({ required_error: t('event.short_description') + ' ' + t('validation.required') })
            .max(500, t('event.short_description') + ' ' + t('validation.max_length', { max: 500 })),
        note: z.string().max(1000, t('note.singular') + ' ' + t('validation.max_length', { max: 1000 })).optional(),
        type: EventType,
        eventCategoryId: z
            .string({ required_error: t('event_category.singular') + ' ' + t('validation.required') })
            .uuid(t('event_category.singular') + ' ' + t('validation.uuid')),
        eventTargetId: z
            .string({ required_error: t('event_target.singular') + ' ' + t('validation.required') })
            .uuid(t('event_target.singular') + ' ' + t('validation.uuid')),
        adminId: z.string().uuid(t('user.admin') + ' ' + t('validation.uuid')).optional(),
        maxCapacity: z
            .number({ required_error: t('event.max_capacity') + ' ' + t('validation.required') })
            .int(t('event.max_capacity') + ' ' + t('validation.integer'))
            .min(1, t('event.max_capacity') + ' ' + t('validation.min_value', { min: 1 }))
            .max(10000, t('event.max_capacity') + ' ' + t('validation.max_value', { max: 10000 })),
        room: z.string().max(200, t('event.room') + ' ' + t('validation.max_length', { max: 200 })).optional(),
        location: z.string().max(200, t('event.location') + ' ' + t('validation.max_length', { max: 200 })).optional(),
        isActive: z.boolean().optional().default(true),
        forKids: z.boolean().optional().default(false),
        cover: z.string().uuid().optional().nullable(),
        speakers: z.array(z.string().uuid(t('speaker.singular') + ' ' + t('validation.uuid'))).optional().default([]),
        schedules: scheduleArrayWithGlobalRules(t).default([]),
    });
}

export type EventForm = z.infer<ReturnType<typeof createEventSchema>>;
