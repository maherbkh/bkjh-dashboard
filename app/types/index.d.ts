declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        $t: (key: string, ...args: unknown[]) => string;
    }
}

// Authentication types
export type Credentials = {
    email: string;
    password: string;
};

export type User = {
    id: string; // UUID from API
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
    isActive: boolean;
    lastLoginAt?: string; // From login response
    occupation?: string | null; // From login response
    apps: string[]; // Available apps: 'support', 'academy', etc.
    name?: string;
    avatar?: string;
    lastLoginAt?: string; // From login response
    occupation?: string | null; // From login response
};

export type LoginData = {
    tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn?: number;
    };
    admin: User; // The admin object is the user data
};

export type LoginResponse = {
    status: boolean;
    message: string;
    data: LoginData;
};

export type CheckAuthResponse = {
    status: boolean;
    message: string;
    data: {
        admin: User;
    };
};

export type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

// Entity types
export type Category = {
    id: number;
    name: string;
    slug?: string;
    position?: number;
    createdAt?: string;
    updatedAt?: string;
};

// Component types
export type SelectOption = {
    [key: string]: any;
};

export type DataItem = {
    [key: string]: any;
};

// Alert Dialog types
export type AlertDialogOptions = {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
};

export type AlertDialogState = {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    resolve?: (value: boolean) => void;
};

// Ticket-related types
export type TicketStatus = {
    id: number;
    status: 'in_progress' | 'pending_action' | 'transferred' | 'solved' | 'closed';
    user: User | null;
    createdAt: string;
};

export type TicketAction = {
    id: number;
    actionType: string;
    userId: number;
    status: 'in_progress' | 'pending_action' | 'transferred' | 'solved' | 'closed';
    targetUserId: number | null;
    note: string | null;
    createdAt: string;
    user: User;
    targetUser: User | null;
};

export type Ticket = {
    id: number;
    uuid: string;
    ticketNumber: string;
    name: string;
    message: string;
    email: string | null;
    phone: string | null;
    cell: string | null;
    deviceId: string | null;
    type: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    statusHistory: TicketStatus[];
    actionsHistory: TicketAction[];
    group: Group | null;
    category: Category | null;
    transferredToUser: User | null;
    statuses: TicketStatus[];
    createdAt: string;
    updatedAt: string;
};

export type TicketCrudForm = z.infer<ReturnType<typeof createTicketCrudSchema>>;
export type TicketSubmissionForm = z.infer<ReturnType<typeof createTicketSubmissionSchema>>;

export type Company = {
    id: number;
    name: string;
    location: string;
    register: string;
    partner: string;
    partnerLocation: string;
    partnerRegister: string;
    management: string;
    position?: number;
    address?: Address;
    groups?: Group[];
    slug?: string;
    logo?: string;
    createdAt: string;
    updatedAt: string;
};

export type CompanyForm = {
    name: string;
    location: string;
    register: string;
    partner: string;
    partnerLocation: string;
    partnerRegister: string;
    management: string;
    addressId?: number | null;
};

export type Group = {
    id: number;
    name: string;
    displayName?: string;
    slug?: string;
    position?: number;
    address?: Address;
    companies?: Company[];
    createdAt?: string;
    updatedAt?: string;
};

export type GroupForm = {
    name: string;
    address_id?: number | null;
    company_ids?: number[];
};

// Fix the TableHeaderItem type to ensure id is required
export type TableHeaderItem = {
    name: string;
    id: string; // Make id required instead of optional
    as?: 'th' | 'td';
};

// Fix the ServerParamsTypes to use string for search
export type ServerParamsTypes = {
    page: number;
    length: number;
    sortBy: string;
    sortDir: SortDirection;
    search: string; // Changed from ActiveDirColumn to string
};

// Add a generic type for record data to make it more flexible
export type RecordData = Record<string, any>;

// Update ModelType to include the generic record type
export type ModelType = User | User[] | Category | Category[] | RecordData | RecordData[];

export type DataTypes = {
    data: ModelType;
    meta: PaginateMetaObject;
    links: PaginateLinksObject;
};

export type ApiResponse = {
    status: string;
    message: string;
    data: DataTypes | ModelType | ModelType[];
};

export type SortDirection = 'asc' | 'desc';

export type ActiveDirColumn = string;

export type PaginateMetaObject = {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    from: number;
    to: number;
};

export type PaginateLinksObject = {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
};

// CRUD-related types
export type CrudOptions = {
    apiSlug: string;
    translations?: {
        add_success?: string;
        edit_success?: string;
        delete_success?: string;
        error?: string;
    };
    formSchema?: ZodSchema;
};

