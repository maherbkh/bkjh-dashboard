type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

type DemoBookingRecord = {
    id: string;
    carId: string;
    startsAt: string;
    endsAt: string;
    status: BookingStatus;
    requesterName: string;
    requesterEmail: string;
    groupId: string | null;
    safeReference: string;
    safePin: string;
    createdAt: string;
    updatedAt: string;
};

const cars = [
    {
        id: '6ec0d225-9a21-4be8-9a8e-3b094b9e6b56',
        model: 'BMW i5',
        plateNumber: 'EL GB850',
    },
    {
        id: '13904980-08c3-4c51-9448-3f79f90f4e1a',
        model: 'VW ID.4',
        plateNumber: 'EL GB851',
    },
    {
        id: '27f2cd3e-a9de-4389-92e2-5f6756e9cb41',
        model: 'Skoda Enyaq',
        plateNumber: 'EL GB852',
    },
    {
        id: '90caec9e-f8a1-4c18-b5da-f0417f58dcd9',
        model: 'Audi A4',
        plateNumber: 'EL GB853',
    },
    {
        id: 'd2dc9016-2c2b-4fb6-890f-794a228f67d2',
        model: 'Mercedes EQE',
        plateNumber: 'EL GB854',
    },
] as const;

const requesterNames = [
    'Emma Fischer',
    'Liam Becker',
    'Mila Kramer',
    'Noah Winter',
    'Sofia Lange',
    'Leon Braun',
    'Clara Vogt',
    'Paul Wagner',
    'Mia Roth',
    'Jonas Schmitt',
] as const;

const statusPool: BookingStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'];
const groupPool = [
    null,
    'e2f70428-c21c-4f13-9b61-a4476a6b1d95',
    '1e96d3fc-f17d-4668-bcef-f74f9f4db6f9',
    '6e36afec-77d5-49e4-ae89-2b1db2f3f3df',
] as const;
const safeLetters = ['A', 'B', 'C', 'D'] as const;

let seed = 20260423;

function randomUnit(): number {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
}

function randomInt(min: number, max: number): number {
    return Math.floor(randomUnit() * (max - min + 1)) + min;
}

function pickOne<T>(items: readonly T[]): T {
    const i = randomInt(0, items.length - 1);
    return items[i] as T;
}

function toHalfHour(date: Date): Date {
    const rounded = new Date(date);
    rounded.setSeconds(0, 0);
    rounded.setMinutes(rounded.getMinutes() < 30 ? 0 : 30);
    return rounded;
}

function makeUuid(): string {
    const hex = '0123456789abcdef';
    const chars = Array.from({ length: 36 }, () => hex[randomInt(0, 15)]);
    chars[14] = '4';
    chars[19] = '89ab'[randomInt(0, 3)];
    chars[8] = '-';
    chars[13] = '-';
    chars[18] = '-';
    chars[23] = '-';
    return chars.join('');
}

function generateBookingWindow(index: number, rangeStartMs: number, rangeEndMs: number): { start: Date; end: Date } {
    const minDurationSlots = 10; // 5 hours (10 * 30 minutes)
    const maxDurationSlots = 240; // 5 days (240 * 30 minutes)
    const minDurationMs = minDurationSlots * 30 * 60 * 1000;
    const maxDurationMs = maxDurationSlots * 30 * 60 * 1000;

    const maxStartMs = Math.max(rangeStartMs, rangeEndMs - minDurationMs);
    const startMs = rangeStartMs + randomInt(0, Math.max(1, maxStartMs - rangeStartMs));
    const start = toHalfHour(new Date(startMs));

    const remainingMs = Math.max(minDurationMs, rangeEndMs - start.getTime());
    const effectiveMaxMs = Math.min(maxDurationMs, remainingMs);
    const effectiveMaxSlots = Math.max(minDurationSlots, Math.floor(effectiveMaxMs / (30 * 60 * 1000)));
    const durationSlots = randomInt(minDurationSlots, effectiveMaxSlots);
    const end = new Date(start.getTime() + (durationSlots * 30 * 60 * 1000));
    const limit = new Date(rangeEndMs);
    if (end > limit) {
        end.setTime(limit.getTime());
    }
    if (end <= start) {
        end.setTime(start.getTime() + (30 * 60 * 1000));
    }
    if (index % 13 === 0) {
        // Intentionally add some overlap clusters for UI testing.
        start.setHours(9, 0, 0, 0);
        end.setTime(start.getTime() + (randomInt(minDurationSlots, Math.min(20, maxDurationSlots)) * 30 * 60 * 1000));
    }
    return { start, end };
}

