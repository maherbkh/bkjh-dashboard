<script setup lang="ts">
import { toast } from 'vue-sonner';
import { useUserStore } from '~/stores/user';
import type { ResetPasswordForm } from '~/types';

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();

const token = computed(() => route.query.token as string || '');
const email = computed(() => route.query.email as string || '');

onMounted(async () => {
    if (!token.value || !email.value) {
        toast.error(t('global.messages.error'), {
            description: t('auth.invalid_token'),
            duration: 5000,
        });
        navigateTo('/login');
        return;
    }
});

const password = ref('');
const passwordConfirmation = ref('');

const isLoading = ref(false);

async function onSubmit(event: Event) {
    event.preventDefault();

    if (!password.value || !passwordConfirmation.value) {
        toast.error(t('global.messages.error'), {
            description: t('auth.please_fill_all_fields'),
            duration: 5000,
        });
        return;
    }

    if (password.value !== passwordConfirmation.value) {
        toast.error(t('global.messages.error'), {
            description: t('auth.passwords_do_not_match'),
            duration: 5000,
        });
        return;
    }

    isLoading.value = true;

    const resetData: ResetPasswordForm = {
        token: token.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
    };

    const success = await userStore.resetPassword(resetData);

    if (!success) {
        isLoading.value = false;
    }
    // If successful, the user store will handle navigation to login
}
</script>

<template>
    <form @submit="onSubmit">
        <div class="grid gap-4">
            <FormItemInput
                id="email"
                v-model="email"
                :title="$t('global.table.email')"
                icon="solar:letter-outline"
                type="email"
                disabled
                class="cursor-not-allowed"
                :placeholder="t('auth.email_placeholder')"
            />

            <FormItemInput
                id="password"
                v-model="password"
                :title="$t('auth.new_password')"
                icon="solar:key-outline"
                type="password"
                use-show-password
                :placeholder="$t('global.ui.password_placeholder')"
                :disabled="isLoading"
            />

            <FormItemInput
                id="password_confirmation"
                v-model="passwordConfirmation"
                :title="$t('auth.confirm_password')"
                icon="solar:key-outline"
                type="password"
                :use-show-password="true"
                :placeholder="$t('global.ui.password_placeholder')"
                :disabled="isLoading"
            />
            <Button :disabled="isLoading">
                <Icon
                    v-if="isLoading"
                    name="solar:loading-linear"
                    class="mr-2 h-4 w-4 animate-spin"
                />
                <Icon
                    v-else
                    name="solar:key-linear"
                    class="mr-2 h-4 w-4"
                />
                {{ $t('global.actions.submit') }}
            </Button>
        </div>
    </form>
</template>

<style scoped>

</style>
