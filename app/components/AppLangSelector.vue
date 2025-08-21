<template>
    <DropdownMenu>
        <DropdownMenuTrigger class="cursor-pointer flex items-center gap-3 min-w-[100px] px-3 py-1 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-xs">
            <Icon
                name="hugeicons:translate"
                class="!size-4 opacity-75"
            />
            <div>{{ currentLanguage }}</div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem
                v-for="item in availableLocales"
                :key="item.code"
                class="cursor-pointer"
                @click="setLocale(item.code)"
            >
                {{ item.name }}
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();

const availableLocales = computed(() => {
    return (locales.value).map(l => ({
        code: l.code,
        name: l.name || l.code,
    }));
});

const currentLanguage = computed(() => {
    const current = availableLocales.value.find(l => l.code === locale.value);
    return current?.name || locale.value;
});
</script>
