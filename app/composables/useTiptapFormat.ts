// Utilities for formatting actions with Tiptap
// Inspired by element-tiptap's format_clear util
// Reference: https://github.com/Leecason/element-tiptap/blob/master/src/utils/format_clear.ts

export interface ClearFormattingOptions {
    /** Reset block types to paragraph */
    resetBlocks?: boolean;
    /** Remove text alignment */
    resetAlignment?: boolean;
    /** Also remove colors (TextStyle/Color) */
    resetColors?: boolean;
}

export function clearFormatting(editor: any, opts: ClearFormattingOptions = {}) {
    const options: Required<ClearFormattingOptions> = {
        resetBlocks: true,
        resetAlignment: true,
        resetColors: true,
        ...opts,
    } as Required<ClearFormattingOptions>;

    if (!editor) return;

    const chain = editor.chain().focus();

    // 1) Remove all inline marks (bold/italic/underline/strike/code/link/...)
    chain.unsetAllMarks();

    // 2) Optional: remove color/textStyle marks
    if (options.resetColors) {
        // Color extension exposes unsetColor command
        // Guard if not registered
        if (typeof editor.commands.unsetColor === 'function') {
            chain.unsetColor();
        }
        // TextStyle cleanup—removing mark range
        try {
            chain.unsetMark('textStyle');
        }
        catch { /* no-op */ }
    }

    // 3) Optional: reset alignment (TextAlign extension)
    if (options.resetAlignment && typeof editor.commands.unsetTextAlign === 'function') {
        chain.unsetTextAlign();
    }

    // 4) Optional: convert blocks back to paragraphs & clear block-level nodes
    if (options.resetBlocks) {
        // clearNodes removes blockquote/codeBlock/heading/list, etc.
        chain.clearNodes();
        chain.setParagraph();
    }

    chain.run();
}


