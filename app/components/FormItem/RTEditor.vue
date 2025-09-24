<template>
    <ClientOnly>
        <div
            class="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            :class="{ 'opacity-50 cursor-not-allowed': disabled, 'bg-muted/30': readonly }"
        >
            <!-- Toolbar -->
            <div
                v-if="showToolbar && editor"
                class="border-b border-border bg-muted/30 p-2 flex items-center gap-1.5 flex-wrap"
            >
                <!-- Text Formatting -->
                <Button
                    variant="ghost"
                    size="icon"
                    :disabled="!editor.can().chain().focus().toggleBold().run()"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('bold') }"
                    @click="editor.chain().focus().toggleBold().run()"
                >
                    <Icon
                        name="oui:editor-bold"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :disabled="!editor.can().chain().focus().toggleItalic().run()"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('italic') }"
                    @click="editor.chain().focus().toggleItalic().run()"
                >
                    <Icon
                        name="oui:editor-italic"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :disabled="!editor.can().chain().focus().toggleStrike().run()"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('strike') }"
                    @click="editor.chain().focus().toggleStrike().run()"
                >
                    <Icon
                        name="oui:editor-strike"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :disabled="!editor.can().chain().focus().toggleUnderline().run()"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('underline') }"
                    @click="editor.chain().focus().toggleUnderline().run()"
                >
                    <Icon
                        name="oui:editor-underline"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :disabled="!editor.can().chain().focus().toggleCode().run()"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('code') }"
                    @click="editor.chain().focus().toggleCode().run()"
                >
                    <Icon
                        name="oui:editor-code-block"
                        class="!size-4 shrink-0"
                    />
                </Button>

                <!-- Color Picker -->
                <input
                    type="color"
                    class="flex place-content-center items-center border border-border cursor-pointer size-8 !p-0"
                    :value="editor.getAttributes('textStyle').color"
                    @input="handleColorChange"
                >
                <Button
                    variant="ghost"
                    size="sm"
                    @click="editor.chain().focus().unsetColor().run()"
                >
                    Remove Color
                </Button>

                <!-- Headings -->
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('heading', { level: 1 }) }"
                    @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                >
                    <span class="text-xs font-bold">H1</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('heading', { level: 2 }) }"
                    @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                >
                    <span class="text-xs font-bold">H2</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('heading', { level: 3 }) }"
                    @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                >
                    <span class="text-xs font-bold">H3</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('heading', { level: 4 }) }"
                    @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
                >
                    <span class="text-xs font-bold">H4</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('heading', { level: 5 }) }"
                    @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
                >
                    <span class="text-xs font-bold">H5</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('heading', { level: 6 }) }"
                    @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
                >
                    <span class="text-xs font-bold">H6</span>
                </Button>

                <!-- Text Alignment -->
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive({ textAlign: 'left' }) }"
                    @click="editor.chain().focus().setTextAlign('left').run()"
                >
                    <Icon
                        name="oui:editor-align-left"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive({ textAlign: 'center' }) }"
                    @click="editor.chain().focus().setTextAlign('center').run()"
                >
                    <Icon
                        name="oui:editor-align-center"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive({ textAlign: 'right' }) }"
                    @click="editor.chain().focus().setTextAlign('right').run()"
                >
                    <Icon
                        name="oui:editor-align-right"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive({ textAlign: 'justify' }) }"
                    @click="editor.chain().focus().setTextAlign('justify').run()"
                >
                    <Icon
                        name="solar:hamburger-menu-outline"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    @click="editor.chain().focus().unsetTextAlign().run()"
                >
                    <Icon
                        name="solar:list-cross-minimalistic-bold"
                        class="!size-4 shrink-0"
                    />
                </Button>

                <!-- Links -->
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('link') }"
                    @click="setLink"
                >
                    <Icon
                        name="solar:link-bold"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :disabled="!editor.isActive('link')"
                    @click="editor.chain().focus().unsetLink().run()"
                >
                    <Icon
                        name="solar:link-broken-linear"
                        class="!size-4 shrink-0"
                    />
                </Button>

                <!-- Lists -->
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('bulletList') }"
                    @click="editor.chain().focus().toggleBulletList().run()"
                >
                    <Icon
                        name="oui:editor-unordered-list"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('orderedList') }"
                    @click="editor.chain().focus().toggleOrderedList().run()"
                >
                    <Icon
                        name="oui:editor-ordered-list"
                        class="!size-4 shrink-0"
                    />
                </Button>

                <!-- Block Elements -->
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('codeBlock') }"
                    @click="editor.chain().focus().toggleCodeBlock().run()"
                >
                    <Icon
                        name="oui:editor-code-block"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': editor.isActive('blockquote') }"
                    @click="editor.chain().focus().toggleBlockquote().run()"
                >
                    <Icon
                        name="oui:quote"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    @click="editor.chain().focus().setHorizontalRule().run()"
                >
                    <Icon
                        name="octicon:horizontal-rule-24"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    @click="editor.chain().focus().setHardBreak().run()"
                >
                    <Icon
                        name="carbon:text-new-line"
                        class="!size-4 shrink-0"
                    />
                </Button>

                <!-- Undo/Redo -->
                <Button
                    variant="ghost"
                    size="icon"
                    :disabled="!editor.can().chain().focus().undo().run()"
                    @click="editor.chain().focus().undo().run()"
                >
                    <Icon
                        name="oui:editor-undo"
                        class="!size-4 shrink-0"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    :disabled="!editor.can().chain().focus().redo().run()"
                    @click="editor.chain().focus().redo().run()"
                >
                    <Icon
                        name="oui:editor-redo"
                        class="!size-4 shrink-0"
                    />
                </Button>
            </div>

            <!-- Editor Content -->
            <div class="relative">
                <editor-content
                    :editor="editor"
                    class="prose prose-sm max-w-none focus:outline-none p-4 min-h-[200px] text-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-foreground [&_p]:leading-relaxed [&_p]:text-foreground [&_ul]:list-disc [&_ul]:list-inside [&_ol]:list-decimal [&_ol]:list-inside [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:bg-muted [&_code]:text-foreground [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:bg-muted [&_pre_code]:bg-transparent [&_pre_code]:p-0"
                    :class="{
                        'border border-border rounded-md': !showToolbar,
                        'border-0': showToolbar,
                    }"
                />
            </div>

            <!-- Character Count (Optional) -->
            <div
                v-if="showCharacterCount"
                class="text-xs text-muted-foreground text-right p-2 border-t border-border"
            >
                {{ characterCount }} / {{ maxLength || '∞' }} characters
            </div>
        </div>
    </ClientOnly>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import { Button } from '~/components/ui/button';
