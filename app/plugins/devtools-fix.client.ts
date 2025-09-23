// plugins/devtools-fix.client.ts
export default defineNuxtPlugin(() => {
    if (import.meta.client && import.meta.env.PROD) {
        Object.defineProperty(window, '__VUE_DEVTOOLS_GLOBAL_HOOK__', {
            configurable: false,
            enumerable: false,
            get() {
                return undefined;
            },
            set() {
                // Prevent mutation
            },
        });
    }
});
