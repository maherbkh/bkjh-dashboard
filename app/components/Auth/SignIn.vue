<script setup lang="ts">
// Using Nuxt 3 auto-imports for composables and components
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { Credentials } from '~/types';

const { t } = useI18n();

const route = useRoute();
const redirectPath = route.query?.redirect;

const isLoading = ref(false);

// Zod validation schema
const schema = toTypedSchema(
    z.object({
        email: z
            .string({ required_error: t('auth.validation.email_required') })
            .min(1, t('auth.validation.email_required'))
            .email(t('auth.validation.email_invalid')),
        password: z
            .string({ required_error: t('auth.validation.password_required') })
            .min(6, t('auth.validation.password_min_length')),
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
    console.log('VeeValidate onSubmit called with validated values:', values);
    
    // Enhanced debugging for production builds
    console.log('Login environment check:', {
        isDev: import.meta.env.DEV,
        isClient: import.meta.client,
        isServer: import.meta.server,
        nodeEnv: import.meta.env.NODE_ENV
    });
    
    // Ensure we're on the client side before proceeding
    if (import.meta.server) {
        console.warn('Login attempted on server side, skipping');
        return;
    }
    
    isLoading.value = true;
    
    const credentials: Credentials = {
        email: values.email,
        password: values.password
    };
    
    console.log('Attempting login with validated credentials for:', credentials.email);
    
    try {
        if (redirectPath) {
            await useUserStore().login(credentials, redirectPath as string);
        }
        else {
            await useUserStore().login(credentials);
        }
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
                :title="$t('global.table.email')"
                icon="solar:letter-outline"
                :disabled="isLoading"
                :placeholder="t('auth.email_placeholder')"
                autocomplete="email"
                type="email"
                :errors="errors.email ? [errors.email] : []"
                v-bind="emailAttrs"
                required
                @keydown.enter="handleEnterKey"
            />
            <FormItemInput
                v-model="password"
                :title="$t('global.forms.password')"
                icon="solar:password-linear"
                :disabled="isLoading"
                :placeholder="$t('global.forms.password')"
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
