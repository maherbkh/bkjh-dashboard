/**
 * Typography utility composable
 * Provides consistent typography classes based on backhaus.de design system
 */

export const useTypography = () => {
  /**
   * Typography scale based on backhaus.de
   */
  const typography = {
    // Headings
    h1: 'text-h1',
    h2: 'text-h2', 
    h3: 'text-h3',
    h4: 'text-h4',
    h5: 'text-h5',
    h6: 'text-h6',
    
    // Body text
    body: 'text-body',
    bodySm: 'text-body-sm',
    bodyLg: 'text-body-lg',
    
    // Display text
    display: 'text-display',
    displaySm: 'text-display-sm',
    
    // Caption and small text
    caption: 'text-caption',
    
    // Button typography
    button: 'text-button',
    buttonSm: 'text-button-sm',
    buttonLg: 'text-button-lg',
    
    // Labels
    label: 'text-label',
    labelSm: 'text-label-sm',
    
    // Links
    link: 'text-link',
    linkSm: 'text-link-sm',
    
    // Component specific
    cardTitle: 'card-title',
    cardSubtitle: 'card-subtitle',
    sidebarTitle: 'sidebar-title',
    sidebarText: 'sidebar-text',
    tableHeader: 'table-header',
    tableCell: 'table-cell',
    formLabel: 'form-label',
    formHint: 'form-hint',
    formError: 'form-error',
  } as const;

  /**
   * Font weight utilities
   */
  const fontWeights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  } as const;

  /**
   * Line height utilities
   */
  const lineHeights = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  } as const;

  /**
   * Get typography class for a specific element type
   */
  const getTypographyClass = (type: keyof typeof typography): string => {
    return typography[type];
  };

  /**
   * Get font weight class
   */
  const getFontWeightClass = (weight: keyof typeof fontWeights): string => {
    return fontWeights[weight];
  };

  /**
   * Get line height class
   */
  const getLineHeightClass = (height: keyof typeof lineHeights): string => {
    return lineHeights[height];
  };

  /**
   * Combine typography classes
   */
  const combineTypography = (
    type: keyof typeof typography,
    weight?: keyof typeof fontWeights,
    lineHeight?: keyof typeof lineHeights
  ): string => {
    const classes = [typography[type]];
    
    if (weight) {
      classes.push(fontWeights[weight]);
    }
    
    if (lineHeight) {
      classes.push(lineHeights[lineHeight]);
    }
    
    return classes.join(' ');
  };

  /**
   * Typography presets for common use cases
   */
  const presets = {
    pageTitle: combineTypography('h1', 'bold'),
    sectionTitle: combineTypography('h2', 'semibold'),
    cardTitle: combineTypography('h3', 'semibold'),
    button: combineTypography('button', 'medium'),
    label: combineTypography('label', 'medium'),
    body: combineTypography('body', 'normal'),
    caption: combineTypography('caption', 'normal'),
    tableHeader: combineTypography('tableHeader', 'semibold'),
    tableCell: combineTypography('tableCell', 'normal'),
    formLabel: combineTypography('formLabel', 'medium'),
    formHint: combineTypography('formHint', 'normal'),
    formError: combineTypography('formError', 'medium'),
  } as const;

  /**
   * Get preset typography class
   */
  const getPreset = (preset: keyof typeof presets): string => {
    return presets[preset];
  };

  return {
    typography,
    fontWeights,
    lineHeights,
    getTypographyClass,
    getFontWeightClass,
    getLineHeightClass,
    combineTypography,
    presets,
    getPreset,
  };
};

/**
 * Typography types for TypeScript
 */
export type TypographyType = keyof ReturnType<typeof useTypography>['typography'];
export type FontWeightType = keyof ReturnType<typeof useTypography>['fontWeights'];
export type LineHeightType = keyof ReturnType<typeof useTypography>['lineHeights'];
export type PresetType = keyof ReturnType<typeof useTypography>['presets'];
