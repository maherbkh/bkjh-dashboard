import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Additional missing translations
const additionalTranslations = {
    en: {
        'global.description': 'Description',
        'global.first': 'First',
        'global.information': 'Information',
        'global.last': 'Last',
        'global.messages.no_search_results': 'No search results found',
        'global.messages.success': 'Success',
        'global.messages.validation_error': 'Validation error',
        'global.more_pages': 'More pages',
        'global.navigation.backhaus': 'Backhaus',
        'global.navigation.breadcrumb': 'Breadcrumb',
        'global.navigation.home': 'Home',
        'global.page': 'Page',
        'global.pages': 'Pages',
        'global.search': 'Search',
        'global.search_results': 'Search Results',
        'global.showing_results': 'Showing results',
        'global.total': 'Total',
        'navigation.academy': 'Academy',
        'navigation.admin': 'Admin',
        'navigation.dashboard': 'Dashboard',
        'navigation.events': 'Events',
        'navigation.home': 'Home',
        'navigation.it_support': 'IT Support',
        'navigation.logout': 'Logout',
        'navigation.master_data': 'Master Data',
        'navigation.my_account': 'My Account',
        'navigation.my_tasks': 'My Tasks',
        'navigation.profile': 'Profile',
        'navigation.settings': 'Settings',
        'navigation.support_tickets': 'Support Tickets',
        'navigation.tickets': 'Tickets',
        'navigation.users': 'Users',
        'occupation.active': 'Active',
        'occupation.inactive': 'Inactive',
        'occupation.status': 'Status',
        'page.actions': 'Actions',
        'page.add_new': 'Add New',
        'page.breadcrumb': 'Breadcrumb',
        'page.delete_selected': 'Delete Selected',
        'page.export': 'Export',
        'page.filter': 'Filter',
        'page.filters': 'Filters',
        'page.home': 'Home',
        'page.import': 'Import',
        'page.items_per_page': 'Items per page',
        'page.no_data': 'No data available',
        'page.of': 'of',
        'page.page': 'Page',
        'page.refresh': 'Refresh',
        'page.results': 'results',
        'page.search': 'Search',
        'page.select_all': 'Select All',
        'page.showing': 'Showing',
        'page.sort': 'Sort',
        'page.sort_by': 'Sort by',
        'page.total': 'Total',
        'page.view_all': 'View All',
        'pagination.first': 'First',
        'pagination.last': 'Last',
        'pagination.next': 'Next',
        'pagination.of': 'of',
        'pagination.page': 'Page',
        'pagination.previous': 'Previous',
        'pagination.showing': 'Showing',
        'pagination.to': 'to',
        'status.active': 'Active',
        'status.inactive': 'Inactive',
        'table.actions': 'Actions',
        'table.no_data': 'No data available',
        'table.no_results': 'No results found',
        'table.search': 'Search',
        'table.showing': 'Showing',
        'table.total': 'Total',
        'ticket.assigned_to': 'Assigned To',
        'ticket.category': 'Category',
        'ticket.created_by': 'Created By',
        'ticket.description': 'Description',
        'ticket.priority': 'Priority',
        'ticket.requester': 'Requester',
        'ticket.status': 'Status',
        'ticket.subject': 'Subject',
        'ticket.title': 'Title',
        'ticket.type': 'Type',
        'ticket.updated_by': 'Updated By',
        'time.day': 'day',
        'time.days': 'days',
        'time.hour': 'hour',
        'time.hours': 'hours',
        'time.minute': 'minute',
        'time.minutes': 'minutes',
        'time.month': 'month',
        'time.months': 'months',
        'time.second': 'second',
        'time.seconds': 'seconds',
        'time.week': 'week',
        'time.weeks': 'weeks',
        'time.year': 'year',
        'time.years': 'years',
    },
    de: {
        'global.description': 'Beschreibung',
        'global.first': 'Erste',
        'global.information': 'Information',
        'global.last': 'Letzte',
        'global.messages.no_search_results': 'Keine Suchergebnisse gefunden',
        'global.messages.success': 'Erfolg',
        'global.messages.validation_error': 'Validierungsfehler',
        'global.more_pages': 'Weitere Seiten',
        'global.navigation.backhaus': 'Backhaus',
        'global.navigation.breadcrumb': 'Brotkrumen',
        'global.navigation.home': 'Startseite',
        'global.page': 'Seite',
        'global.pages': 'Seiten',
        'global.search': 'Suchen',
        'global.search_results': 'Suchergebnisse',
        'global.showing_results': 'Ergebnisse anzeigen',
        'global.total': 'Gesamt',
        'navigation.academy': 'Akademie',
        'navigation.admin': 'Administrator',
        'navigation.dashboard': 'Dashboard',
        'navigation.events': 'Veranstaltungen',
        'navigation.home': 'Startseite',
        'navigation.it_support': 'IT-Support',
        'navigation.logout': 'Abmelden',
        'navigation.master_data': 'Stammdaten',
        'navigation.my_account': 'Mein Konto',
        'navigation.my_tasks': 'Meine Aufgaben',
        'navigation.profile': 'Profil',
        'navigation.settings': 'Einstellungen',
        'navigation.support_tickets': 'Support-Tickets',
        'navigation.tickets': 'Tickets',
        'navigation.users': 'Benutzer',
        'occupation.active': 'Aktiv',
        'occupation.inactive': 'Inaktiv',
        'occupation.status': 'Status',
        'page.actions': 'Aktionen',
        'page.add_new': 'Neu hinzufügen',
        'page.breadcrumb': 'Brotkrumen',
        'page.delete_selected': 'Ausgewählte löschen',
        'page.export': 'Exportieren',
        'page.filter': 'Filter',
        'page.filters': 'Filter',
        'page.home': 'Startseite',
        'page.import': 'Importieren',
        'page.items_per_page': 'Elemente pro Seite',
        'page.no_data': 'Keine Daten verfügbar',
        'page.of': 'von',
        'page.page': 'Seite',
        'page.refresh': 'Aktualisieren',
        'page.results': 'Ergebnisse',
        'page.search': 'Suchen',
        'page.select_all': 'Alle auswählen',
        'page.showing': 'Zeige',
        'page.sort': 'Sortieren',
        'page.sort_by': 'Sortieren nach',
        'page.total': 'Gesamt',
        'page.view_all': 'Alle anzeigen',
        'pagination.first': 'Erste',
        'pagination.last': 'Letzte',
        'pagination.next': 'Weiter',
        'pagination.of': 'von',
        'pagination.page': 'Seite',
        'pagination.previous': 'Zurück',
        'pagination.showing': 'Zeige',
        'pagination.to': 'bis',
        'status.active': 'Aktiv',
        'status.inactive': 'Inaktiv',
        'table.actions': 'Aktionen',
        'table.no_data': 'Keine Daten verfügbar',
        'table.no_results': 'Keine Ergebnisse gefunden',
        'table.search': 'Suchen',
        'table.showing': 'Zeige',
        'table.total': 'Gesamt',
        'ticket.assigned_to': 'Zugewiesen an',
        'ticket.category': 'Kategorie',
        'ticket.created_by': 'Erstellt von',
        'ticket.description': 'Beschreibung',
        'ticket.priority': 'Priorität',
        'ticket.requester': 'Antragsteller',
        'ticket.status': 'Status',
        'ticket.subject': 'Betreff',
        'ticket.title': 'Titel',
        'ticket.type': 'Typ',
        'ticket.updated_by': 'Aktualisiert von',
        'time.day': 'Tag',
        'time.days': 'Tage',
        'time.hour': 'Stunde',
        'time.hours': 'Stunden',
        'time.minute': 'Minute',
        'time.minutes': 'Minuten',
        'time.month': 'Monat',
        'time.months': 'Monate',
        'time.second': 'Sekunde',
        'time.seconds': 'Sekunden',
        'time.week': 'Woche',
        'time.weeks': 'Wochen',
        'time.year': 'Jahr',
        'time.years': 'Jahre',
    },
};