function generateDemoBookings(count: number): DemoBookingRecord[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoMonthsLater = new Date(today);
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
    twoMonthsLater.setHours(23, 30, 0, 0);

    const startMs = today.getTime();
    const endMs = twoMonthsLater.getTime();

    const bookings = Array.from({ length: count }, (_unused, index) => {
        const car = pickOne(cars);
        const status = pickOne(statusPool);
        const name = pickOne(requesterNames);
        const { start, end } = generateBookingWindow(index, startMs, endMs);
        const createdAt = new Date(start.getTime() - randomInt(4, 16) * 60 * 60 * 1000);
        const updatedAt = new Date(createdAt.getTime() + randomInt(30, 240) * 60 * 1000);

        return {
            id: makeUuid(),
            carId: car.id,
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
            status,
            requesterName: name,
            requesterEmail: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            groupId: pickOne(groupPool),
            safeReference: `Safe ${pickOne(safeLetters)} / Slot ${randomInt(1, 9)}`,
            safePin: String(randomInt(1000, 9999)),
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
        };
    });

    return bookings.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

const demoBookings = generateDemoBookings(100);

const firstCar = cars[0]!;
const firstDemo = demoBookings[0]!;
const secondDemo = demoBookings[1]!;
const demoIdx = Math.min(19, demoBookings.length - 1);
const demoEnd = demoBookings[demoIdx]!;

export const carBookingsDemoPayload = {
    cars,
    requests: {
        create: {
            carId: firstCar.id,
            startsAt: firstDemo.startsAt,
            endsAt: firstDemo.endsAt,
            status: 'PENDING',
            requesterName: 'John Doe',
            requesterEmail: 'john@example.com',
            groupId: 'e2f70428-c21c-4f13-9b61-a4476a6b1d95',
            safeReference: 'Safe A / Slot 3',
            safePin: '4931',
        },
        listQuery: {
            page: 1,
            length: 20,
            search: '',
            sort_by: 'startsAt',
            sort_dir: 'asc',
            carId: firstCar.id,
            status: 'APPROVED',
            groupId: null,
            startsFrom: firstDemo.startsAt,
            endsBefore: demoEnd.endsAt,
        },
        update: {
            startsAt: secondDemo.startsAt,
            endsAt: secondDemo.endsAt,
            status: 'REJECTED',
            requesterName: 'John D.',
            requesterEmail: 'john.d@example.com',
            groupId: 'e2f70428-c21c-4f13-9b61-a4476a6b1d95',
            safeReference: 'Safe B / Slot 2',
            safePin: '7284',
        },
        deleteMany: {
            ids: [
                firstDemo.id,
                secondDemo.id,
            ],
        },
    },
    responses: {
        list: {
            success: true,
            message: 'Car bookings retrieved successfully',
            data: {
                data: demoBookings,
                meta: {
                    total: demoBookings.length,
                    perPage: 20,
                    currentPage: 1,
                    lastPage: Math.ceil(demoBookings.length / 20),
                    from: 1,
                    to: Math.min(20, demoBookings.length),
                },
                links: {
                    first: null,
                    last: null,
                    prev: null,
                    next: null,
                },
            },
        },
    },
} as const;
