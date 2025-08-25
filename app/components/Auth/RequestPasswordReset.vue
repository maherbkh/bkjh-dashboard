<script setup lang="ts">
// Using Nuxt 3 auto-imports for composables and components
import { toast } from 'vue-sonner';
import { useUserStore } from '~/stores/user';

const { t } = useI18n();
const userStore = useUserStore();

const email = ref('');
const isLoading = ref(false);

async function onSubmit(event: Event) {
    event.preventDefault();

    if (!email.value) {
        toast.error(t('global.messages.error'), {
            description: t('auth.please_fill_email'),
            duration: 5000,
        });
        return;
    }

    isLoading.value = true;

    try {
        const success = await userStore.forgotPassword(email.value);

        if (success) {
            email.value = '';
        }
    }
    catch (error) {
        toast.error(t('global.messages.error'), {
            description: t('global.messages.something_went_wrong'),
            duration: 5000,
        });
    }
    finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <form
        class="grid gap-6"
        @submit="onSubmit"
    >
        <div class="grid gap-4">
            <FormItemInput
                v-model="email"
                :title="$t('global.table.email')"
                icon="solar:letter-outline"
                :disabled="isLoading"
                :placeholder="t('auth.email_placeholder')"
                auto-complete="email"
                type="email"
            />
        </div>

        <Button
            type="submit"
            class="w-full cursor-pointer group"
            size="sm"
            :disabled="isLoading"
        >
            <Icon
                :name="isLoading ? 'eos-icons:three-dots-loading' : 'solar:letter-outline'"
                :class="[(!isLoading && 'group-hover:scale-110 ease-in-out duration-300'), 'mr-2 !size-5']"
            />
            {{ $t('auth.send_reset_link') }}
        </Button>

        <div class="text-center">
            <NuxtLink
                to="/login"
                class="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
                {{ $t('auth.back_to_login') }}
            </NuxtLink>
        </div>
    </form>
</template>

<style scoped>

</style>