// Function to set nested value
function setNestedValue(obj, key, value) {
    const parts = key.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part] || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part];
    }

    current[parts[parts.length - 1]] = value;
}

// Function to sort object keys recursively
function sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    const sorted = {};
    Object.keys(obj).sort().forEach((key) => {
        sorted[key] = sortObjectKeys(obj[key]);
    });

    return sorted;
}

// Main execution
console.log('🔄 Adding remaining missing translations...\n');

const localesDir = path.join(__dirname, '..', 'i18n', 'locales');
const enPath = path.join(localesDir, 'en.json');
const dePath = path.join(localesDir, 'de.json');

// Load existing translations
let enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let deTranslations = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Add missing translations
let enAdded = 0;
let deAdded = 0;

for (const [key, value] of Object.entries(additionalTranslations.en)) {
    const parts = key.split('.');
    let current = enTranslations;
    let exists = true;

    for (const part of parts) {
        if (!current[part]) {
            exists = false;
            break;
        }
        current = current[part];
    }

    if (!exists || (typeof current === 'string' && current.startsWith('[MISSING:'))) {
        setNestedValue(enTranslations, key, value);
        enAdded++;
    }
}

for (const [key, value] of Object.entries(additionalTranslations.de)) {
    const parts = key.split('.');
    let current = deTranslations;
    let exists = true;

    for (const part of parts) {
        if (!current[part]) {
            exists = false;
            break;
        }
        current = current[part];
    }

    if (!exists || (typeof current === 'string' && current.startsWith('[MISSING:'))) {
        setNestedValue(deTranslations, key, value);
        deAdded++;
    }
}

// Sort and write back
enTranslations = sortObjectKeys(enTranslations);
deTranslations = sortObjectKeys(deTranslations);

fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2), 'utf8');
fs.writeFileSync(dePath, JSON.stringify(deTranslations, null, 2), 'utf8');

console.log('✅ Translation files updated!');
console.log(`\n📊 Statistics:`);
console.log(`   English translations added: ${enAdded}`);
console.log(`   German translations added: ${deAdded}`);
console.log('\n✨ Done!');
