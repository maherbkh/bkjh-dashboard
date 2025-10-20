import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Translation keys found in the codebase
const translationKeys = new Set();

// Function to recursively scan directory
function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        }
        else if (entry.isFile() && /\.(vue|ts|js)$/.test(entry.name)) {
            scanFile(fullPath);
        }
    }
}

// Function to extract translation keys from a file
function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Pattern 1: $t('key') or $t("key")
    const pattern1 = /\$t\(\s*['"]([\w.]+)['"]\s*\)/g;

    // Pattern 2: t('key') or t("key") - with word boundary to avoid matching other functions
    const pattern2 = /\bt\(\s*['"]([\w.]+)['"]\s*\)/g;

    // Pattern 3: {{ $t('key') }}
    const pattern3 = /\{\{\s*\$t\(\s*['"]([\w.]+)['"]\s*\)/g;

    let match;

    while ((match = pattern1.exec(content)) !== null) {
        const key = match[1];
        if (isValidTranslationKey(key)) {
            translationKeys.add(key);
        }
    }

    while ((match = pattern2.exec(content)) !== null) {
        const key = match[1];
        if (isValidTranslationKey(key)) {
            translationKeys.add(key);
        }
    }

    while ((match = pattern3.exec(content)) !== null) {
        const key = match[1];
        if (isValidTranslationKey(key)) {
            translationKeys.add(key);
        }
    }
}

// Function to validate translation keys
function isValidTranslationKey(key) {
    // Filter out invalid keys
    if (!key || key.length < 2) return false;
    if (key === '.' || key === 'T' || key === 'a') return false;
    if (/^[A-Z.]+$/.test(key) && key.includes('.') && key.split('.').every(p => p.length <= 2)) return false; // Skip date formats like DD.MM.YYYY
    if (!/^[a-z_]/.test(key)) return false; // Must start with lowercase letter or underscore
    if (key.split('.').length > 6) return false; // Too deeply nested, probably not a translation key
    return true;
}

// Function to build nested object from dot notation keys
function buildNestedObject(keys) {
    const result = {};

    keys.forEach((key) => {
        const parts = key.split('.');
        let current = result;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        const lastPart = parts[parts.length - 1];
        if (!current[lastPart]) {
            current[lastPart] = `[MISSING: ${key}]`;
        }
    });

    return result;
}

// Function to merge found keys with existing translations
function mergeTranslations(existingTranslations, foundKeys) {
    const result = JSON.parse(JSON.stringify(existingTranslations)); // Deep clone

    foundKeys.forEach((key) => {
        const parts = key.split('.');
        let current = result;
        let existing = existingTranslations;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];

            // If current[part] is a string, we need to convert it to an object
            if (typeof current[part] === 'string') {
                current[part] = {};
            }

            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
            existing = existing && typeof existing[part] === 'object' ? existing[part] : null;
        }

        const lastPart = parts[parts.length - 1];

        // Check if the existing value is an object (has nested keys)
        if (existing && existing[lastPart] && typeof existing[lastPart] === 'object') {
            // Keep the nested object
            current[lastPart] = existing[lastPart];
        }
        else if (!current[lastPart] || current[lastPart] === undefined || typeof current[lastPart] === 'object') {
            // Only set if it doesn't exist or is an object that we're replacing
            if (existing && existing[lastPart] && typeof existing[lastPart] === 'string') {
                current[lastPart] = existing[lastPart];
            }
            else {
                current[lastPart] = `[MISSING: ${key}]`;
            }
        }
    });

    return result;
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
console.log('🔍 Scanning for translation keys...\n');

const appDir = path.join(__dirname, '..', 'app');
scanDirectory(appDir);

console.log(`✅ Found ${translationKeys.size} unique translation keys\n`);

// Load existing translations
const localesDir = path.join(__dirname, '..', 'i18n', 'locales');
const enPath = path.join(localesDir, 'en.json');
const dePath = path.join(localesDir, 'de.json');

let enTranslations = {};
let deTranslations = {};

try {
    enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    console.log('📖 Loaded existing English translations');
}
catch (e) {
    console.log('⚠️  No existing English translations found');
}

try {
    deTranslations = JSON.parse(fs.readFileSync(dePath, 'utf8'));
    console.log('📖 Loaded existing German translations');
}
catch (e) {
    console.log('⚠️  No existing German translations found');
}

console.log('\n🔄 Merging translations...\n');

// Convert Set to sorted array
const sortedKeys = Array.from(translationKeys).sort();

// Merge with existing translations
const mergedEn = mergeTranslations(enTranslations, sortedKeys);
const mergedDe = mergeTranslations(deTranslations, sortedKeys);

// Sort all keys
const sortedEn = sortObjectKeys(mergedEn);
const sortedDe = sortObjectKeys(mergedDe);

// Find missing translations
const missingInEn = [];
const missingInDe = [];

function findMissing(obj, prefix = '') {
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'string' && obj[key].startsWith('[MISSING:')) {
            return fullKey;
        }
        else if (typeof obj[key] === 'object') {
            const missing = findMissing(obj[key], fullKey);
            if (missing) return missing;
        }
    }
    return null;
}

sortedKeys.forEach((key) => {
    let current = sortedEn;
    let missing = false;
    const parts = key.split('.');

    for (const part of parts) {
        if (!current || !current[part]) {
            missing = true;
            break;
        }
        current = current[part];
    }

    if (missing || (typeof current === 'string' && current.startsWith('[MISSING:'))) {
        missingInEn.push(key);
    }
});

sortedKeys.forEach((key) => {
    let current = sortedDe;
    let missing = false;
    const parts = key.split('.');

    for (const part of parts) {
        if (!current || !current[part]) {
            missing = true;
            break;
        }
        current = current[part];
    }

    if (missing || (typeof current === 'string' && current.startsWith('[MISSING:'))) {
        missingInDe.push(key);
    }
});

// Write updated translations
fs.writeFileSync(enPath, JSON.stringify(sortedEn, null, 2), 'utf8');
fs.writeFileSync(dePath, JSON.stringify(sortedDe, null, 2), 'utf8');

console.log('✅ Updated translation files\n');
console.log(`📊 Statistics:`);
console.log(`   Total keys found: ${sortedKeys.length}`);
console.log(`   Missing in English: ${missingInEn.length}`);
console.log(`   Missing in German: ${missingInDe.length}`);

if (missingInEn.length > 0) {
    console.log('\n⚠️  Missing English translations:');
    missingInEn.slice(0, 10).forEach(key => console.log(`   - ${key}`));
    if (missingInEn.length > 10) {
        console.log(`   ... and ${missingInEn.length - 10} more`);
    }
}

if (missingInDe.length > 0) {
    console.log('\n⚠️  Missing German translations:');
    missingInDe.slice(0, 10).forEach(key => console.log(`   - ${key}`));
    if (missingInDe.length > 10) {
        console.log(`   ... and ${missingInDe.length - 10} more`);
    }
}

console.log('\n✨ Done!');
