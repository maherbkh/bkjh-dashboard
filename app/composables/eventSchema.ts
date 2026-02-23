import { z } from 'zod';

// Follow existing validation style used in other CRUD schemas (Zod v4)
// - error callback for required/invalid type (issue.input === undefined)
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
            .regex(/^\d{2}:\d{2}$/u, t('event.start_time') + ' ' + t('validation.time_format')),
        endTime: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.end_time') + ' ' + t('validation.required')
                        : t('event.end_time') + ' ' + t('validation.invalid'),
            })
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

function getQuestionSchema(t: (key: string, params?: Record<string, string | number>) => string) {
    const QuestionType = z.enum(['SHORT_TEXT', 'LONG_TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'DROPDOWN', 'DATE']);

    const OptionSchema = z.object({
        label: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined ? 'Option label is required' : 'Option label must be text',
            })
            .min(1, 'Option label is required')
            .max(200, 'Option label must be 200 characters or less'),
        value: z.union([z.string().max(100, 'Option value must be 100 characters or less'), z.null()]).optional().transform(v => v ?? undefined),
    });

    return z.object({
        id: z.string().uuid().optional(),
        label: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined ? 'Question label is required' : 'Question label must be text',
            })
            .min(1, 'Question label is required')
            .max(500, 'Question label must be 500 characters or less'),
        type: QuestionType,
        isRequired: z.boolean().optional().default(false),
        position: z.number().int('Position must be an integer').min(0, 'Position must be 0 or greater').optional(),
        placeholder: z.union([z.string().max(255, 'Placeholder must be 255 characters or less'), z.null()]).optional().transform(v => v ?? undefined),
        helpText: z.union([z.string().max(1000, 'Help text must be 1000 characters or less'), z.null()]).optional().transform(v => v ?? undefined),
        options: z.union([z.array(OptionSchema), z.null()]).optional().transform(v => v ?? undefined),
        hasAnswers: z.boolean().optional(),
    }).superRefine((question, ctx) => {
        // Type-specific validations
        if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTI_CHOICE' || question.type === 'DROPDOWN') {
            if (!question.options || question.options.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'At least one option is required for this question type',
                    path: ['options'],
                });
            }
            else if (question.options.length > 50) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Maximum 50 options allowed',
                    path: ['options'],
                });
            }

            // Check for duplicate values
            if (question.options) {
                const values = question.options.map(opt => opt.value || opt.label);
                const duplicates = values.filter((val, idx) => values.indexOf(val) !== idx);
                if (duplicates.length > 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Duplicate option values: ${[...new Set(duplicates)].join(', ')}`,
                        path: ['options'],
                    });
                }
            }
        }
    });
}

function questionsArrayWithGlobalRules(t: (key: string, params?: Record<string, string | number>) => string) {
    const Item = getQuestionSchema(t);
    return z.array(Item).max(100, 'Maximum 100 questions allowed').superRefine((items, ctx) => {
        // Check position uniqueness
        const positionMap = new Map<number, number[]>();
        items.forEach((item, idx) => {
            if (item.position !== undefined) {
                if (!positionMap.has(item.position)) {
                    positionMap.set(item.position, []);
                }
                positionMap.get(item.position)!.push(idx);
            }
        });

        positionMap.forEach((indices, position) => {
            if (indices.length > 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Position ${position} is used by multiple questions`,
                    path: [],
                });
            }
        });
    }).optional().default([]);
}

export function createEventSchema(
    t: (key: string, params?: Record<string, string | number>) => string,
) {
    const EventType = z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']);

    return z.object({
        title: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.title') + ' ' + t('validation.required')
                        : t('event.title') + ' ' + t('validation.invalid'),
            })
            .trim()
            .min(1, t('event.title') + ' ' + t('validation.min_length', { min: 1 }))
            .max(200, t('event.title') + ' ' + t('validation.max_length', { max: 200 })),

        description: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('form.description') + ' ' + t('validation.required')
                        : t('form.description') + ' ' + t('validation.invalid'),
            })
            .max(10000, t('form.description') + ' ' + t('validation.max_length', { max: 10000 })),
        shortDescription: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.short_description') + ' ' + t('validation.required')
                        : t('event.short_description') + ' ' + t('validation.invalid'),
            })
            .max(500, t('event.short_description') + ' ' + t('validation.max_length', { max: 500 })),
        certNote: z.string().max(5000, t('event.cert_note') + ' ' + t('validation.max_length', { max: 5000 })).optional(),
        topics: z.array(z.string()).optional().default([]).transform((arr) => {
            if (!Array.isArray(arr)) return [];
            const filtered = arr.map(item => String(item || '').trim()).filter(item => item.length > 0);
            return filtered;
        }),
        note: z.string().max(1000, t('note.singular') + ' ' + t('validation.max_length', { max: 1000 })).optional(),

        type: EventType,

        eventCategoryIds: z
            .array(z.string().uuid(t('event_category.singular') + ' ' + t('validation.uuid')))
            .min(1, t('event_category.singular') + ' ' + t('validation.required'))
            .max(10, t('event_category.singular') + ' ' + t('validation.max_length', { max: 10 })),
        eventTargetIds: z
            .array(z.string().uuid(t('event_target.singular') + ' ' + t('validation.uuid')))
            .min(1, t('event_target.singular') + ' ' + t('validation.required'))
            .max(10, t('event_target.singular') + ' ' + t('validation.max_length', { max: 10 })),
        adminId: z.string().uuid(t('user.admin') + ' ' + t('validation.uuid')).optional(),

        maxCapacity: z
            .number({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.max_capacity') + ' ' + t('validation.required')
                        : t('event.max_capacity') + ' ' + t('validation.invalid'),
            })
            .int(t('event.max_capacity') + ' ' + t('validation.integer'))
            .min(1, t('event.max_capacity') + ' ' + t('validation.min_value', { min: 1 }))
            .max(10000, t('event.max_capacity') + ' ' + t('validation.max_value', { max: 10000 })),

        room: z.string().max(200, t('event.room') + ' ' + t('validation.max_length', { max: 200 })).optional(),
        location: z.string().max(200, t('event.location') + ' ' + t('validation.max_length', { max: 200 })).optional(),
        isActive: z.boolean().optional().default(true),
        isEventCollection: z.boolean().optional().default(false),
        forKids: z.boolean().optional().default(false),
        disableRegistration: z.boolean().optional().default(false),
        isFull: z.boolean().optional().default(false),

        cover: z.string().uuid().optional().nullable(),

        speakers: z.array(z.string().uuid(t('speaker.singular') + ' ' + t('validation.uuid'))).optional().default([]),
        schedules: scheduleArrayWithGlobalRules(t).default([]),
        questions: questionsArrayWithGlobalRules(t),
    });
}

