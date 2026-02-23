import { z } from 'zod';

function toMinutes(time: string): number {
    const parts = time.split(':');
    const hours = Number(parts[0] ?? 0);
    const minutes = Number(parts[1] ?? 0);
    return hours * 60 + minutes;
}

function getWorkshopScheduleItemSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    return z.object({
        id: z.string().uuid().optional(),
        date: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('date.singular') + ' ' + t('validation.required')
                        : t('date.singular') + ' ' + t('validation.invalid'),
            })
            .min(1, t('date.singular') + ' ' + t('validation.required'))
            .regex(/^\d{4}-\d{2}-\d{2}$/u, t('date.singular') + ' ' + t('validation.date_format')),
        startTime: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.start_time') + ' ' + t('validation.required')
                        : t('event.start_time') + ' ' + t('validation.invalid'),
            })
            .min(1, t('event.start_time') + ' ' + t('validation.required'))
            .regex(/^\d{2}:\d{2}$/u, t('event.start_time') + ' ' + t('validation.time_format'))
            .max(5),
        endTime: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.end_time') + ' ' + t('validation.required')
                        : t('event.end_time') + ' ' + t('validation.invalid'),
            })
            .min(1, t('event.end_time') + ' ' + t('validation.required'))
            .regex(/^\d{2}:\d{2}$/u, t('event.end_time') + ' ' + t('validation.time_format'))
            .max(5),
        note: z.string().max(500, t('note.singular') + ' ' + t('validation.max_length', { max: 500 })).optional().nullable(),
    }).refine(val => toMinutes(val.endTime) > toMinutes(val.startTime), {
        message: t('event.end_time') + ' ' + t('validation.greater_than', { field: t('event.start_time') }),
        path: ['endTime'],
    });
}

export function createWorkshopSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    const ScheduleItem = getWorkshopScheduleItemSchema(t);
    return z.object({
        title: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('common.title') + ' ' + t('validation.required')
                        : t('common.title') + ' ' + t('validation.invalid'),
            })
            .trim()
            .min(1, t('common.title') + ' ' + t('validation.required'))
            .max(200, t('common.title') + ' ' + t('validation.max_length', { max: 200 })),
        maxCapacity: z
            .number({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.max_capacity') + ' ' + t('validation.required')
                        : t('event.max_capacity') + ' ' + t('validation.invalid'),
            })
            .int()
            .min(1, t('event.max_capacity') + ' ' + t('validation.min_value', { min: 1 }))
            .max(10000, t('event.max_capacity') + ' ' + t('validation.max_value', { max: 10000 })),
        shortDescription: z.string().max(10000).optional().nullable(),
        certNote: z.string().max(5000).optional().nullable(),
        topics: z.array(z.string()).max(50).optional().nullable(),
        position: z.number().int().min(0).optional().default(0),
        room: z.string().max(200).optional().nullable(),
        location: z.string().max(200).optional().nullable(),
        schedules: z.array(ScheduleItem).min(0).max(30).optional().default([]),
        speakerIds: z.array(z.string().uuid()).max(20).optional().default([]),
    });
}

export function updateWorkshopSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    const ScheduleItem = getWorkshopScheduleItemSchema(t);
    return z.object({
        title: z.string().trim().min(1).max(200).optional(),
        maxCapacity: z.number().int().min(1).max(10000).optional(),
        shortDescription: z.string().max(10000).optional().nullable(),
        certNote: z.string().max(5000).optional().nullable(),
        topics: z.array(z.string()).max(50).optional().nullable(),
        position: z.number().int().min(0).optional(),
        room: z.string().max(200).optional().nullable(),
        location: z.string().max(200).optional().nullable(),
        schedules: z.array(ScheduleItem).min(0).max(30).optional(),
        speakerIds: z.array(z.string().uuid()).max(20).optional(),
    });
}

export type CreateWorkshopForm = z.infer<ReturnType<typeof createWorkshopSchema>>;
export type UpdateWorkshopForm = z.infer<ReturnType<typeof updateWorkshopSchema>>;
