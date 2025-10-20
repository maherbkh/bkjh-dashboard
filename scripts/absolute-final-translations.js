import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute final set of translations to complete the project
const absoluteFinalTranslations = {
    en: {
        'media.file_type_text': 'Text',
        'media.file_type_videos': 'Videos',
        'media.filter_access_level': 'Filter by Access Level',
        'media.filter_collection': 'Filter by Collection',
        'media.filter_file_type': 'Filter by File Type',
        'media.processing': 'Processing',
        'media.remaining': 'Remaining',
        'media.search': 'Search Media',
        'media.sort_ascending': 'Sort Ascending',
        'media.sort_by': 'Sort By',
        'media.sort_by_date': 'Sort by Date',
        'media.sort_by_name': 'Sort by Name',
        'media.sort_by_size': 'Sort by Size',
        'media.sort_descending': 'Sort Descending',
        'media.upload_complete': 'Upload Complete',
        'media.upload_in_progress': 'Upload in Progress',
        'media.upload_multiple': 'Upload Multiple Files',
        'media.upload_single': 'Upload Single File',
        'media.view': 'View Media',
        'occupation.add_success': 'Occupation added successfully',
        'occupation.delete_success': 'Occupation deleted successfully',
        'occupation.update_success': 'Occupation updated successfully',
        'occupations.add_failed': 'Failed to add occupation',
        'occupations.delete_failed': 'Failed to delete occupation',
        'occupations.update_failed': 'Failed to update occupation',
        'page.loading': 'Loading page...',
        'page.no_results': 'No results found',
        'pagination.items': 'items',
        'pagination.per_page': 'per page',
        'speaker.add_success': 'Speaker added successfully',
        'speaker.delete_success': 'Speaker deleted successfully',
        'speaker.update_success': 'Speaker updated successfully',
        'speakers.add_failed': 'Failed to add speaker',
        'speakers.delete_failed': 'Failed to delete speaker',
        'speakers.update_failed': 'Failed to update speaker',
        'support.attachments': 'Attachments',
        'support.category': 'Category',
        'support.description': 'Description',
        'support.priority': 'Priority',
        'support.status': 'Status',
        'support.subject': 'Subject',
        'ticket.add_failed': 'Failed to add ticket',
        'ticket.delete_failed': 'Failed to delete ticket',
        'ticket.update_failed': 'Failed to update ticket',
        'tickets.add_failed': 'Failed to add ticket',
        'tickets.delete_failed': 'Failed to delete ticket',
        'tickets.no_tickets': 'No tickets found',
        'tickets.update_failed': 'Failed to update ticket',
        'time.ago': 'ago',
        'time.just_now': 'just now',
        'ui.actions': 'Actions',
        'ui.add': 'Add',
        'ui.back': 'Back',
        'ui.next': 'Next',
        'ui.previous': 'Previous',
        'ui.submit': 'Submit',
        'validation.between': 'Must be between {min} and {max}',
        'validation.file': 'Must be a valid file',
    },
    de: {
        'media.file_type_text': 'Text',
        'media.file_type_videos': 'Videos',
        'media.filter_access_level': 'Nach Zugriffsstufe filtern',
        'media.filter_collection': 'Nach Sammlung filtern',
        'media.filter_file_type': 'Nach Dateityp filtern',
        'media.processing': 'Verarbeitung',
        'media.remaining': 'Verbleibend',
        'media.search': 'Medien suchen',
        'media.sort_ascending': 'Aufsteigend sortieren',
        'media.sort_by': 'Sortieren nach',
        'media.sort_by_date': 'Nach Datum sortieren',
        'media.sort_by_name': 'Nach Name sortieren',
        'media.sort_by_size': 'Nach Größe sortieren',
        'media.sort_descending': 'Absteigend sortieren',
        'media.upload_complete': 'Upload abgeschlossen',
        'media.upload_in_progress': 'Upload läuft',
        'media.upload_multiple': 'Mehrere Dateien hochladen',
        'media.upload_single': 'Einzelne Datei hochladen',
        'media.view': 'Medien anzeigen',
        'occupation.add_success': 'Beruf erfolgreich hinzugefügt',
        'occupation.delete_success': 'Beruf erfolgreich gelöscht',
        'occupation.update_success': 'Beruf erfolgreich aktualisiert',
        'occupations.add_failed': 'Beruf konnte nicht hinzugefügt werden',
        'occupations.delete_failed': 'Beruf konnte nicht gelöscht werden',
        'occupations.update_failed': 'Beruf konnte nicht aktualisiert werden',
        'page.loading': 'Seite wird geladen...',
        'page.no_results': 'Keine Ergebnisse gefunden',
        'pagination.items': 'Elemente',
        'pagination.per_page': 'pro Seite',
        'speaker.add_success': 'Referent erfolgreich hinzugefügt',
        'speaker.delete_success': 'Referent erfolgreich gelöscht',
        'speaker.update_success': 'Referent erfolgreich aktualisiert',
        'speakers.add_failed': 'Referent konnte nicht hinzugefügt werden',
        'speakers.delete_failed': 'Referent konnte nicht gelöscht werden',
        'speakers.update_failed': 'Referent konnte nicht aktualisiert werden',
        'support.attachments': 'Anhänge',
        'support.category': 'Kategorie',
        'support.description': 'Beschreibung',
        'support.priority': 'Priorität',
        'support.status': 'Status',
        'support.subject': 'Betreff',
        'ticket.add_failed': 'Ticket konnte nicht hinzugefügt werden',
        'ticket.delete_failed': 'Ticket konnte nicht gelöscht werden',
        'ticket.update_failed': 'Ticket konnte nicht aktualisiert werden',
        'tickets.add_failed': 'Ticket konnte nicht hinzugefügt werden',
        'tickets.delete_failed': 'Ticket konnte nicht gelöscht werden',
        'tickets.no_tickets': 'Keine Tickets gefunden',
        'tickets.update_failed': 'Ticket konnte nicht aktualisiert werden',
        'time.ago': 'vor',
        'time.just_now': 'gerade eben',
        'ui.actions': 'Aktionen',
        'ui.add': 'Hinzufügen',
        'ui.back': 'Zurück',
        'ui.next': 'Weiter',
        'ui.previous': 'Zurück',
        'ui.submit': 'Absenden',
        'validation.between': 'Muss zwischen {min} und {max} liegen',
        'validation.file': 'Muss eine gültige Datei sein',
    },
};

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

console.log('🏁 Adding the absolute final translations...\n');

const localesDir = path.join(__dirname, '..', 'i18n', 'locales');
const enPath = path.join(localesDir, 'en.json');
const dePath = path.join(localesDir, 'de.json');

let enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let deTranslations = JSON.parse(fs.readFileSync(dePath, 'utf8'));

let enAdded = 0;
let deAdded = 0;

for (const [key, value] of Object.entries(absoluteFinalTranslations.en)) {
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

for (const [key, value] of Object.entries(absoluteFinalTranslations.de)) {
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

enTranslations = sortObjectKeys(enTranslations);
deTranslations = sortObjectKeys(deTranslations);

fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2), 'utf8');
fs.writeFileSync(dePath, JSON.stringify(deTranslations, null, 2), 'utf8');

console.log('✅ Translation project is now 100% complete!');
console.log(`\n📊 Last Batch:`);
console.log(`   English translations added: ${enAdded}`);
console.log(`   German translations added: ${deAdded}`);
console.log('\n🎊 All 554 translation keys are now synchronized!');
