<script setup lang="ts">
import { toast } from 'vue-sonner';
import { useUserStore } from '~/stores/user';
import type { ResetPasswordForm } from '~/types';

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();

const email = computed(() => route.query.email as string || '');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const isResending = ref(false);
const resendCountdown = ref(0);

// Countdown timer for resend button
let countdownInterval: NodeJS.Timeout | null = null;

onMounted(async () => {
    if (!email.value) {
        toast.error(t('global.error'), {
            description: t('auth.invalid_token'),
            duration: 5000,
        });
        navigateTo('/login');
        return;
    }

    // Start countdown timer for resend button
    startResendCountdown();
});

onUnmounted(() => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});

function startResendCountdown() {
    resendCountdown.value = 60; // 60 seconds
    countdownInterval = setInterval(() => {
        resendCountdown.value--;
        if (resendCountdown.value <= 0) {
            clearInterval(countdownInterval!);
            countdownInterval = null;
        }
    }, 1000);
}

async function onResendCode() {
    if (isResending.value || resendCountdown.value > 0) return;

    isResending.value = true;
    const success = await userStore.resendResetCode(email.value);
    isResending.value = false;

    if (success) {
        startResendCountdown();
    }
}

async function onSubmit(event: Event) {
    event.preventDefault();

    if (!code.value || !newPassword.value || !confirmPassword.value) {
        toast.error(t('global.error'), {
            description: t('auth.please_fill_all_fields'),
            duration: 5000,
        });
        return;
    }

    const codeString = Array.isArray(code.value) ? code.value.join('') : code.value;
    if (codeString.length !== 6) {
        toast.error(t('global.error'), {
            description: t('auth.invalid_code'),
            duration: 5000,
        });
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        toast.error(t('global.error'), {
            description: t('auth.passwords_do_not_match'),
            duration: 5000,
        });
        return;
    }

    isLoading.value = true;

    const resetData: ResetPasswordForm = {
        email: email.value,
        code: codeString,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
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
        <div class="grid gap-4 w-full">
            <!-- Email field (read-only) -->
            <FormItemInput
                id="email"
                v-model="email"
                :title="$t('form.email')"
                icon="solar:letter-outline"
                type="email"
                disabled
                class="cursor-not-allowed"
                :placeholder="t('form.email_placeholder')"
            />

            <!-- 6-digit PIN input -->
            <div class="grid gap-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {{ $t('auth.enter_reset_code') }}
                </label>
                <PinInput
                    v-model="code"
                    class="w-full grow"
                    :length="6"
                    type="numeric"
                    :disabled="isLoading"
                >
                    <PinInputGroup>
                        <PinInputSlot
                            v-for="i in 6"
                            :key="i"
                            class="w-full grow"
                            :index="i - 1"
                        />
                    </PinInputGroup>
                </PinInput>
                <p class="text-sm text-muted-foreground">
                    {{ $t('auth.reset_code_description') }}
                </p>
            </div>

            <!-- New password field -->
            <FormItemInput
                id="newPassword"
                v-model="newPassword"
                :title="$t('common.new') + ' ' + $t('form.password')"
                icon="solar:key-outline"
                type="password"
                use-show-password
                :placeholder="$t('auth.password_placeholder')"
                :disabled="isLoading"
            />

            <!-- Confirm password field -->
            <FormItemInput
                id="confirmPassword"
                v-model="confirmPassword"
                :title="$t('common.confirm') + ' ' + $t('form.password')"
                icon="solar:key-outline"
                type="password"
                :use-show-password="true"
                :placeholder="$t('form.password_placeholder')"
                :disabled="isLoading"
            />

            <!-- Submit button -->
            <Button
                type="submit"
                :disabled="isLoading"
                class="w-full"
            >
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
                {{ $t('action.submit') }}
            </Button>

            <!-- Resend code button -->
            <div class="flex justify-center">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    :disabled="isResending || resendCountdown > 0"
                    @click="onResendCode"
                >
                    <Icon
                        v-if="isResending"
                        name="solar:loading-linear"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    <Icon
                        v-else
                        name="solar:letter-outline"
                        class="mr-2 h-4 w-4"
                    />
                    {{ resendCountdown > 0 ? `${$t('auth.resend_code')} (${resendCountdown}s)` : $t('auth.resend_code') }}
                </Button>
            </div>
        </div>
    </form>
</template>

<style scoped>

</style>
