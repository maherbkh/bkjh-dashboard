<script setup lang="ts">
const { t } = useI18n();

const colorModesOptions = [
    { name: 'Light', value: 'light', icon: 'solar:sun-2-linear' },
    { name: 'Dark', value: 'dark', icon: 'solar:moon-fog-linear' },
    { name: 'System', value: 'system', icon: 'solar:monitor-outline' },
] as const;

const colorMode = useColorMode();

const currentOption = computed(() =>
    colorModesOptions.find(opt => opt.value === colorMode.preference) || colorModesOptions[0],
);

function toggleMode() {
    const currentIndex = colorModesOptions.findIndex(opt => opt.value === colorMode.preference);
    const nextIndex = (currentIndex + 1) % colorModesOptions.length;
    colorMode.preference = colorModesOptions[nextIndex]?.value ?? 'light';
}
</script>

<template>
    <div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger as-child>
                    <button
                        class="cursor-pointer p-1 size-8 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center rounded-md transition-colors"
                        :aria-label="t('global.navigation.toggle_color_mode')"
                        @click="toggleMode"
                    >
                        <Icon
                            :name="currentOption.icon"
                            class="!size-5 opacity-80 transition-all"
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>{{ currentOption.name }}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
</template>
