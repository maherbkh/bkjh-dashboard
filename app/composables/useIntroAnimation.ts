import { computed } from 'vue';

export interface IntroAnimationOptions {
    direction?: 'x' | '-x' | 'y' | '-y';
    delay?: number;
    customDelay?: number;
}

export function useIntroAnimation() {
    /**
   * Generate intro animation classes for a list of items
   * @param items - Array of items to animate
   * @param options - Animation options
   * @returns Array of class strings for each item
   */
    const getIntroClasses = (items: any[], options: IntroAnimationOptions = {}) => {
        const { direction = 'x', delay = 0.05, customDelay } = options;

        return items.map((_, index) => {
            const baseClass = `intro-${direction}`;
            const delayClass = customDelay !== undefined
                ? `[animation-delay:${customDelay + (index * delay)}s]`
                : `intro-delay-${Math.min(index, 20)}`;

            return `${baseClass} ${delayClass}`;
        });
    };

    /**
   * Get intro animation class for a single item
   * @param index - Item index
   * @param options - Animation options
   * @returns Class string for the item
   */
    const getIntroClass = (index: number, options: IntroAnimationOptions = {}) => {
        const { direction = 'x', delay = 0.05, customDelay } = options;
        const baseClass = `intro-${direction}`;
        const delayClass = customDelay !== undefined
            ? `[animation-delay:${customDelay + (index * delay)}s]`
            : `intro-delay-${Math.min(index, 20)}`;

        return `${baseClass} ${delayClass}`;
    };

    /**
   * Create a reactive intro class for a single item
   * @param index - Item index
   * @param options - Animation options
   * @returns Computed class string
   */
    const useIntroClass = (index: number, options: IntroAnimationOptions = {}) => {
        return computed(() => getIntroClass(index, options));
    };

    /**
   * Create reactive intro classes for a list of items
   * @param items - Array of items to animate
   * @param options - Animation options
   * @returns Computed array of class strings
   */
    const useIntroClasses = (items: any[], options: IntroAnimationOptions = {}) => {
        return computed(() => getIntroClasses(items, options));
    };

    return {
        getIntroClasses,
        getIntroClass,
        useIntroClass,
        useIntroClasses,
    };
}