import { watch, onMounted, onBeforeUnmount, ref, computed } from 'vue';

// Props
interface Props {
    modelValue?: string;
    placeholder?: string;
    showToolbar?: boolean;
    showCharacterCount?: boolean;
    maxLength?: number;
    minHeight?: string;
    disabled?: boolean;
    readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: 'Start typing...',
    showToolbar: true,
    showCharacterCount: false,
    maxLength: undefined,
    minHeight: '200px',
    disabled: false,
    readonly: false,
});

// Emits
const emit = defineEmits<{
    'update:modelValue': [value: string];
    'change': [value: string];
    'focus': [event: FocusEvent];
    'blur': [event: FocusEvent];
}>();

// Editor instance
const editor = ref<any>(null);

// Character count
const characterCount = computed(() => {
    return editor.value?.storage.characterCount.characters() || 0;
});

// Color change handler
const handleColorChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target && editor.value) {
        editor.value.chain().focus().setColor(target.value).run();
    }
};

// Link function
const setLink = () => {
    const previousUrl = editor.value?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
        editor.value?.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
    }

    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

// Initialize editor
const initializeEditor = () => {
    const extensions = [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3, 4, 5, 6],
            },
        }),
        Underline,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        Image.configure({
            inline: true,
            allowBase64: true,
        }),
        Link.configure({
            openOnClick: false,
        }),
        TextStyle,
        Color,
    ];

    // Add character count if requested
    if (props.showCharacterCount) {
        extensions.push(
            CharacterCount.configure({
                limit: props.maxLength,
            }),
        );
    }

    editor.value = new Editor({
        content: props.modelValue,
        extensions,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none',
                style: `min-height: ${props.minHeight}`,
                placeholder: props.placeholder,
            },
        },
        editable: !props.readonly,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            emit('update:modelValue', html);
            emit('change', html);
        },
        onFocus: ({ event }) => {
            emit('focus', event);
        },
        onBlur: ({ event }) => {
            emit('blur', event);
        },
    });
};

// Watch for model value changes
watch(() => props.modelValue, (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
        editor.value.commands.setContent(newValue, { emitUpdate: false });
    }
});

// Watch for disabled state
watch(() => props.disabled, (newValue) => {
    if (editor.value) {
        editor.value.setEditable(!newValue);
    }
});

// Watch for readonly state
watch(() => props.readonly, (newValue) => {
    if (editor.value) {
        editor.value.setEditable(!newValue);
    }
});

// Lifecycle
onMounted(() => {
    initializeEditor();
});

onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy();
    }
});

// Expose editor instance for parent components
defineExpose({
    editor: computed(() => editor.value),
    focus: () => editor.value?.commands.focus(),
    blur: () => editor.value?.commands.blur(),
    clear: () => editor.value?.commands.clearContent(),
    getHTML: () => editor.value?.getHTML(),
    getJSON: () => editor.value?.getJSON(),
    getText: () => editor.value?.getText(),
});
</script>
