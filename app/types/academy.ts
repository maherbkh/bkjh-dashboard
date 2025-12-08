export interface EventsStats {
    total: number;
    active: number;
    inactive: number;
    upcoming: number;
    past: number;
    byType: {
        IN_PERSON: number;
        ONLINE: number;
        HYBRID: number;
    };
    atCapacity: number;
    withAvailableSpots: number;
}

export interface RegistrationsStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
}

export interface AttendeesStats {
    total: number;
    active: number;
    inactive: number;
    employees: number;
    nonEmployees: number;
    withRegistrations: number;
    withoutRegistrations: number;
}

export interface SpeakersStats {
    total: number;
    active: number;
    inactive: number;
    withEvents: number;
    withoutEvents: number;
}

export interface CategoryItem {
    id: string;
    name: string;
    eventsCount: number;
}

export interface CategoriesStats {
    total: number;
    active: number;
    inactive: number;
    withEvents: number;
    withoutEvents: number;
    topCategories: CategoryItem[];
}

export interface TargetItem {
    id: string;
    name: string;
    code: string;
    eventsCount: number;
}

export interface TargetsStats {
    total: number;
    withEvents: number;
    withoutEvents: number;
    topTargets: TargetItem[];
}

export interface Counts {
    upcomingEvents: number;
    pendingEventRegistrations: number;
    totalAttendees: number;
}

export interface EventRegistrationsByAttendeeType {
    month: string;
    employee: number;
    nonEmployee: number;
}

export interface CategoryData {
    id: string;
    name: string;
    position: number;
    isActive: boolean;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TopCategoryByEventRegistrations {
    category: string;
    pending: number;
    approved: number;
    rejected: number;
    eventsCount: number;
    categoryData: CategoryData;
}

export interface TargetData {
    id: string;
    code: string;
    name: string;
    scope: string;
    position: number;
    createdAt: string;
    updatedAt: string;
}

export interface TopEventTargetByRegistrations {
    eventTarget: string;
    pending: number;
    approved: number;
    rejected: number;
    eventsCount: number;
    targetData: TargetData;
}

export interface OverviewStatsData {
    counts: Counts;
    eventRegistrationsByAttendeeType: EventRegistrationsByAttendeeType[];
    topCategoriesByEventRegistrations: TopCategoryByEventRegistrations[];
    topEventTargetsByRegistrations: TopEventTargetByRegistrations[];
    // Optional fields - may not be present in all API responses
    events?: EventsStats;
    registrations?: RegistrationsStats;
    attendees?: AttendeesStats;
    speakers?: SpeakersStats;
    categories?: CategoriesStats;
    targets?: TargetsStats;
}

export interface OverviewStatsResponse {
    success?: boolean;
    statusCode?: number;
    message: string;
    data: OverviewStatsData;
}
