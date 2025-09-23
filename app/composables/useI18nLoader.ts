export const useI18nLoader = () => {
    const { $i18n } = useNuxtApp();

    const loadTranslationModule = async (module: string) => {
        try {
            const translations = await import(`~/i18n/locales/en/${module}.json`);
            $i18n.mergeLocaleMessage('en', translations.default);
            return true;
        }
        catch (error) {
            console.warn(`Failed to load translation module: ${module}`, error);
            return false;
        }
    };

    const loadMultipleModules = async (modules: string[]) => {
        const results = await Promise.allSettled(
            modules.map(module => loadTranslationModule(module)),
        );
        return results.map((result, index) => ({
            module: modules[index],
            success: result.status === 'fulfilled' && result.value,
        }));
    };

    return {
        loadTranslationModule,
        loadMultipleModules,
    };
};
