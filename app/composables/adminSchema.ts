import { z } from 'zod';
import type { AdminForm } from '~/types';

export const createAdminSchema = (t: (key: string, params?: Record<string, string | number>) => string) => {
    return z.object({
        firstName: z.string()
            .min(1, t('validation.required'))
            .min(2, t('validation.min_length', { min: 2 }))
            .max(50, t('validation.max_length', { max: 50 })),
        
        lastName: z.string()
            .min(1, t('validation.required'))
            .min(2, t('validation.min_length', { min: 2 }))
            .max(50, t('validation.max_length', { max: 50 })),
        
        email: z.string()
            .min(1, t('validation.required'))
            .email(t('validation.invalid')),
        
        password: z.string()
            .min(8, t('validation.min_length', { min: 8 }))
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
                message: t('validation.password_strength')
            })
            .optional(),
        
        isSuperAdmin: z.boolean()
            .default(false),
        
        isActive: z.boolean()
            .default(true),
        
        occupationId: z.string()
            .uuid(t('validation.uuid'))
            .nullable()
            .optional(),
        
        apps: z.array(z.enum(['dashboard', 'support', 'academy']))
            .default(['dashboard'])
            .refine((apps) => apps.length > 0, {
                message: t('validation.required')
            })
    });
};

// Create schema for admin creation (password required)
export const createAdminCreateSchema = (t: (key: string, params?: Record<string, string | number>) => string) => {
    return createAdminSchema(t).extend({
        password: z.string()
            .min(1, t('validation.required'))
            .min(8, t('validation.min_length', { min: 8 }))
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
                message: t('validation.password_strength')
            })
    });
};

// Update schema for admin updates (password excluded from DTO)
export const createAdminUpdateSchema = (t: (key: string, params?: Record<string, string | number>) => string) => {
    return createAdminSchema(t).omit({ password: true });
};

// Available apps options
export const AVAILABLE_APPS = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'support', label: 'IT Support' },
    { value: 'academy', label: 'Academy' }
] as const;

export type AdminSchemaType = z.infer<ReturnType<typeof createAdminSchema>>;
export type AdminCreateSchemaType = z.infer<ReturnType<typeof createAdminCreateSchema>>;
export type AdminUpdateSchemaType = z.infer<ReturnType<typeof createAdminUpdateSchema>>;
