<template>
    <div class="space-y-6 p-6">
        <div>
            <h2 class="text-2xl font-bold mb-4">
                Rich Text Editor Examples
            </h2>

            <!-- Basic Usage -->
            <div class="space-y-2">
                <h3 class="text-lg font-semibold">
                    Basic Editor
                </h3>
                <RTEditor
                    v-model="basicContent"
                    placeholder="Start typing your content here..."
                    @change="handleContentChange"
                />
                <div class="text-sm text-muted-foreground">
                    Content: {{ basicContent.substring(0, 100) }}...
                </div>
            </div>

            <!-- Editor with Character Count -->
            <div class="space-y-2">
                <h3 class="text-lg font-semibold">
                    Editor with Character Count
                </h3>
                <RTEditor
                    v-model="countedContent"
                    :show-character-count="true"
                    :max-length="500"
                    placeholder="Type up to 500 characters..."
                />
            </div>

            <!-- Editor without Toolbar -->
            <div class="space-y-2">
                <h3 class="text-lg font-semibold">
                    Editor without Toolbar
                </h3>
                <RTEditor
                    v-model="minimalContent"
                    :show-toolbar="false"
                    placeholder="Minimal editor without toolbar..."
                />
            </div>

            <!-- Readonly Editor -->
            <div class="space-y-2">
                <h3 class="text-lg font-semibold">
                    Readonly Editor
                </h3>
                <RTEditor
                    v-model="readonlyContent"
                    :readonly="true"
                    :show-toolbar="false"
                />
            </div>

            <!-- Disabled Editor -->
            <div class="space-y-2">
                <h3 class="text-lg font-semibold">
                    Disabled Editor
                </h3>
                <RTEditor
                    v-model="disabledContent"
                    :disabled="true"
                />
            </div>

            <!-- Custom Height Editor -->
            <div class="space-y-2">
                <h3 class="text-lg font-semibold">
                    Custom Height Editor
                </h3>
                <RTEditor
                    v-model="customHeightContent"
                    min-height="300px"
                    placeholder="This editor has a custom height of 300px..."
                />
            </div>

            <!-- Form Integration Example -->
            <div class="space-y-2">
                <h3 class="text-lg font-semibold">
                    Form Integration
                </h3>
                <form
                    class="space-y-4"
                    @submit.prevent="handleSubmit"
                >
                    <div>
                        <label class="block text-sm font-medium mb-2">Article Title</label>
                        <input
                            v-model="formData.title"
                            type="text"
                            class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter article title..."
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Article Content</label>
                        <RTEditor
                            v-model="formData.content"
                            placeholder="Write your article content here..."
                            :show-character-count="true"
                            :max-length="2000"
                        />
                    </div>
                    <div class="flex gap-2">
                        <Button
                            type="submit"
                            :disabled="!formData.title || !formData.content"
                        >
                            Save Article
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            @click="resetForm"
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Basic content
const basicContent = ref('<p>This is a <strong>basic</strong> rich text editor example.</p>');

// Content with character count
const countedContent = ref('<p>This editor has character counting enabled.</p>');

// Minimal content
const minimalContent = ref('<p>This editor has no toolbar.</p>');

// Readonly content
const readonlyContent = ref(`
  <h2>Readonly Content</h2>
  <p>This content is <strong>readonly</strong> and cannot be edited.</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
`);

// Disabled content
const disabledContent = ref('<p>This editor is disabled.</p>');

// Custom height content
const customHeightContent = ref('<p>This editor has a custom height.</p>');

// Form data
const formData = ref({
    title: '',
    content: '',
});

// Event handlers
const handleContentChange = (content: string) => {
    console.log('Content changed:', content);
};

const handleSubmit = () => {
    console.log('Form submitted:', formData.value);
    // Handle form submission
};

const resetForm = () => {
    formData.value = {
        title: '',
        content: '',
    };
};
</script>
