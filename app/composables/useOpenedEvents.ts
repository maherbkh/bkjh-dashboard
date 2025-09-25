export const useOpenedEvents = () => {
    const STORAGE_KEY = 'opened_events';
    const version = useState<number>('opened_events_version', () => 0);

    interface OpenedEvent {
        uuid: string;
        title: string;
    }

    function getOpenedEvents(): OpenedEvent[] {
        if (import.meta.client) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                return stored ? JSON.parse(stored) : [];
            }
            catch {
                return [];
            }
        }
        return [];
    }

    function saveOpenedEvents(events: OpenedEvent[]) {
        if (import.meta.client) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
            }
            catch {
                /* no-op */
            }
        }
    }

    function addOpenedEvent(uuid: string, title: string) {
        const events = getOpenedEvents();
        const idx = events.findIndex(e => e.uuid === uuid);
        if (idx >= 0) events[idx]!.title = title;
        else events.push({ uuid, title });
        saveOpenedEvents(events);
        version.value++;
    }

    function removeOpenedEvent(uuid: string) {
        const events = getOpenedEvents().filter(e => e.uuid !== uuid);
        saveOpenedEvents(events);
        version.value++;
    }

    function getEventTitle(uuid: string): string | null {
        const events = getOpenedEvents();
        const item = events.find(e => e.uuid === uuid);
        return item ? item.title : null;
    }

    function clearOpenedEvents() {
        if (import.meta.client) localStorage.removeItem(STORAGE_KEY);
        version.value++;
    }

    function isEventDetailPage(path: string): boolean {
        return /^\/(events)\/[a-f0-9-]+\/(show|edit)?$/i.test(path) || /^\/(events)\/[a-f0-9-]+$/i.test(path);
    }

    function extractUuidFromEventPath(path: string): string | null {
        const match = path.match(/\/events\/([a-f0-9-]+)/i);
        return match?.[1] ?? null;
    }

    return {
        addOpenedEvent,
        removeOpenedEvent,
        getEventTitle,
        clearOpenedEvents,
        isEventDetailPage,
        extractUuidFromEventPath,
        getOpenedEvents,
        version,
    };
};
