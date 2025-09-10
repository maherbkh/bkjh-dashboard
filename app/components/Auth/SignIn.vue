<script setup lang="ts">
// Using Nuxt 3 auto-imports for composable and components
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { Credentials } from '~/types';
import {useUserStore} from "~/stores/user";

const { t } = useI18n();

const route = useRoute();
const redirectPath = route.query?.redirect;

const isLoading = ref(false);

// Zod validation schema
const schema = toTypedSchema(
    z.object({
        email: z
            .string({ required_error: t('form.email') + ' ' + t('validation.required') })
            .min(1, t('form.email') + ' ' + t('validation.required'))
            .email(t('form.email') + ' ' + t('validation.invalid')),
        password: z
            .string({ required_error: t('form.password') + ' ' + t('validation.required') })
            .min(6, t('form.password') + ' ' + t('validation.min_length', { min: 6 })),
    }),
);

// VeeValidate form
const { handleSubmit, defineField, errors } = useForm({
    validationSchema: schema,
    initialValues: {
        email: '',
        password: '',
    },
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

// VeeValidate form submission with proper validation
const onSubmit = handleSubmit(async (values) => {    
    isLoading.value = true;
    
    const credentials: Credentials = {
        email: values.email,
        password: values.password
    };
    
    console.log('Attempting login with validated credentials for:', credentials.email);
    
    try {
        console.log('Starting login process...');
        if (redirectPath) {
            console.log('Login with redirect path:', redirectPath);
            await useUserStore().login(credentials, redirectPath as string);
        }
        else {
            console.log('Login without redirect path');
            await useUserStore().login(credentials);
        }
        console.log('Login process completed');
    }
    catch (error) {
        console.error('Login error:', error);
        // Enhanced error logging for production
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
    }
    finally {
        isLoading.value = false;
    }
});

// Helper function for enter key handling that also triggers validation
const handleEnterKey = () => {
    console.log('Enter key pressed, triggering form validation');
    onSubmit();
};
</script>

<template>
    <form class="grid gap-6" @submit="onSubmit">
        <Separator :label="$t('auth.login_form')" />
        <div class="grid gap-4">
            <FormItemInput
                v-model="email"
                :title="$t('form.email')"
                icon="solar:letter-outline"
                :disabled="isLoading"
                :placeholder="t('form.email_placeholder')"
                autocomplete="email"
                type="email"
                :errors="errors.email ? [errors.email] : []"
                v-bind="emailAttrs"
                required
                @keydown.enter="handleEnterKey"
            />
            <FormItemInput
                v-model="password"
                :title="$t('form.password')"
                icon="solar:password-linear"
                :disabled="isLoading"
                :placeholder="$t('form.password')"
                autocomplete="current-password"
                type="password"
                :errors="errors.password ? [errors.password] : []"
                v-bind="passwordAttrs"
                required
                use-show-password
                @keydown.enter="handleEnterKey"
            />
        </div>
        <Button
            type="submit"
            class="w-full cursor-pointer group"
            size="sm"
            :disabled="isLoading"
        >
            <Icon
                :name="isLoading ? 'eos-icons:three-dots-loading' : 'solar:plain-3-outline'"
                :class="[(!isLoading && 'group-hover:rotate-45 ease-in-out duration-300 group-hover:mr-4'), 'mr-2 !size-5']"
            />
            {{ $t('auth.login') }}
        </Button>

        <div class="text-center">
            <NuxtLink
                to="/forgot-password"
                class="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
                {{ $t('auth.forgot_password') }}
            </NuxtLink>
        </div>
    </form>
</template>

<style scoped>

</style>
