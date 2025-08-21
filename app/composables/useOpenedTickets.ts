export const useOpenedTickets = () => {
    const STORAGE_KEY = 'opened_tickets';

    type OpenedTicket = {
        uuid: string;
        number: string;
    };

    // Get opened tickets from localStorage
    const getOpenedTickets = (): OpenedTicket[] => {
        if (import.meta.client) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                return stored ? JSON.parse(stored) : [];
            }
            catch (error) {
                console.error('Error reading opened tickets from localStorage:', error);
                return [];
            }
        }
        return [];
    };

    // Save opened tickets to localStorage
    const saveOpenedTickets = (tickets: OpenedTicket[]) => {
        if (import.meta.client) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
            }
            catch (error) {
                console.error('Error saving opened tickets to localStorage:', error);
            }
        }
    };

    // Add or update a ticket in the opened tickets list
    const addOpenedTicket = (uuid: string, number: string) => {
        const tickets = getOpenedTickets();
        const existingIndex = tickets.findIndex(ticket => ticket.uuid === uuid);

        if (existingIndex >= 0) {
            // Update existing ticket number if it changed
            tickets[existingIndex]!.number = number;
        }
        else {
            // Add new ticket
            tickets.push({ uuid, number });
        }

        saveOpenedTickets(tickets);
    };

    // Remove a ticket from the opened tickets list
    const removeOpenedTicket = (uuid: string) => {
        const tickets = getOpenedTickets();
        const filteredTickets = tickets.filter(ticket => ticket.uuid !== uuid);
        saveOpenedTickets(filteredTickets);
    };

    // Get ticket number by UUID
    const getTicketNumber = (uuid: string): string | null => {
        const tickets = getOpenedTickets();
        const ticket = tickets.find(ticket => ticket.uuid === uuid);
        return ticket ? ticket.number : null;
    };

    // Clear all opened tickets
    const clearOpenedTickets = () => {
        if (import.meta.client) {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    // Check if current path is a ticket detail page
    const isTicketDetailPage = (path: string): boolean => {
        return /^\/support-tickets\/[a-f0-9-]+$/i.test(path);
    };

    // Extract UUID from ticket detail path
    const extractUuidFromPath = (path: string): string | null => {
        const match = path.match(/\/support-tickets\/([a-f0-9-]+)/i);
        return match?.[1] ?? null;
    };

    return {
        addOpenedTicket,
        removeOpenedTicket,
        getTicketNumber,
        clearOpenedTickets,
        isTicketDetailPage,
        extractUuidFromPath,
        getOpenedTickets,
    };
};
