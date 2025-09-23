# RTEditor Component

A powerful, optimized Rich Text Editor component built with Tiptap for Nuxt 4+ and Vue 3+ using Composition API.

## Features

- ✅ **Composition API**: Built with Vue 3+ Composition API
- ✅ **Nuxt 4+ Optimized**: Fully compatible with Nuxt 4+
- ✅ **TypeScript Support**: Full TypeScript support with proper typing
- ✅ **v-model Support**: Two-way data binding with v-model
- ✅ **Customizable Toolbar**: Rich toolbar with formatting options
- ✅ **Character Count**: Optional character counting with max length
- ✅ **Responsive Design**: Mobile-friendly design
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation
- ✅ **Theme Integration**: Uses your design system colors
- ✅ **Performance Optimized**: Lazy loading and efficient rendering

## Installation

The component requires the following Tiptap packages:

```bash
npm install @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-character-count
```

## Basic Usage

```vue
<template>
  <RTEditor
    v-model="content"
    placeholder="Start typing..."
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const content = ref('<p>Initial content</p>')

const handleChange = (newContent: string) => {
  console.log('Content changed:', newContent)
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | The HTML content of the editor |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text when editor is empty |
| `showToolbar` | `boolean` | `true` | Whether to show the toolbar |
| `showCharacterCount` | `boolean` | `false` | Whether to show character count |
| `maxLength` | `number` | `undefined` | Maximum character limit |
| `minHeight` | `string` | `'200px'` | Minimum height of the editor |
| `disabled` | `boolean` | `false` | Whether the editor is disabled |
| `readonly` | `boolean` | `false` | Whether the editor is readonly |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted when content changes (for v-model) |
| `change` | `string` | Emitted when content changes |
| `focus` | `FocusEvent` | Emitted when editor gains focus |
| `blur` | `FocusEvent` | Emitted when editor loses focus |

## Exposed Methods

The component exposes the following methods via `defineExpose`:

```typescript
interface RTEditorExpose {
  editor: ComputedRef<Editor | null>
  focus: () => void
  blur: () => void
  clear: () => void
  getHTML: () => string | undefined
  getJSON: () => object | undefined
  getText: () => string | undefined
}
```

## Examples

### Basic Editor

```vue
<RTEditor v-model="content" />
```

### Editor with Character Count

```vue
<RTEditor
  v-model="content"
  :show-character-count="true"
  :max-length="500"
/>
```

### Editor without Toolbar

```vue
<RTEditor
  v-model="content"
  :show-toolbar="false"
/>
```

### Readonly Editor

```vue
<RTEditor
  v-model="content"
  :readonly="true"
  :show-toolbar="false"
/>
```

### Disabled Editor

```vue
<RTEditor
  v-model="content"
  :disabled="true"
/>
```

### Custom Height Editor

```vue
<RTEditor
  v-model="content"
  min-height="300px"
/>
```

### Form Integration

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>Title</label>
      <input v-model="form.title" type="text" />
    </div>
    <div>
      <label>Content</label>
      <RTEditor
        v-model="form.content"
        placeholder="Write your content..."
        :show-character-count="true"
        :max-length="2000"
      />
    </div>
    <button type="submit">Save</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  title: '',
  content: ''
})

const handleSubmit = () => {
  console.log('Form data:', form.value)
}
</script>
```

### Using Exposed Methods

```vue
<template>
  <div>
    <RTEditor ref="editorRef" v-model="content" />
    <div class="mt-4 space-x-2">
      <Button @click="focusEditor">Focus</Button>
      <Button @click="clearEditor">Clear</Button>
      <Button @click="getContent">Get Content</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const editorRef = ref()
const content = ref('<p>Initial content</p>')

const focusEditor = () => {
  editorRef.value?.focus()
}

const clearEditor = () => {
  editorRef.value?.clear()
}

const getContent = () => {
  const html = editorRef.value?.getHTML()
  const json = editorRef.value?.getJSON()
  const text = editorRef.value?.getText()
  
  console.log('HTML:', html)
  console.log('JSON:', json)
  console.log('Text:', text)
}
</script>
```

## Styling

The component uses Tailwind CSS classes and integrates with your design system. It automatically adapts to light/dark themes using CSS variables.

### Custom Styling

You can customize the appearance by overriding the CSS classes:

```css
.rt-editor {
  /* Custom editor container styles */
}

.rt-editor__toolbar {
  /* Custom toolbar styles */
}

.rt-editor__content {
  /* Custom content area styles */
}
```

## Extensions

The component includes the following Tiptap extensions:

- **StarterKit**: Basic formatting (bold, italic, headings, lists, etc.)
- **Underline**: Underline text formatting
- **CharacterCount**: Character counting functionality

### Adding More Extensions

To add more extensions, modify the `initializeEditor` function:

```typescript
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

// In the initializeEditor function
extensions: [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
  }),
  Underline,
  Link,
  Image,
  ...(props.showCharacterCount ? [CharacterCount] : []),
],
```

## Performance Tips

1. **Lazy Loading**: The editor is only initialized when the component is mounted
2. **Memory Management**: The editor is properly destroyed when the component is unmounted
3. **Reactive Updates**: Content updates are optimized to prevent unnecessary re-renders
4. **Event Handling**: Events are properly cleaned up to prevent memory leaks

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- Vue 3.0+
- Nuxt 4.0+
- Tiptap 2.0+
- Tailwind CSS 3.0+

## License

This component is part of your project and follows the same license terms.
