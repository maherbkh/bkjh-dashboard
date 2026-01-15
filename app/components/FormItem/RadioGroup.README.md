# FormItem RadioGroup Component

A fully reusable, TypeScript-strong RadioGroup component for Vue 3 with shadcn/reka-ui integration.

## Features

- ✅ Two display variants: **default** (standard radio buttons) and **box** (card-style selection)
- ✅ Full TypeScript support with generics
- ✅ Support for both string and numeric values
- ✅ Optional icons and descriptions
- ✅ Horizontal and vertical layouts
- ✅ Built-in validation error display
- ✅ Disabled state support (global and per-option)
- ✅ Fully accessible (ARIA, keyboard navigation)
- ✅ Consistent with other FormItem components

## Basic Usage

### Standard Radio Buttons (Default Variant)

```vue
<script setup lang="ts">
const selectedPlan = ref<string>('startup');

const planOptions = [
    { value: 'startup', label: 'Startup' },
    { value: 'business', label: 'Business' },
    { value: 'enterprise', label: 'Enterprise' },
];
</script>

<template>
    <FormItemRadioGroup
        id="plan-selector"
        v-model="selectedPlan"
        title="Select Plan"
        :required="true"
        :options="planOptions"
        variant="default"
    />
</template>
```

### Card-Style Selection (Box Variant)

```vue
<script setup lang="ts">
const selectedPlan = ref<string>('business');

const serverPlans = [
    {
        value: 'startup',
        label: 'Startup',
        description: '12GB/6 CPUs · 160 GB SSD disk',
        icon: 'solar:rocket-2-line-duotone',
    },
    {
        value: 'business',
        label: 'Business',
        description: '16GB/8 CPUs · 512 GB SSD disk',
        icon: 'solar:case-minimalistic-line-duotone',
    },
    {
        value: 'enterprise',
        label: 'Enterprise',
        description: '32GB/12 CPUs · 1024 GB SSD disk',
        icon: 'solar:server-square-cloud-line-duotone',
    },
];
</script>

<template>
    <FormItemRadioGroup
        id="server-plan"
        v-model="selectedPlan"
        title="Select Server Plan"
        description="Choose your subscription plan"
        :options="serverPlans"
        variant="box"
    />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | `''` | HTML id attribute for the radio group |
| `modelValue` | `T \| null` | `null` | The selected value (use with v-model) |
| `title` | `string` | `''` | Label text for the radio group |
| `description` | `string` | `''` | Optional description text below the title |
| `errors` | `string[]` | `[]` | Array of validation error messages |
| `required` | `boolean` | `false` | Shows required indicator (*) next to title |
| `disabled` | `boolean` | `false` | Disables the entire radio group |
| `class` | `string` | `''` | Additional CSS classes for the wrapper |
| `options` | `RadioOption<T>[]` | `[]` | Array of radio options (see below) |
| `variant` | `'default' \| 'box'` | `'default'` | Display style variant |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout orientation |

### RadioOption Type

```typescript
type RadioOption<T = string | number> = {
    value: T;              // The value for this option
    label: string;         // Display label
    description?: string;  // Optional description text
    disabled?: boolean;    // Disable this specific option
    icon?: string;         // Optional icon name (e.g., 'solar:rocket-2-line-duotone')
};
```

## Advanced Examples

### Horizontal Layout

```vue
<FormItemRadioGroup
    v-model="selectedSize"
    title="Select Size"
    :options="[
        { value: 'S', label: 'Small' },
        { value: 'M', label: 'Medium' },
        { value: 'L', label: 'Large' },
    ]"
    variant="default"
    orientation="horizontal"
/>
```

### With Validation Errors

```vue
<script setup lang="ts">
const selectedColor = ref<string | null>(null);
const colorErrors = ref<string[]>(['Please select a color']);
</script>

<template>
    <FormItemRadioGroup
        v-model="selectedColor"
        title="Select Color"
        :required="true"
        :options="colorOptions"
        variant="box"
        :errors="colorErrors"
    />
</template>
```

### Numeric Values

```vue
<script setup lang="ts">
const selectedQuantity = ref<number>(10);

const quantityOptions = [
    { value: 5, label: '5 items', description: 'Starter pack' },
    { value: 10, label: '10 items', description: 'Most popular' },
    { value: 20, label: '20 items', description: 'Bulk order' },
];
</script>

<template>
    <FormItemRadioGroup
        v-model="selectedQuantity"
        title="Select Quantity"
        :options="quantityOptions"
        variant="box"
    />
</template>
```

### Disabled Options

```vue
<FormItemRadioGroup
    v-model="selectedPlan"
    title="Select Plan"
    :options="[
        { value: 'free', label: 'Free' },
        { value: 'pro', label: 'Pro' },
        { value: 'enterprise', label: 'Enterprise', disabled: true },
    ]"
/>
```

### With Icons (Default Variant)

```vue
<FormItemRadioGroup
    v-model="selectedMethod"
    title="Payment Method"
    :options="[
        { value: 'card', label: 'Credit Card', icon: 'solar:card-bold' },
        { value: 'paypal', label: 'PayPal', icon: 'solar:wallet-bold' },
        { value: 'bank', label: 'Bank Transfer', icon: 'solar:bill-list-bold' },
    ]"
    variant="default"
/>
```

## Demo Component

A comprehensive demo component is available at `app/components/FormItem/RadioGroupDemo.vue`. It showcases:

- Default variant (vertical)
- Box variant with icons and descriptions
- Horizontal layout
- Validation errors
- Numeric values
- Disabled states
- Box variant horizontal

To use the demo, import it in your page:

```vue
<template>
    <FormItemRadioGroupDemo />
</template>
```

## Styling & Customization

The component uses Tailwind CSS classes and follows shadcn design patterns. Key styling features:

- **Default variant**: Clean radio buttons with labels
- **Box variant**: Card-based with hover, focus, and checked states
- **Error state**: Red border and error messages
- **Disabled state**: Reduced opacity and disabled cursor
- **Focus state**: Keyboard navigation ring

## Accessibility

- Full ARIA support through reka-ui
- Keyboard navigation with arrow keys
- Screen reader compatible
- Proper focus management
- Semantic HTML structure

## TypeScript Support

The component uses TypeScript generics for type safety:

```typescript
// String values
const stringValue = ref<string>('option1');

// Numeric values
const numericValue = ref<number>(1);

// The component automatically infers the correct type
<FormItemRadioGroup v-model="stringValue" ... />
<FormItemRadioGroup v-model="numericValue" ... />
```

## Integration with Forms

Use with your form validation library:

```vue
<script setup lang="ts">
const formData = ref({
    plan: 'startup',
});

const errors = ref<Record<string, string[]>>({
    plan: [],
});
</script>

<template>
    <form @submit.prevent="handleSubmit">
        <FormItemRadioGroup
            v-model="formData.plan"
            title="Plan"
            :required="true"
            :options="planOptions"
            :errors="errors.plan"
        />
    </form>
</template>
```

## Notes

- The component follows the same patterns as other FormItem components (Input, Select, Switch)
- Uses shadcn/reka-ui RadioGroup components under the hood
- Fully compatible with Vue 3 Composition API
- No external dependencies beyond what's already in your project
