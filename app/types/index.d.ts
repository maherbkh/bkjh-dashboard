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
};

// Admin type for CRUD operations (extends User with additional fields)
export type Admin = {
    id: string; // UUID from API
    firstName: string;
    lastName: string;
    email: string;
    isSuperAdmin: boolean;
    isActive: boolean;
    occupationId?: string | null;
    apps: string[]; // Available apps: 'dashboard', 'support', 'academy', etc.
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string | null;
    name?: string; // Computed field: firstName + lastName
    occupation?: Occupation | null; // Populated occupation object
};

// Admin form type for create/update operations
export type AdminForm = {
    firstName: string;
    lastName: string;
    email: string;
    password?: string; // Required for create, optional for update
    isSuperAdmin: boolean;
    isActive: boolean;
    occupationId?: string | null;
    apps: string[];
};

export type LoginData = {
    accessToken: string;
    expiresIn: number;
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
    email: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
};

// Entity types
export type Category = {
    id: string; // UUID from API
    name: string;
    position: number;
    isActive: boolean;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    parent: Category | null;
    children: Category[];
};

export type Occupation = {
    id: string; // UUID from API
    name: string;
    position: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type EventCategory = {
    id: string;
    name: string;
    isActive: boolean;
    position: number;
    parentId: string | null;
    parent?: EventCategory | null;
    children?: EventCategory[];
    eventsCount?: number;
    childrenCount?: number;
    createdAt: string;
    updatedAt: string;
};

export type EventTarget = {
    id: string;
    code: string;
    name: string;
    slug: string;
    position: number;
    scope: 'INT' | 'EXT' | 'ALL';
    eventsCount?: number;
    createdAt: string;
    updatedAt: string;
};

export type EventCategoryForm = {
    name: string;
    isActive: boolean;
    position: number;
    parentId: string | null;
};

export type EventTargetForm = {
    code: string;
    name: string;
    slug?: string;
    position: number;
    scope?: 'INT' | 'EXT' | 'ALL';
};

export type Speaker = {
    id: string;
    name: string;
    qualification: string;
    avatar?: string | import('~/types/media/index').MediaEntity | null; // Avatar media ID or entity
    avatarUrl?: string; // Avatar URL from API
    isActive: boolean;
    eventsCount?: number;
    events?: Event[];
    createdAt: string;
    updatedAt: string;
};

export type SpeakerForm = {
    name: string;
    qualification?: string;
    avatar?: string | null;
    isActive: boolean;
};

export type Attendee = {
    id: string; // UUID from API
    firstName: string;
    lastName: string;
    email: string;
    groupId: string | null;
    occupationId: string | null;
    isEmployee: boolean;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    fullName: string; // Computed field: firstName + lastName
    eventsCount: number;
    group?: {
        id: string;
        name: string;
    } | null;
    occupation?: {
        id: string;
        name: string;
    } | null;
};

export type AttendeeForm = {
    firstName: string;
    lastName: string;
    email: string;
    groupId?: string | null;
    occupationId?: string | null;
    isEmployee: boolean;
    isActive: boolean;
};

export type SupportTicket = {
    id: string; // UUID from API
    ticketNumber: string;
    requester: {
        name: string;
        email: string;
        phone: string;
        cell: string | null;
    };
    groupId: string;
    ticketCategoryId: string;
    message: string;
    type: 'TICKET' | 'TASK';
    adminId: string;
    deviceId: string;
    createdAt: string;
    updatedAt: string;
    group: {
        id: string;
        name: string;
    };
    ticketCategory: {
        id: string;
        name: string;
    };
    admin: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    statuses: TicketStatus[];
    actions?: TicketAction[];
    attachments?: TicketAttachment[];
    comments?: TicketComment[];
};

export type TicketStatus = {
    id: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
    note: string | null;
    createdAt: string;
    updatedAt: string;
};

export type TicketActionType
    = | 'ASSIGN'
        | 'REASSIGN'
        | 'UNASSIGN'
        | 'TEMPORARY_ASSIGN'
        | 'TRANSFER'
        | 'UPGRADE_HARDWARE'
        | 'DOWNGRADE_HARDWARE'
        | 'REPAIR_HARDWARE'
        | 'UPGRADE_SOFTWARE'
        | 'DOWNGRADE_SOFTWARE'
        | 'REPAIR_SOFTWARE'
        | 'INSTALL_SOFTWARE'
        | 'UNINSTALL_SOFTWARE'
        | 'UPDATE_LICENSE'
        | 'RECONFIGURE'
        | 'CHANGE_NETWORK'
        | 'ADD_PERIPHERALS'
        | 'REMOVE_PERIPHERALS'
        | 'CLEAN'
        | 'AUDIT'
        | 'BACKUP'
        | 'RESTORE'
        | 'DECOMMISSION'
        | 'REACTIVATE'
        | 'MARK_OFF_DUTY'
        | 'RETURN_TO_INVENTORY'
        | 'TROUBLESHOOT'
        | 'RESET_PASSWORD'
        | 'REPLACE'
        | 'LOAN'
        | 'RETRIEVE'
        | 'TAG'
        | 'CREATE'
        | 'STATUS_CHANGE';

export type TicketAction = {
    id: string;
    ticketId: string;
    issuerId: string;
    targetId: string;
    note: string;
    actionType: TicketActionType;
    createdAt: string;
    updatedAt: string;
    issuer: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    target: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
};

export type TicketAttachment = {
    id: string;
    uuid: string;
    filename: string;
    mimeType: string;
    size: number;
    title: string | null;
    description: string | null;
    altText: string | null;
    urls: {
        internal: string;
    };
    createdAt: string;
};

export type TicketComment = {
    id: string;
    ticketId: string;
    adminId: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    updatedAt: string;
    admin: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
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
    id: string;
    name: string;
    location: string;
    register: string;
    partner: {
        name: string;
        location: string;
        register: string;
    };
    management: string;
    addressId: string | null;
    position: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    address: Address | null;
    groups: CompanyGroup[];
};

export type CompanyGroup = {
    id: string;
    companyId: string;
    groupId: string;
    createdAt: string;
    updatedAt: string;
    group: {
        id: string;
        name: string;
        isActive: boolean;
        addressId: string | null;
        createdAt: string;
        updatedAt: string;
    };
};

export type CompanyForm = {
    name: string;
    location: string;
    register: string;
    partner: {
        name: string;
        location: string;
        register: string;
    };
    management: string;
    addressId?: string | null;
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
    sortable?: boolean; // Add sortable property for individual columns
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
    id: string;
    streetName: string;
    buildingNumber: string;
    postalCode: string;
    city: string;
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
    ACADEMY = 'academy',
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

// Academy Event types (Dashboard list)
export type EventSpeakerLite = {
    id: string;
    eventId: string;
    speakerId: string;
    createdAt: string;
    updatedAt: string;
    speaker: { 
        id: string; 
        avatar?: string | import('~/types/media/index').MediaEntity | null; 
        avatarUrl?: string; // Avatar URL from API
        name: string; 
        qualification?: string | null; 
    };
};

export type EventListCategory = { id: string; name: string };
export type EventListTarget = { id: string; name: string };

// Event detail nested types
export interface EventSchedule {
    id: string;
    eventId: string;
    date: string; // ISO date
    startTime: string; // e.g. "09:00"
    endTime: string; // e.g. "15:30"
    note?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EventAdminLite {
    id: string;
    firstName: string;
    lastName: string;
}

export interface EventRegistration {
    // Unknown shape for now; align with API when available
    id: string;
    status: 'REJECTED' | 'APPROVED' | 'PENDING';
    registrationDate: string;
    attendee: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        isEmployee: string;
        group: string;
        occupation: string;
        fullName: string;
    };
}

export type EventData = {
    id: string; // UUID
    title: string;
    slug: string;
    type: 'ONLINE' | 'IN_PERSON' | 'HYBRID' | string;
    shortDescription?: string;
    description?: string;
    note?: string | null;
    maxCapacity: number;
    room?: string | null;
    location?: string | null;
    isActive: boolean;
    forKids?: boolean;
    eventCategoryId: string | null;
    eventTargetId: string | null;
    adminId: string;
    cover?: string | import('~/types/media/index').MediaEntity | null; // Cover image media ID or entity
    createdAt: string;
    updatedAt: string;
    eventCategory?: EventListCategory | null;
    eventTarget?: EventListTarget | null;
    admin?: EventAdminLite | null;
    speakers?: EventSpeakerLite[];
    schedules?: EventSchedule[];
    registrations?: EventRegistration[];
    registrationsCount?: number;
    schedulesCount?: number;
    availableSpots?: number;
    approvedRegistrationsCount?: number;

};

// Attendee detail types
export interface AttendeeEvent {
    id: string;
    title: string;
    isActive: boolean;
    registrationStatus: 'CONFIRMED' | 'PENDING' | 'ATTENDED' | 'REJECTED';
    registrationDate: string;
}

export interface AttendeeRegistration {
    id: string;
    attendeeId: string;
    eventId: string;
    registrationStatus: 'CONFIRMED' | 'PENDING' | 'ATTENDED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
    event: {
        id: string;
        title: string;
        isActive: boolean;
    };
}

export type AttendeeData = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    groupId: string | null;
    occupationId: string | null;
    isEmployee: boolean;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    fullName: string;
    eventsCount: number;
    avatar?: string | null;
    group?: {
        id: string;
        name: string;
    } | null;
    occupation?: {
        id: string;
        name: string;
    } | null;
    events?: AttendeeEvent[];
    registrations?: AttendeeRegistration[];
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
