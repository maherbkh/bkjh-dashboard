import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Complete remaining translations
const completeTranslations = {
    en: {
        'groups.edit_success': 'Group edited successfully',
        'groups.no_companies_found': 'No companies found',
        'groups.search_companies': 'Search companies',
        'media.active_filters': 'Active Filters',
        'media.all_access_levels': 'All Access Levels',
        'media.all_collections': 'All Collections',
        'media.all_file_types': 'All File Types',
        'media.clear_selection': 'Clear Selection',
        'media.collection': 'Collection',
        'media.collection_attachments': 'Attachments',
        'media.collection_documents': 'Documents',
        'media.collection_images': 'Images',
        'media.collection_videos': 'Videos',
        'media.created_at': 'Created At',
        'media.download': 'Download',
        'media.file_count': 'File Count',
        'media.file_details': 'File Details',
        'media.file_name': 'File Name',
        'media.file_size': 'File Size',
        'media.file_type': 'File Type',
        'media.filter_by_access': 'Filter by Access',
        'media.filter_by_collection': 'Filter by Collection',
        'media.filter_by_type': 'Filter by Type',
        'media.filters': 'Filters',
        'media.mimetype': 'MIME Type',
        'media.no_files_selected': 'No files selected',
        'media.reset_filters': 'Reset Filters',
        'media.select_file': 'Select File',
        'media.show_filters': 'Show Filters',
        'media.size': 'Size',
        'media.type': 'Type',
        'media.updated_at': 'Updated At',
        'media.uploaded_by': 'Uploaded By',
        'occupations.edit_success': 'Occupation edited successfully',
        'occupations.no_occupations_found': 'No occupations found',
        'speakers.edit_success': 'Speaker edited successfully',
        'speakers.no_events': 'No events assigned',
        'speakers.no_speakers_found': 'No speakers found',
        'support.ticket.add_comment': 'Add Comment',
        'support.ticket.add_note': 'Add Note',
        'support.ticket.assign': 'Assign Ticket',
        'support.ticket.close': 'Close Ticket',
        'support.ticket.comments': 'Comments',
        'support.ticket.history': 'Ticket History',
        'support.ticket.notes': 'Notes',
        'support.ticket.reopen': 'Reopen Ticket',
        'support.ticket.resolve': 'Resolve Ticket',
        'table.filter': 'Filter',
        'table.rows_per_page': 'Rows per page',
        'table.selected': 'selected',
        'tickets.add_success': 'Ticket added successfully',
        'tickets.delete_success': 'Ticket deleted successfully',
        'tickets.update_success': 'Ticket updated successfully',
        'ui.apply': 'Apply',
        'ui.apply_filters': 'Apply Filters',
        'ui.cancel': 'Cancel',
        'ui.clear_all': 'Clear All',
        'ui.clear_filters': 'Clear Filters',
        'ui.confirm': 'Confirm',
        'ui.delete': 'Delete',
        'ui.download': 'Download',
        'ui.edit': 'Edit',
        'ui.export': 'Export',
        'ui.import': 'Import',
        'ui.more_options': 'More Options',
        'ui.preview': 'Preview',
        'ui.print': 'Print',
        'ui.select': 'Select',
        'ui.upload': 'Upload',
        'ui.view': 'View',
        'users.edit_success': 'User edited successfully',
        'users.no_users_found': 'No users found',
        'validation.confirmed': 'Confirmation does not match',
        'validation.date': 'Must be a valid date',
        'validation.unique': 'This value already exists',
    },
    de: {
        'groups.edit_success': 'Gruppe erfolgreich bearbeitet',
        'groups.no_companies_found': 'Keine Unternehmen gefunden',
        'groups.search_companies': 'Unternehmen suchen',
        'media.active_filters': 'Aktive Filter',
        'media.all_access_levels': 'Alle Zugriffsstufen',
        'media.all_collections': 'Alle Sammlungen',
        'media.all_file_types': 'Alle Dateitypen',
        'media.clear_selection': 'Auswahl löschen',
        'media.collection': 'Sammlung',
        'media.collection_attachments': 'Anhänge',
        'media.collection_documents': 'Dokumente',
        'media.collection_images': 'Bilder',
        'media.collection_videos': 'Videos',
        'media.created_at': 'Erstellt am',
        'media.download': 'Herunterladen',
        'media.file_count': 'Dateianzahl',
        'media.file_details': 'Dateidetails',
        'media.file_name': 'Dateiname',
        'media.file_size': 'Dateigröße',
        'media.file_type': 'Dateityp',
        'media.filter_by_access': 'Nach Zugriff filtern',
        'media.filter_by_collection': 'Nach Sammlung filtern',
        'media.filter_by_type': 'Nach Typ filtern',
        'media.filters': 'Filter',
        'media.mimetype': 'MIME-Typ',
        'media.no_files_selected': 'Keine Dateien ausgewählt',
        'media.reset_filters': 'Filter zurücksetzen',
        'media.select_file': 'Datei auswählen',
        'media.show_filters': 'Filter anzeigen',
        'media.size': 'Größe',
        'media.type': 'Typ',
        'media.updated_at': 'Aktualisiert am',
        'media.uploaded_by': 'Hochgeladen von',
        'occupations.edit_success': 'Beruf erfolgreich bearbeitet',
        'occupations.no_occupations_found': 'Keine Berufe gefunden',
        'speakers.edit_success': 'Referent erfolgreich bearbeitet',
        'speakers.no_events': 'Keine Veranstaltungen zugewiesen',
        'speakers.no_speakers_found': 'Keine Referenten gefunden',
        'support.ticket.add_comment': 'Kommentar hinzufügen',
        'support.ticket.add_note': 'Notiz hinzufügen',
        'support.ticket.assign': 'Ticket zuweisen',
        'support.ticket.close': 'Ticket schließen',
        'support.ticket.comments': 'Kommentare',
        'support.ticket.history': 'Ticket-Historie',
        'support.ticket.notes': 'Notizen',
        'support.ticket.reopen': 'Ticket wiedereröffnen',
        'support.ticket.resolve': 'Ticket lösen',
        'table.filter': 'Filter',
        'table.rows_per_page': 'Zeilen pro Seite',
        'table.selected': 'ausgewählt',
        'tickets.add_success': 'Ticket erfolgreich hinzugefügt',
        'tickets.delete_success': 'Ticket erfolgreich gelöscht',
        'tickets.update_success': 'Ticket erfolgreich aktualisiert',
        'ui.apply': 'Anwenden',
        'ui.apply_filters': 'Filter anwenden',
        'ui.cancel': 'Abbrechen',
        'ui.clear_all': 'Alle löschen',
        'ui.clear_filters': 'Filter löschen',
        'ui.confirm': 'Bestätigen',
        'ui.delete': 'Löschen',
        'ui.download': 'Herunterladen',
        'ui.edit': 'Bearbeiten',
        'ui.export': 'Exportieren',
        'ui.import': 'Importieren',
        'ui.more_options': 'Weitere Optionen',
        'ui.preview': 'Vorschau',
        'ui.print': 'Drucken',
        'ui.select': 'Auswählen',
        'ui.upload': 'Hochladen',
        'ui.view': 'Anzeigen',
        'users.edit_success': 'Benutzer erfolgreich bearbeitet',
        'users.no_users_found': 'Keine Benutzer gefunden',
        'validation.confirmed': 'Bestätigung stimmt nicht überein',
        'validation.date': 'Muss ein gültiges Datum sein',
        'validation.unique': 'Dieser Wert existiert bereits',
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

console.log('🔄 Completing all remaining translations...\n');

const localesDir = path.join(__dirname, '..', 'i18n', 'locales');
const enPath = path.join(localesDir, 'en.json');
const dePath = path.join(localesDir, 'de.json');

let enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let deTranslations = JSON.parse(fs.readFileSync(dePath, 'utf8'));

let enAdded = 0;
let deAdded = 0;

for (const [key, value] of Object.entries(completeTranslations.en)) {
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

for (const [key, value] of Object.entries(completeTranslations.de)) {
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

console.log('✅ All translations completed!');
console.log(`\n📊 Final Statistics:`);
console.log(`   English translations added: ${enAdded}`);
console.log(`   German translations added: ${deAdded}`);
console.log('\n🎉 Translation project is now complete!');
