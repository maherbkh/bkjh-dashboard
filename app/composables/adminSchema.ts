import { z } from 'zod';
import type { AdminForm } from '~/types';

export const createAdminSchema = (t: (key: string) => string) => {
    return z.object({
        firstName: z.string()
            .min(1, t('form.validation.required'))
            .min(2, t('form.validation.min_length', { min: 2 }))
            .max(50, t('form.validation.max_length', { max: 50 })),
        
        lastName: z.string()
            .min(1, t('form.validation.required'))
            .min(2, t('form.validation.min_length', { min: 2 }))
            .max(50, t('form.validation.max_length', { max: 50 })),
        
        email: z.string()
            .min(1, t('form.validation.required'))
            .email(t('form.validation.email')),
        
        password: z.string()
            .optional()
            .refine((value) => {
                // Password is required for create operations
                // For update operations, it's optional
                if (value === undefined || value === '') {
                    return true; // Allow empty for updates
                }
                return value.length >= 8;
            }, {
                message: t('form.validation.min_length', { min: 8 })
            }),
        
        isSuperAdmin: z.boolean()
            .default(false),
        
        isActive: z.boolean()
            .default(true),
        
        occupationId: z.string()
            .nullable()
            .optional(),
        
        apps: z.array(z.string())
            .default(['dashboard'])
            .refine((apps) => apps.length > 0, {
                message: t('form.validation.required')
            })
    });
};

// Create schema for admin creation (password required)
export const createAdminCreateSchema = (t: (key: string) => string) => {
    return createAdminSchema(t).extend({
        password: z.string()
            .min(1, t('form.validation.required'))
            .min(8, t('form.validation.min_length', { min: 8 }))
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
                message: t('form.validation.password_strength')
            })
    });
};

// Available apps options
export const AVAILABLE_APPS = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'support', label: 'IT Support' },
    { value: 'academy', label: 'Academy' }
] as const;

export type AdminSchemaType = z.infer<ReturnType<typeof createAdminSchema>>;
export type AdminCreateSchemaType = z.infer<ReturnType<typeof createAdminCreateSchema>>;
