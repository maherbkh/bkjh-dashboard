// Tiptap Extensions Composable
// Centralized exports for all Tiptap extensions used in the project

// Import all extensions
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';

// Export with Tiptap prefix for external use
export { StarterKit as TiptapStarterKit };
export { Underline as TiptapUnderline };
export { Image as TiptapImage };
export { TextAlign as TiptapTextAlign };
export { TextStyle as TipTapTextStyle };
export { Color as TiptapColor };
export { Link as TiptapLink };
export { CharacterCount as TiptapCharacterCount };

// Re-export core Tiptap components
export { Editor, EditorContent } from '@tiptap/vue-3';

// Utility function to get all extensions with common configuration
export const useTiptapExtensions = (options: {
    showCharacterCount?: boolean;
    maxLength?: number;
} = {}) => {
    const extensions: any[] = [
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
    if (options.showCharacterCount) {
        extensions.push(
            CharacterCount.configure({
                limit: options.maxLength,
            }),
        );
    }

    return extensions;
};

// Common editor configuration
export const useTiptapConfig = (options: {
    content?: string;
    placeholder?: string;
    minHeight?: string;
    readonly?: boolean;
    onUpdate?: (props: { editor: any }) => void;
    onFocus?: (props: { event: FocusEvent }) => void;
    onBlur?: (props: { event: FocusEvent }) => void;
}) => {
    return {
        content: options.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none',
                style: `min-height: ${options.minHeight || '200px'}`,
                placeholder: options.placeholder || 'Start typing...',
            },
        },
        editable: !options.readonly,
        onUpdate: options.onUpdate,
        onFocus: options.onFocus,
        onBlur: options.onBlur,
    };
};