export type CrudItem = {
    id: number | string;
    [key: string]: any;
};

export type PaginatedResponse<T> = {
    status: boolean;
    message: string;
    data: {
        data: T[];
        meta: {
            total: number;
            perPage: number;
            currentPage: number;
            lastPage: number;
            from: number;
            to: number;
        };
        links: {
            first: string | null;
            last: string | null;
            prev: string | null;
            next: string | null;
        };
    };
};

export type CrudState<T> = {
    items: Ref<T[]>;
    loading: Ref<boolean>;
    error: Ref<string | null>;
    pagination: Ref<{
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
    }>;
};

// Navigation types
export type NavItem = {
    title: string;
    url: string;
    icon: string;
    items?: NavItem[];
    isActive?: boolean;
};

export type Team = {
    name: string;
    logo: string;
    plan: string;
};

export type NavigationData = {
    teams: Team[];
    navMain: NavItem[];
};

export type Address = {
    id: number;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    position?: number;
    fullAddress?: string;
    createdAt: string;
    updatedAt: string;
};

export type Occupation = {
    id: number;
    name: string;
    position?: number;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type PublicDataResponse = {
    status: string;
    message: string;
    data: {
        categories: Category[];
        groups: Group[];
        addresses: Address[];
        companies: Company[];
        occupations: Occupation[];
        meta: {
            timestamp: string;
            counts: {
                categories: number;
                groups: number;
                addresses: number;
                companies: number;
                occupations: number;
            };
        };
    };
};

export type PublicData = PublicDataResponse['data'];

// App related types
export enum AppSlug {
    SUPPORT = 'support',
    ACADEMY = 'academy'
}

export type Permission = {
    id: number;
    name: string;
    slug: string;
    group?: string;
    module?: string;
    is_active?: boolean;
    position?: number;
    created_at?: string;
    updated_at?: string;
};

export type Role = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    position: number;
    permissions?: Permission[];
    users_count?: number;
    created_at: string;
    updated_at: string;
};

export type RoleForm = {
    name: string;
    slug?: string;
    is_active?: boolean;
    position?: number;
    permission_ids?: number[];
};

export type PermissionForm = {
    name: string;
    slug?: string;
    group?: string;
    module?: string;
    is_active?: boolean;
    position?: number;
};

// Academy Event types
export type EventDate = {
    id: number;
    eventId: number;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
};

export type EventSpeaker = {
    id: number;
    firstName: string;
    lastName: string;
};

export type EventTargetAttendee = {
    id: number;
    name: string;
    color: string;
};

export type EventTargetGroup = {
    id: number;
    name: string;
    code: string;
};

export type EventCategory = {
    id: number;
    name: string;
    slug: string;
};

export type EventData = {
    id: number;
    title: string;
    type: 'in_person' | 'online' | 'hybrid' | string;
    shortDescription?: string;
    description: string;
    note?: string | null;
    maxTrainee?: number;
    categoryId: number;
    targetGroupId: number;
    conferenceRoom?: string;
    location?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    category?: EventCategory;
    targetGroup?: EventTargetGroup;
    targetAttendees?: EventTargetAttendee[];
    speakers?: EventSpeaker[];
    dates?: EventDate[];
};

// Attachment types for ticket messages
export type Attachment = {
    id: number;
    name: string;
    fileName?: string;
    humanSize: string;
    mimeType?: string;
    properties?: {
        isImage?: boolean;
        isDocument?: boolean;
        isVideo?: boolean;
        isAudio?: boolean;
        extension?: string;
    };
    urls?: {
        thumbnail?: string;
        full?: string;
        download?: string;
    };
    links?: {
        download?: string;
    };
};

// File preview used by the file uploader component and forms
export type FilePreview = {
    id?: number;
    url: string;
    name: string;
    type: string;
    urls?: { full?: string };
};

declare global {
    type FilePreview = {
        id?: number;
        url: string;
        name: string;
        type: string;
        urls?: { full?: string };
    };
}

// This ensures the file is treated as a module
export {};

declare function usePerformance(): {
    memoryUsage: Readonly<Ref<{ used: number; total: number; limit: number } | null>>;
    performanceMetrics: Readonly<Ref<{
        loadTime: number;
        domContentLoaded: number;
        firstPaint: number;
        firstContentfulPaint: number;
    }>>;
    isMemoryWarning: ComputedRef<boolean>;
    performanceScore: ComputedRef<number>;
    updateMemoryUsage: () => void;
    getPerformanceMetrics: () => void;
    startMonitoring: () => (() => void);
};
