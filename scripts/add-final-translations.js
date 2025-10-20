import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Final batch of missing translations
const finalTranslations = {
    en: {
        'global.navigation.faq': 'FAQ',
        'global.navigation.toggle_color_mode': 'Toggle Color Mode',
        'global.short_description': 'Short Description',
        'global.sidebar.help_support': 'Help & Support',
        'global.sidebar.share_project': 'Share Project',
        'global.sidebar.view_project': 'View Project',
        'global.toggle_sidebar': 'Toggle Sidebar',
        'global.toggle_sort': 'Toggle Sort',
        'groups.add_success': 'Group added successfully',
        'groups.delete_success': 'Group deleted successfully',
        'groups.update_success': 'Group updated successfully',
        'notification.error': 'Error',
        'notification.info': 'Information',
        'notification.success': 'Success',
        'notification.warning': 'Warning',
        'occupations.add_success': 'Occupation added successfully',
        'occupations.delete_success': 'Occupation deleted successfully',
        'occupations.update_success': 'Occupation updated successfully',
        'search.clear': 'Clear Search',
        'search.no_results': 'No search results',
        'search.placeholder': 'Search...',
        'search.results': 'Search Results',
        'search.searching': 'Searching...',
        'sidebar.collapse': 'Collapse Sidebar',
        'sidebar.expand': 'Expand Sidebar',
        'speakers.add_success': 'Speaker added successfully',
        'speakers.delete_success': 'Speaker deleted successfully',
        'speakers.update_success': 'Speaker updated successfully',
        'support.tickets.assigned': 'Assigned Tickets',
        'support.tickets.closed': 'Closed Tickets',
        'support.tickets.my_tickets': 'My Tickets',
        'support.tickets.open': 'Open Tickets',
        'support.tickets.unassigned': 'Unassigned Tickets',
        'system.error': 'System Error',
        'system.loading': 'Loading System...',
        'system.maintenance': 'System Maintenance',
        'system.offline': 'System Offline',
        'system.online': 'System Online',
        'toast.dismiss': 'Dismiss',
        'toast.error': 'Error',
        'toast.info': 'Info',
        'toast.success': 'Success',
        'toast.warning': 'Warning',
        'ui.clear': 'Clear',
        'ui.close': 'Close',
        'ui.collapse': 'Collapse',
        'ui.expand': 'Expand',
        'ui.filter': 'Filter',
        'ui.hide': 'Hide',
        'ui.loading': 'Loading...',
        'ui.no_data': 'No data',
        'ui.open': 'Open',
        'ui.refresh': 'Refresh',
        'ui.reset': 'Reset',
        'ui.save': 'Save',
        'ui.search': 'Search',
        'ui.show': 'Show',
        'ui.sort': 'Sort',
        'ui.toggle': 'Toggle',
        'users.add_success': 'User added successfully',
        'users.delete_success': 'User deleted successfully',
        'users.update_success': 'User updated successfully',
        'validation.email': 'Must be a valid email address',
        'validation.max': 'Must be less than or equal to {max}',
        'validation.min': 'Must be greater than or equal to {min}',
        'validation.numeric': 'Must be a number',
        'validation.regex': 'Invalid format',
        'validation.url': 'Must be a valid URL',
    },
    de: {
        'global.navigation.faq': 'FAQ',
        'global.navigation.toggle_color_mode': 'Farbmodus umschalten',
        'global.short_description': 'Kurzbeschreibung',
        'global.sidebar.help_support': 'Hilfe & Support',
        'global.sidebar.share_project': 'Projekt teilen',
        'global.sidebar.view_project': 'Projekt anzeigen',
        'global.toggle_sidebar': 'Seitenleiste umschalten',
        'global.toggle_sort': 'Sortierung umschalten',
        'groups.add_success': 'Gruppe erfolgreich hinzugefügt',
        'groups.delete_success': 'Gruppe erfolgreich gelöscht',
        'groups.update_success': 'Gruppe erfolgreich aktualisiert',
        'notification.error': 'Fehler',
        'notification.info': 'Information',
        'notification.success': 'Erfolg',
        'notification.warning': 'Warnung',
        'occupations.add_success': 'Beruf erfolgreich hinzugefügt',
        'occupations.delete_success': 'Beruf erfolgreich gelöscht',
        'occupations.update_success': 'Beruf erfolgreich aktualisiert',
        'search.clear': 'Suche löschen',
        'search.no_results': 'Keine Suchergebnisse',
        'search.placeholder': 'Suchen...',
        'search.results': 'Suchergebnisse',
        'search.searching': 'Suche läuft...',
        'sidebar.collapse': 'Seitenleiste einklappen',
        'sidebar.expand': 'Seitenleiste ausklappen',
        'speakers.add_success': 'Referent erfolgreich hinzugefügt',
        'speakers.delete_success': 'Referent erfolgreich gelöscht',
        'speakers.update_success': 'Referent erfolgreich aktualisiert',
        'support.tickets.assigned': 'Zugewiesene Tickets',
        'support.tickets.closed': 'Geschlossene Tickets',
        'support.tickets.my_tickets': 'Meine Tickets',
        'support.tickets.open': 'Offene Tickets',
        'support.tickets.unassigned': 'Nicht zugewiesene Tickets',
        'system.error': 'Systemfehler',
        'system.loading': 'System wird geladen...',
        'system.maintenance': 'Systemwartung',
        'system.offline': 'System offline',
        'system.online': 'System online',
        'toast.dismiss': 'Verwerfen',
        'toast.error': 'Fehler',
        'toast.info': 'Info',
        'toast.success': 'Erfolg',
        'toast.warning': 'Warnung',
        'ui.clear': 'Löschen',
        'ui.close': 'Schließen',
        'ui.collapse': 'Einklappen',
        'ui.expand': 'Ausklappen',
        'ui.filter': 'Filtern',
        'ui.hide': 'Verbergen',
        'ui.loading': 'Lädt...',
        'ui.no_data': 'Keine Daten',
        'ui.open': 'Öffnen',
        'ui.refresh': 'Aktualisieren',
        'ui.reset': 'Zurücksetzen',
        'ui.save': 'Speichern',
        'ui.search': 'Suchen',
        'ui.show': 'Anzeigen',
        'ui.sort': 'Sortieren',
        'ui.toggle': 'Umschalten',
        'users.add_success': 'Benutzer erfolgreich hinzugefügt',
        'users.delete_success': 'Benutzer erfolgreich gelöscht',
        'users.update_success': 'Benutzer erfolgreich aktualisiert',
        'validation.email': 'Muss eine gültige E-Mail-Adresse sein',
        'validation.max': 'Muss kleiner oder gleich {max} sein',
        'validation.min': 'Muss größer oder gleich {min} sein',
        'validation.numeric': 'Muss eine Zahl sein',
        'validation.regex': 'Ungültiges Format',
        'validation.url': 'Muss eine gültige URL sein',
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
console.log('🔄 Adding final batch of missing translations...\n');

const localesDir = path.join(__dirname, '..', 'i18n', 'locales');
const enPath = path.join(localesDir, 'en.json');
const dePath = path.join(localesDir, 'de.json');

// Load existing translations
let enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let deTranslations = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Add missing translations
let enAdded = 0;
let deAdded = 0;

for (const [key, value] of Object.entries(finalTranslations.en)) {
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

for (const [key, value] of Object.entries(finalTranslations.de)) {
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
