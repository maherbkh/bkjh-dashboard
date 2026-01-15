<!--
  Demo/Test Component for FormItem RadioGroup
  
  This component demonstrates both variants (default and box) of the RadioGroup FormItem.
  You can delete this file after testing or use it as a reference.
-->

<script setup lang="ts">
const { t } = useI18n();

// Test data for standard radio buttons
const selectedPlan = ref<string>('startup');
const planOptions = [
    { value: 'startup', label: 'Startup' },
    { value: 'business', label: 'Business' },
    { value: 'enterprise', label: 'Enterprise' },
];

// Test data for box variant
const selectedServerPlan = ref<string>('business');
const serverPlanOptions = [
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
        disabled: false,
    },
];

// Test data for horizontal layout
const selectedSize = ref<string>('M');
const sizeOptions = [
    { value: 'S', label: 'Small' },
    { value: 'M', label: 'Medium' },
    { value: 'L', label: 'Large' },
    { value: 'XL', label: 'Extra Large' },
];

// Test data with errors
const selectedColor = ref<string | null>(null);
const colorOptions = [
    { value: 'red', label: 'Red', icon: 'solar:palette-bold' },
    { value: 'blue', label: 'Blue', icon: 'solar:palette-bold' },
    { value: 'green', label: 'Green', icon: 'solar:palette-bold' },
];
const colorErrors = ref<string[]>(['Please select a color']);

// Numeric values test
const selectedQuantity = ref<number>(10);
const quantityOptions = [
    { value: 5, label: '5 items', description: 'Starter pack' },
    { value: 10, label: '10 items', description: 'Most popular' },
    { value: 20, label: '20 items', description: 'Bulk order' },
];
</script>

<template>
    <div class="p-8 space-y-8 max-w-4xl mx-auto">
        <div>
            <h1 class="text-3xl font-bold mb-2">
                RadioGroup FormItem Demo
            </h1>
            <p class="text-muted-foreground">
                Testing both default and box variants with various configurations
            </p>
        </div>

        <Separator />

        <!-- Example 1: Default Variant (Vertical) -->
        <Card>
            <CardHeader>
                <CardTitle>Example 1: Default Variant (Vertical)</CardTitle>
                <CardDescription>Standard radio buttons with vertical layout</CardDescription>
            </CardHeader>
            <CardContent>
                <FormItemRadioGroup
                    id="plan-selector"
                    v-model="selectedPlan"
                    title="Select Plan"
                    :required="true"
                    :options="planOptions"
                    variant="default"
                />
                <div class="mt-4 p-3 bg-muted rounded-md">
                    <p class="text-sm font-mono">
                        Selected: {{ selectedPlan }}
                    </p>
                </div>
            </CardContent>
        </Card>

        <!-- Example 2: Box Variant with Icons and Descriptions -->
        <Card>
            <CardHeader>
                <CardTitle>Example 2: Box Variant (Card Style)</CardTitle>
                <CardDescription>Card-based selection with icons and descriptions</CardDescription>
            </CardHeader>
            <CardContent>
                <FormItemRadioGroup
                    id="server-plan-selector"
                    v-model="selectedServerPlan"
                    title="Select Server Plan"
                    description="Choose your subscription plan"
                    :required="true"
                    :options="serverPlanOptions"
                    variant="box"
                />
                <div class="mt-4 p-3 bg-muted rounded-md">
                    <p class="text-sm font-mono">
                        Selected: {{ selectedServerPlan }}
                    </p>
                </div>
            </CardContent>
        </Card>

        <!-- Example 3: Horizontal Layout -->
        <Card>
            <CardHeader>
                <CardTitle>Example 3: Horizontal Layout</CardTitle>
                <CardDescription>Radio buttons arranged horizontally</CardDescription>
            </CardHeader>
            <CardContent>
                <FormItemRadioGroup
                    id="size-selector"
                    v-model="selectedSize"
                    title="Select Size"
                    :options="sizeOptions"
                    variant="default"
                    orientation="horizontal"
                />
                <div class="mt-4 p-3 bg-muted rounded-md">
                    <p class="text-sm font-mono">
                        Selected: {{ selectedSize }}
                    </p>
                </div>
            </CardContent>
        </Card>

        <!-- Example 4: With Validation Errors -->
        <Card>
            <CardHeader>
                <CardTitle>Example 4: With Validation Errors</CardTitle>
                <CardDescription>Showing error state and validation messages</CardDescription>
            </CardHeader>
            <CardContent>
                <FormItemRadioGroup
                    id="color-selector"
                    v-model="selectedColor"
                    title="Select Color"
                    :required="true"
                    :options="colorOptions"
                    variant="box"
                    :errors="colorErrors"
                />
                <Button
                    class="mt-4"
                    @click="() => { selectedColor = 'red'; colorErrors = []; }"
                >
                    Clear Error
                </Button>
                <div class="mt-4 p-3 bg-muted rounded-md">
                    <p class="text-sm font-mono">
                        Selected: {{ selectedColor || 'null' }}
                    </p>
                </div>
            </CardContent>
        </Card>

        <!-- Example 5: Numeric Values -->
        <Card>
            <CardHeader>
                <CardTitle>Example 5: Numeric Values</CardTitle>
                <CardDescription>Using numbers as values instead of strings</CardDescription>
            </CardHeader>
            <CardContent>
                <FormItemRadioGroup
                    id="quantity-selector"
                    v-model="selectedQuantity"
                    title="Select Quantity"
                    :options="quantityOptions"
                    variant="box"
                />
                <div class="mt-4 p-3 bg-muted rounded-md">
                    <p class="text-sm font-mono">
                        Selected: {{ selectedQuantity }} (Type: {{ typeof selectedQuantity }})
                    </p>
                </div>
            </CardContent>
        </Card>

        <!-- Example 6: Disabled State -->
        <Card>
            <CardHeader>
                <CardTitle>Example 6: Disabled State</CardTitle>
                <CardDescription>Entire radio group disabled</CardDescription>
            </CardHeader>
            <CardContent>
                <FormItemRadioGroup
                    id="disabled-selector"
                    v-model="selectedPlan"
                    title="Disabled Radio Group"
                    :options="planOptions"
                    variant="default"
                    :disabled="true"
                />
            </CardContent>
        </Card>

        <!-- Example 7: Box Variant Horizontal -->
        <Card>
            <CardHeader>
                <CardTitle>Example 7: Box Variant Horizontal</CardTitle>
                <CardDescription>Card-style selection in horizontal layout</CardDescription>
            </CardHeader>
            <CardContent>
                <FormItemRadioGroup
                    id="size-box-selector"
                    v-model="selectedSize"
                    title="Select Size"
                    description="Choose your preferred size"
                    :options="sizeOptions"
                    variant="box"
                    orientation="horizontal"
                />
                <div class="mt-4 p-3 bg-muted rounded-md">
                    <p class="text-sm font-mono">
                        Selected: {{ selectedSize }}
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
