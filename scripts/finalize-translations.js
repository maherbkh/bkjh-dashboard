import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Final complete set of all remaining translations
const lastTranslations = {
    en: {
        'media.collection_avatar': 'Avatar',
        'media.collection_cover': 'Cover Images',
        'media.collection_default': 'Default',
        'media.collection_gallery': 'Gallery',
        'media.dimensions': 'Dimensions',
        'media.duration': 'Duration',
        'media.file_selected': 'file selected',
        'media.file_type_audio': 'Audio',
        'media.file_type_images': 'Images',
        'media.file_type_pdf': 'PDF',
        'media.file_type_video': 'Video',
        'media.files_selected': 'files selected',
        'media.format': 'Format',
        'media.last_modified': 'Last Modified',
        'media.metadata': 'Metadata',
        'media.original_name': 'Original Name',
        'media.path': 'Path',
        'media.preview': 'Preview',
        'media.properties': 'Properties',
        'media.resolution': 'Resolution',
        'media.select': 'Select',
        'media.selected_count': 'Selected',
        'media.show_details': 'Show Details',
        'media.tags': 'Tags',
        'media.thumbnail': 'Thumbnail',
        'media.total_files': 'Total Files',
        'media.total_size': 'Total Size',
        'media.upload_date': 'Upload Date',
        'media.url': 'URL',
        'media.view_details': 'View Details',
        'notification.close': 'Close Notification',
        'notification.dismiss_all': 'Dismiss All',
        'notification.new': 'New Notification',
        'notification.notifications': 'Notifications',
        'notification.view_all': 'View All Notifications',
        'occupations.no_data': 'No occupations available',
        'page.first_page': 'First Page',
        'page.last_page': 'Last Page',
        'page.next_page': 'Next Page',
        'page.previous_page': 'Previous Page',
        'profile.change_password': 'Change Password',
        'profile.edit_profile': 'Edit Profile',
        'profile.personal_info': 'Personal Information',
        'profile.preferences': 'Preferences',
        'profile.security': 'Security',
        'profile.updated': 'Profile Updated',
        'profile.view_profile': 'View Profile',
        'search.advanced': 'Advanced Search',
        'search.filter': 'Filter',
        'search.recent': 'Recent Searches',
        'search.suggestions': 'Suggestions',
        'speakers.events_count': 'Events Count',
        'speakers.no_data': 'No speakers available',
        'status.archived': 'Archived',
        'status.completed': 'Completed',
        'status.draft': 'Draft',
        'status.pending': 'Pending',
        'status.published': 'Published',
        'support.priority.high': 'High',
        'support.priority.low': 'Low',
        'support.priority.medium': 'Medium',
        'support.priority.urgent': 'Urgent',
        'ticket.assigned_by': 'Assigned By',
        'ticket.closed_at': 'Closed At',
        'ticket.comments_count': 'Comments',
        'ticket.created_by': 'Created By',
        'ticket.last_updated': 'Last Updated',
        'ticket.priority': 'Priority',
        'ticket.resolved_at': 'Resolved At',
    },
    de: {
        'media.collection_avatar': 'Avatar',
        'media.collection_cover': 'Titelbilder',
        'media.collection_default': 'Standard',
        'media.collection_gallery': 'Galerie',
        'media.dimensions': 'Abmessungen',
        'media.duration': 'Dauer',
        'media.file_selected': 'Datei ausgewählt',
        'media.file_type_audio': 'Audio',
        'media.file_type_images': 'Bilder',
        'media.file_type_pdf': 'PDF',
        'media.file_type_video': 'Video',
        'media.files_selected': 'Dateien ausgewählt',
        'media.format': 'Format',
        'media.last_modified': 'Zuletzt geändert',
        'media.metadata': 'Metadaten',
        'media.original_name': 'Originalname',
        'media.path': 'Pfad',
        'media.preview': 'Vorschau',
        'media.properties': 'Eigenschaften',
        'media.resolution': 'Auflösung',
        'media.select': 'Auswählen',
        'media.selected_count': 'Ausgewählt',
        'media.show_details': 'Details anzeigen',
        'media.tags': 'Tags',
        'media.thumbnail': 'Miniaturansicht',
        'media.total_files': 'Gesamtdateien',
        'media.total_size': 'Gesamtgröße',
        'media.upload_date': 'Upload-Datum',
        'media.url': 'URL',
        'media.view_details': 'Details anzeigen',
        'notification.close': 'Benachrichtigung schließen',
        'notification.dismiss_all': 'Alle verwerfen',
        'notification.new': 'Neue Benachrichtigung',
        'notification.notifications': 'Benachrichtigungen',
        'notification.view_all': 'Alle Benachrichtigungen anzeigen',
        'occupations.no_data': 'Keine Berufe verfügbar',
        'page.first_page': 'Erste Seite',
        'page.last_page': 'Letzte Seite',
        'page.next_page': 'Nächste Seite',
        'page.previous_page': 'Vorherige Seite',
        'profile.change_password': 'Passwort ändern',
        'profile.edit_profile': 'Profil bearbeiten',
        'profile.personal_info': 'Persönliche Informationen',
        'profile.preferences': 'Einstellungen',
        'profile.security': 'Sicherheit',
        'profile.updated': 'Profil aktualisiert',
        'profile.view_profile': 'Profil anzeigen',
        'search.advanced': 'Erweiterte Suche',
        'search.filter': 'Filter',
        'search.recent': 'Letzte Suchen',
        'search.suggestions': 'Vorschläge',
        'speakers.events_count': 'Anzahl Veranstaltungen',
        'speakers.no_data': 'Keine Referenten verfügbar',
        'status.archived': 'Archiviert',
        'status.completed': 'Abgeschlossen',
        'status.draft': 'Entwurf',
        'status.pending': 'Ausstehend',
        'status.published': 'Veröffentlicht',
        'support.priority.high': 'Hoch',
        'support.priority.low': 'Niedrig',
        'support.priority.medium': 'Mittel',
        'support.priority.urgent': 'Dringend',
        'ticket.assigned_by': 'Zugewiesen von',
        'ticket.closed_at': 'Geschlossen am',
        'ticket.comments_count': 'Kommentare',
        'ticket.created_by': 'Erstellt von',
        'ticket.last_updated': 'Zuletzt aktualisiert',
        'ticket.priority': 'Priorität',
        'ticket.resolved_at': 'Gelöst am',
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

console.log('🎯 Adding the final set of translations...\n');

const localesDir = path.join(__dirname, '..', 'i18n', 'locales');
const enPath = path.join(localesDir, 'en.json');
const dePath = path.join(localesDir, 'de.json');

let enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let deTranslations = JSON.parse(fs.readFileSync(dePath, 'utf8'));

let enAdded = 0;
let deAdded = 0;

for (const [key, value] of Object.entries(lastTranslations.en)) {
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

for (const [key, value] of Object.entries(lastTranslations.de)) {
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

console.log('✅ All translations are now complete!');
console.log(`\n📊 Final Batch:`);
console.log(`   English translations added: ${enAdded}`);
console.log(`   German translations added: ${deAdded}`);
console.log('\n🎉 Translation synchronization complete!');
