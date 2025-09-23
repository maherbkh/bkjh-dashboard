<script setup lang="ts">
import { toast } from 'vue-sonner';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useUserStore } from '~/stores/user';

const { t, locale, locales, setLocale } = useI18n();
const user = useUserStore().user;
const colorMode = useColorMode();

definePageMeta({
    middleware: 'auth',
});

const pageTitle = computed(() => t('profile.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('profile.singular'));

// Profile form with validation
const profileSchema = toTypedSchema(createProfileEditSchema(t));
const {
    handleSubmit: handleProfileSubmit,
    errors: profileErrors,
    values: profileValues,
    defineField: defineProfileField,
} = useForm({
    validationSchema: profileSchema,
    initialValues: {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        username: user?.username || '',
    },
});

const [firstName] = defineProfileField('firstName');
const [lastName] = defineProfileField('lastName');
const [email] = defineProfileField('email');
const [username] = defineProfileField('username');

// Password form with validation
const passwordSchema = toTypedSchema(createPasswordChangeSchema(t));
const {
    handleSubmit: handlePasswordSubmit,
    errors: passwordErrors,
    values: passwordValues,
    defineField: definePasswordField,
    resetForm: resetPasswordForm,
} = useForm({
    validationSchema: passwordSchema,
    initialValues: {
        old_password: '',
        new_password: '',
        new_password_confirmation: '',
    },
});

const [oldPassword] = definePasswordField('old_password');
const [newPassword] = definePasswordField('new_password');
const [newPasswordConfirmation] = definePasswordField('new_password_confirmation');

// Preferences form data
const preferencesForm = ref({
    theme: colorMode.preference,
    language: locale.value,
});

// Available languages for select
const availableLanguages = computed(() => {
    return (locales.value).map(l => ({
        id: l.code,
        name: l.name || l.code,
    }));
});

// Theme options
const themeOptions = [
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
    { id: 'system', name: 'System' },
];
const userStore = useUserStore();

// Form submission handlers
const saveProfile = handleProfileSubmit(async (values) => {
    try {
        const { data } = await useApiFetch('/api/v1/auth/profile', {
            method: 'PUT',
            body: values,
        });
        if (data.value) {
            await userStore.fetchAuthUser();
        }
        toast.success(t('action.message.updated_successfully', { model: t('profile.singular') }));
    }
    catch (error) {
        console.error('Profile update error:', error);
        toast.error(t('action.message.update_failed', { model: t('profile.singular') }));
    }
});

const changePassword = handlePasswordSubmit(async (values) => {
    console.log('Form submitted with values:', values);
    try {
        const { data } = await useApiFetch('/api/v1/auth/change-password', {
            method: 'POST',
            body: values,
        });
        toast.success(t('action.message.updated_successfully', { model: t('form.password') }));
        // Reset form
        resetPasswordForm();
    }
    catch (error) {
        console.error('Password change error:', error);
        toast.error(t('action.message.update_failed', { model: t('form.password') }));
    }
}, (errors) => {
    console.log('Form validation errors:', errors);
});

const savePreferences = async () => {
    try {
        // Update theme
        colorMode.preference = preferencesForm.value.theme;
        // Update language
        setLocale(preferencesForm.value.language);
        toast.success(t('action.message.updated_successfully', { model: t('form.preferences') }));
    }
    catch (error) {
        toast.error(t('action.message.update_failed', { model: t('form.preferences') }));
    }
};

// Watch for theme changes
watch(() => colorMode.preference, (newTheme) => {
    preferencesForm.value.theme = newTheme;
});

// Watch for language changes
watch(() => locale.value, (newLocale) => {
    preferencesForm.value.language = newLocale;
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});
</script>

<template>
    <div class="flex flex-col gap-6">
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon || 'solar:user-id-outline'"
        />

        <div class="font-semibold text-xl">
            <span class="font-light">{{ t('auth.welcome_back') }}</span>, {{ user?.firstName }}
        </div>

        <Tabs
            default-value="edit-profile"
            class="w-full flex lg:flex-row flex-col gap-4"
            orientation="vertical"
        >
            <TabsList class="flex flex-col h-fit w-48 space-y-1">
                <TabsTrigger
                    value="edit-profile"
                    class="w-full justify-start"
                >
                    <Icon
                        name="solar:pen-new-round-outline"
                        class="mr-2 !size-4 shrink-0"
                    />
                    {{ t('profile.singular') }}
                </TabsTrigger>
                <TabsTrigger
                    value="change-password"
                    class="w-full justify-start"
                >
                    <Icon
                        name="solar:lock-password-outline"
                        class="mr-2 !size-4 shrink-0"
                    />
                    {{ t('form.password') }}
                </TabsTrigger>
                <TabsTrigger
                    value="preferences"
                    class="w-full justify-start"
                >
                    <Icon
                        name="solar:settings-outline"
                        class="mr-2 !size-4 shrink-0"
                    />
                    {{ t('preference.singular') }}
                </TabsTrigger>
            </TabsList>

            <!-- Edit Profile Tab -->
            <TabsContent value="edit-profile">
                <Card>
                    <CardHeader>
                        <CardTitle>{{ t('profile.singular') }}</CardTitle>
                        <CardDescription>{{ t('profile.description') }}</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <form
                            class="space-y-4"
                            @submit.prevent="saveProfile"
                        >
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormItemInput
                                    v-model="firstName"
                                    :title="t('user.first_name')"
                                    :placeholder="t('user.first_name')"
                                    :error="profileErrors.firstName"
                                    required
                                />
                                <FormItemInput
                                    v-model="lastName"
                                    :title="t('user.last_name')"
                                    :placeholder="t('user.last_name')"
                                    :error="profileErrors.lastName"
                                    required
                                />
                            </div>
                            <FormItemInput
                                v-model="email"
                                :title="t('form.email')"
                                :placeholder="t('form.email')"
                                :error="profileErrors.email"
                                type="email"
                                required
                            />
                            <FormItemInput
                                v-model="username"
                                :title="t('user.username')"
                                :placeholder="t('user.username')"
                                :error="profileErrors.username"
                                required
                            />
                            <div class="flex justify-end">
                                <LazyButton type="submit">
                                    {{ t('action.save') }}
                                </LazyButton>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            <!-- Change Password Tab -->
            <TabsContent value="change-password">
                <Card>
                    <CardHeader>
                        <CardTitle>{{ t('form.password') }}</CardTitle>
                        <CardDescription>{{ t('form.password_description') }}</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <form
                            class="space-y-4"
                            @submit.prevent="changePassword"
                        >
                            <FormItemInput
                                v-model="oldPassword"
                                :title="t('form.current_password')"
                                :placeholder="t('form.current_password')"
                                :error="passwordErrors.old_password"
                                type="password"
                                required
                            />
                            <FormItemInput
                                v-model="newPassword"
                                :use-show-password="true"
                                :title="t('form.new_password')"
                                :placeholder="t('form.new_password')"
                                :error="passwordErrors.new_password"
                                type="password"
                                required
                            />
                            <FormItemInput
                                v-model="newPasswordConfirmation"
                                :use-show-password="true"
                                :title="t('form.confirm_password')"
                                :placeholder="t('form.confirm_password')"
                                :error="passwordErrors.new_password_confirmation"
                                type="password"
                                required
                            />
                            <div class="flex justify-end">
                                <LazyButton type="submit">
                                    {{ t('action.update') }}
                                </LazyButton>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            <!-- Preferences Tab -->
            <TabsContent value="preferences">
                <Card>
                    <CardHeader>
                        <CardTitle>{{ t('preference.singular') }}</CardTitle>
                        <CardDescription>{{ t('preference.description') }}</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-6">
                        <div class="space-y-2">
                            <label class="text-sm font-medium">{{ t('theme.singular') }}</label>
                            <p class="text-sm text-muted-foreground">
                                {{ t('theme.description') }}
                            </p>
                            <FormItemSelect
                                v-model="preferencesForm.theme"
                                :searchable="false"
                                :data="themeOptions"
                                key-value="id"
                                name-value="name"
                                :placeholder="t('action.select') + ' ' + t('theme.singular')"
                            />
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-medium">{{ t('language.singular') }}</label>
                            <p class="text-sm text-muted-foreground">
                                {{ t('language.description') }}
                            </p>
                            <FormItemSelect
                                v-model="preferencesForm.language"
                                :searchable="false"
                                :data="availableLanguages"
                                key-value="id"
                                name-value="name"
                                :placeholder="t('action.select') + ' ' + t('language.singular')"
                            />
                        </div>

                        <div class="flex justify-end">
                            <LazyButton @click="savePreferences">
                                {{ t('action.save') }}
                            </LazyButton>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
</template>
