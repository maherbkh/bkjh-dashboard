// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
    {
        rules: {
            'no-console': 'off', // allow console.log in TypeScript files
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'vue/require-default-prop': 'off',

        },
    },
);
