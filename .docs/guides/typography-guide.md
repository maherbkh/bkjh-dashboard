# Typography System Guide

This guide explains how to use the custom typography system that matches backhaus.de's design specifications.

## Overview

The typography system is based on backhaus.de's font sizing and spacing, using the existing Museo font family with custom CSS classes for consistent typography across the application.

## Font Family

- **Primary**: Museo (300, 500, 700 weights)
- **Fallback**: MuseoSans (300 weight)

## Typography Classes

### Headings

```html
<h1 class="text-h1">Main Page Title</h1>        <!-- 28px, bold -->
<h2 class="text-h2">Section Title</h2>          <!-- 24px, semibold -->
<h3 class="text-h3">Subsection Title</h3>       <!-- 20px, semibold -->
<h4 class="text-h4">Card Title</h4>             <!-- 18px, medium -->
<h5 class="text-h5">Small Heading</h5>          <!-- 16px, medium -->
<h6 class="text-h6">Tiny Heading</h6>           <!-- 14px, medium -->
```

### Body Text

```html
<p class="text-body">Regular paragraph text</p>      <!-- 16px, normal -->
<p class="text-body-sm">Small body text</p>          <!-- 14px, normal -->
<p class="text-body-lg">Large body text</p>          <!-- 18px, normal -->
```

### Display Text

```html
<div class="text-display">Large Display Text</div>     <!-- 36px, bold -->
<div class="text-display-sm">Medium Display</div>      <!-- 30px, bold -->
```

### Caption and Small Text

```html
<span class="text-caption">Caption text</span>         <!-- 12px, normal -->
```

### Buttons

```html
<button class="text-button">Button Text</button>       <!-- 14px, medium -->
<button class="text-button-sm">Small Button</button>   <!-- 12px, medium -->
<button class="text-button-lg">Large Button</button>   <!-- 16px, medium -->
```

### Labels

```html
<label class="text-label">Form Label</label>           <!-- 14px, medium -->
<label class="text-label-sm">Small Label</label>       <!-- 12px, medium -->
```

### Links

```html
<a class="text-link">Link Text</a>                     <!-- 16px, medium, underlined -->
<a class="text-link-sm">Small Link</a>                 <!-- 14px, medium, underlined -->
```

## Component-Specific Classes

### Cards

```html
<h3 class="card-title">Card Title</h3>                 <!-- 18px, semibold -->
<p class="card-subtitle">Card subtitle</p>             <!-- 14px, normal -->
```

### Sidebar

```html
<div class="sidebar-title">Sidebar Title</div>         <!-- 16px, semibold -->
<div class="sidebar-text">Sidebar text</div>           <!-- 14px, normal -->
```

### Tables

```html
<th class="table-header">Header Cell</th>              <!-- 14px, semibold -->
<td class="table-cell">Data Cell</td>                  <!-- 14px, normal -->
```

### Forms

```html
<label class="form-label">Form Label</label>           <!-- 14px, medium -->
<p class="form-hint">Hint text</p>                     <!-- 12px, normal -->
<p class="form-error">Error message</p>                <!-- 12px, medium -->
```

## Font Weights

```html
<span class="font-light">Light text</span>             <!-- 300 -->
<span class="font-normal">Normal text</span>           <!-- 400 -->
<span class="font-medium">Medium text</span>           <!-- 500 -->
<span class="font-semibold">Semibold text</span>       <!-- 600 -->
<span class="font-bold">Bold text</span>               <!-- 700 -->
<span class="font-extrabold">Extra bold text</span>    <!-- 800 -->
```

## Line Heights

```html
<div class="leading-tight">Tight line height</div>     <!-- 1.25 -->
<div class="leading-normal">Normal line height</div>   <!-- 1.5 -->
<div class="leading-relaxed">Relaxed line height</div> <!-- 1.625 -->
```

## Using the Typography Composable

For programmatic access to typography classes:

```typescript
import { useTypography } from '~/composables/useTypography'

const { getTypographyClass, getPreset, combineTypography } = useTypography()

// Get specific typography class
const headingClass = getTypographyClass('h1') // 'text-h1'

// Get preset combination
const pageTitleClass = getPreset('pageTitle') // 'text-h1 font-bold'

// Combine typography with custom weight/line-height
const customClass = combineTypography('body', 'semibold', 'tight')
```

## Responsive Typography

The typography system includes responsive adjustments for mobile devices:

- H1: 32px → 28px on mobile
- H2: 26px → 24px on mobile  
- H3: 22px → 20px on mobile
- Display: 36px → 40px on mobile
- Display Small: 30px → 32px on mobile

## Migration from Tailwind Classes

Replace existing Tailwind typography classes:

| Old Tailwind | New Typography Class |
|--------------|---------------------|
| `text-3xl font-bold` | `text-h1` |
| `text-2xl font-semibold` | `text-h2` |
| `text-xl font-semibold` | `text-h3` |
| `text-lg font-medium` | `text-h4` |
| `text-base font-medium` | `text-h5` |
| `text-sm font-medium` | `text-h6` |
| `text-base` | `text-body` |
| `text-sm` | `text-body-sm` |
| `text-lg` | `text-body-lg` |
| `text-xs` | `text-caption` |

## Best Practices

1. **Use semantic classes**: Prefer `text-h1` over `text-3xl font-bold`
2. **Be consistent**: Use the same typography class for similar elements
3. **Follow hierarchy**: Use appropriate heading levels (h1, h2, h3, etc.)
4. **Consider context**: Use component-specific classes when available
5. **Test responsiveness**: Verify typography looks good on all screen sizes

## Examples

### Page Header
```html
<div class="flex flex-col gap-2">
    <h1 class="text-h1">Page Title</h1>
    <p class="text-body text-muted-foreground">Page description</p>
</div>
```

### Card Component
```html
<Card>
    <CardHeader>
        <h3 class="card-title">Card Title</h3>
        <p class="card-subtitle">Card subtitle</p>
    </CardHeader>
    <CardContent>
        <p class="text-body">Card content goes here.</p>
    </CardContent>
</Card>
```

### Form Field
```html
<div class="space-y-2">
    <label class="form-label">Field Label</label>
    <input type="text" class="form-input" />
    <p class="form-hint">Helpful hint text</p>
</div>
```