export function updateEventSchema(
    t: (key: string, params?: Record<string, string | number>) => string,
) {
    const EventType = z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']);

    return z.object({
        title: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.title') + ' ' + t('validation.required')
                        : t('event.title') + ' ' + t('validation.invalid'),
            })
            .trim()
            .min(1, t('event.title') + ' ' + t('validation.min_length', { min: 1 }))
            .max(200, t('event.title') + ' ' + t('validation.max_length', { max: 200 })),
        description: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('form.description') + ' ' + t('validation.required')
                        : t('form.description') + ' ' + t('validation.invalid'),
            })
            .max(10000, t('form.description') + ' ' + t('validation.max_length', { max: 10000 })),
        shortDescription: z
            .string({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.short_description') + ' ' + t('validation.required')
                        : t('event.short_description') + ' ' + t('validation.invalid'),
            })
            .max(500, t('event.short_description') + ' ' + t('validation.max_length', { max: 500 })),
        certNote: z.string().max(5000, t('event.cert_note') + ' ' + t('validation.max_length', { max: 5000 })).optional(),
        topics: z.array(z.string()).optional().default([]).transform((arr) => {
            if (!Array.isArray(arr)) return [];
            const filtered = arr.map(item => String(item || '').trim()).filter(item => item.length > 0);
            return filtered;
        }),
        note: z.string().max(1000, t('note.singular') + ' ' + t('validation.max_length', { max: 1000 })).optional(),
        type: EventType,
        eventCategoryIds: z
            .array(z.string().uuid(t('event_category.singular') + ' ' + t('validation.uuid')))
            .min(1, t('event_category.singular') + ' ' + t('validation.required'))
            .max(10, t('event_category.singular') + ' ' + t('validation.max_length', { max: 10 })),
        eventTargetIds: z
            .array(z.string().uuid(t('event_target.singular') + ' ' + t('validation.uuid')))
            .min(1, t('event_target.singular') + ' ' + t('validation.required'))
            .max(10, t('event_target.singular') + ' ' + t('validation.max_length', { max: 10 })),
        adminId: z.string().uuid(t('user.admin') + ' ' + t('validation.uuid')).optional(),
        maxCapacity: z
            .number({
                error: (issue: { input?: unknown }) =>
                    issue.input === undefined
                        ? t('event.max_capacity') + ' ' + t('validation.required')
                        : t('event.max_capacity') + ' ' + t('validation.invalid'),
            })
            .int(t('event.max_capacity') + ' ' + t('validation.integer'))
            .min(1, t('event.max_capacity') + ' ' + t('validation.min_value', { min: 1 }))
            .max(10000, t('event.max_capacity') + ' ' + t('validation.max_value', { max: 10000 })),
        room: z.string().max(200, t('event.room') + ' ' + t('validation.max_length', { max: 200 })).optional(),
        location: z.string().max(200, t('event.location') + ' ' + t('validation.max_length', { max: 200 })).optional(),
        isActive: z.boolean().optional().default(true),
        isEventCollection: z.boolean().optional().default(false),
        forKids: z.boolean().optional().default(false),
        disableRegistration: z.boolean().optional().default(false),
        isFull: z.boolean().optional().default(false),
        cover: z.string().uuid().optional().nullable(),
        speakers: z.array(z.string().uuid(t('speaker.singular') + ' ' + t('validation.uuid'))).optional().default([]),
        schedules: scheduleArrayWithGlobalRules(t).default([]),
        questions: questionsArrayWithGlobalRules(t),
    });
}

export type EventForm = z.infer<ReturnType<typeof createEventSchema>>;
