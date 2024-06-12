// - Constants

export const
  // Font size CSS variables
  FONT_SIZE_H2 = '--compjs-font-size-h2',
  FONT_SIZE_H3 = '--compjs-font-size-h3',
  FONT_SIZE_TEXT = '--compjs-font-size-text',

  // Icon size CSS variables
  ICON_SIZE = '--compjs-icon-size',

  // Checkbox size CSS variables
  CHECKBOX_SIZE = '--compjs-checkbox-size',

  // Margin CSS variables
  TITLE_MARGIN_BOTTOM = '--compjs-title-margin-bottom',
  H2_MARGIN_BOTTOM = '--compjs-h2-margin-bottom',
  H3_MARGIN_BOTTOM = '--compjs-h3-margin-bottom',

  // Gap CSS variables
  COLUMN_GAP = '--compjs-column-gap',

  // Padding CSS variables
  PAGINATION_PADDING = '--compjs-pagination-padding',

  // Border radius CSS variables
  TITLE_BORDER_RADIUS = '--compjs-title-border-radius',

  // Colors CSS variables
  GREY_DARK = '--compjs-grey-dark',
  GREY_MEDIUM = '--compjs-grey-medium',
  GREY_LIGHT = '--compjs-grey-light',

  PRIMARY_DARK = '--compjs-primary-dark',
  PRIMARY_MEDIUM = '--compjs-primary-medium',
  PRIMARY_LIGHT = '--compjs-primary-light';

export class CompJS
{
  // - Static variables

  static #ROOT = ":root";
  static #STYLE_PATH = 'src/css/style.css';

  static #head;
  static #style;
  static #STYLES_MAP; // Contains components, properties and its values

  // Fonts size CSS variables name
  static #FONTS_SIZE = [FONT_SIZE_H2, FONT_SIZE_H3, FONT_SIZE_TEXT];

  // Icons size CSS variables name
  static #ICONS_SIZE = [ICON_SIZE];

  // Checkboxes size CSS variables name
  static #CHECKBOXES_SIZE = [CHECKBOX_SIZE];

  // Checkboxes size CSS variables name
  static #MARGINS = [TITLE_MARGIN_BOTTOM, H2_MARGIN_BOTTOM, H3_MARGIN_BOTTOM];

  // Gaps CSS variables name
  static #GAPS = [COLUMN_GAP];

  // Paddings CSS variables name
  static #PADDINGS = [PAGINATION_PADDING];

  // Colors CSS variables name
  static #COLORS = [GREY_DARK, GREY_MEDIUM, GREY_LIGHT, PRIMARY_DARK, PRIMARY_MEDIUM, PRIMARY_LIGHT];

  static
  {
    // Store head element
    CompJS.#head = document.querySelector('head');

    // Add default CSS style
    CompJS.addStyleSheet(CompJS.#STYLE_PATH);

    // Custom CSS style
    CompJS.#checkStyleElement();
    CompJS.#STYLES_MAP = new Map();
  }

  // - Util

  // Method to check if the style element exists and is inside the head element
  static #checkStyleElement ()
  {
    if (CompJS.#style == undefined)
      CompJS.#style = document.createElement('style');

    if (CompJS.#head.contains(CompJS.#style) === false)
      CompJS.#head.appendChild(CompJS.#style);
  }

  static _ifIsValidApply (validNames, name, func)
  {
    // Check if the given name is valid
    for (let validName of validNames)
      if (validName === name)
        return func();

    throw new Error(`ERROR: '${ propertyName }' is an invalid name.`);
  }

  // - Setters and getters

  // General methods for getting CSS classes properties values
  static _getClassStyle (className)
  {
    if (typeof (className) !== 'string')
      throw new Error(`Parameter '${ className }' of CompJS's '_getClassStyle' method must be of type of 'string'.`);

    return document.querySelector(className);
  }

  static _getCompStyle (className, propertyName)
  {
    const params = [className, propertyName];

    for (let param of params)
      if (typeof (param) !== 'string')
        throw new Error(`Parameter '${ param }' of CompJS's '_getClassProperty' method must be of type of 'string'.`);

    const classStyle = CompJS._getClassStyle(className);

    if (classStyle === undefined)
      return null;

    return window.getComputedStyle(classStyle);
  }

  static _getClassProperty (className, propertyName)
  {

    const propertyValue = CompJS._getCompStyle(className, propertyName);
    return (propertyValue === undefined) ? null : propertyValue;
  }

  static _getClassProperties (className, ...propertiesName)
  {
    const propertiesMap = new Map();

    for (let propertyName of propertiesName)
      propertiesMap.set(propertyName, CompJS._getClassProperty(className, property));

    return propertiesMap;
  }

  static #getClassProperties (...propertiesName)
  {
    return CompJS._getClassProperties(CompJS.#ROOT, propertiesName);
  }

  // Fonts size
  getFontsSize ()
  {
    return CompJS.#getClassProperties(CompJS.#FONTS_SIZE);
  }

  // Icons size
  getIconsSize ()
  {
    return CompJS.#getClassProperties(CompJS.#ICONS_SIZE);
  }

  // Checkboxes size
  getCheckboxesSize ()
  {
    return CompJS.#getClassProperties(CompJS.#CHECKBOXES_SIZE);
  }

  // Checkboxes size
  getMargins ()
  {
    return CompJS.#getClassProperties(CompJS.#MARGINS);
  }

  // Gaps
  getGaps ()
  {
    return CompJS.#getClassProperties(CompJS.#GAPS);
  }

  // Paddings
  getPaddings ()
  {
    return CompJS.#getClassProperties(CompJS.#PADDINGS);
  }

  // Colors
  getColors ()
  {
    return CompJS.#getClassProperties(CompJS.#COLORS);
  }

  // General methods for setting CSS classes properties values
  static #setClassProperty (stylesMap, className, propertyName, propertyValue)
  {
    // Check parameters type
    const params = [className, propertyName, propertyValue];

    for (let param of params)
      if (typeof (param) !== 'string')
        throw new Error(`Parameter '${ param }' of CompJS's 'addStyleClass' method must be of type of 'string'`);

    if (typeof (stylesMap) !== 'object')
      throw new Error(`Parameter '${ stylesMap }' of CompJS's 'addStyleClass' method must be of type of 'object' (Map)`);

    // Add class property style
    if (stylesMap.has(className) === false)
    {
      stylesMap.set(className, new Map([propertyName, propertyValue]));
      return;
    }

    stylesMap[className].set(propertyName, propertyValue);
  }

  static _setClassProperty (className, propertyName, propertyValue)
  {
    CompJS.#setClassProperty(CompJS.#STYLES_MAP, className, propertyName, propertyValue);
  }

  static _setClassProperty (propertyName, propertyValue)
  {
    CompJS.#setClassProperty(CompJS.#ROOT, propertyName, propertyValue);
  }

  static _setValidProperty (validPropertyNames, propertyName, propertyValue)
  {
    CompJS._ifIsValidApply(validPropertyNames, propertyName,
      () =>
      {
        CompJS._setClassProperty(propertyName, propertyValue);
      }
    );
  }

  static _setValidClassProperty (validClassNames, className, propertyName, propertyValue)
  {
    CompJS._ifPropertyIsValidApply(validClassNames, className,
      () =>
      {
        CompJS._setClassProperty(className, propertyName, propertyValue);
      }
    );
  }

  setFontSize (propertyName, propertyValue)
  {
    CompJS._setValidProperty(CompJS.#FONTS_SIZE, propertyName, propertyValue);
  }

  setIconSize (propertyName, propertyValue)
  {
    CompJS._setValidProperty(CompJS.#ICONS_SIZE, propertyName, propertyValue);
  }

  setCheckboxSize (propertyName, propertyValue)
  {
    CompJS._setValidProperty(CompJS.#CHECKBOXES_SIZE, propertyName, propertyValue);
  }

  setMargin (propertyName, propertyValue)
  {
    CompJS._setValidProperty(CompJS.#MARGINS, propertyName, propertyValue);
  }

  setGap (propertyName, propertyValue)
  {
    CompJS._setValidProperty(CompJS.#GAPS, propertyName, propertyValue);
  }

  setPadding (propertyName, propertyValue)
  {
    CompJS._setValidProperty(CompJS.#PADDINGS, propertyName, propertyValue);
  }

  setColor (propertyName, propertyValue)
  {
    CompJS._setValidProperty(CompJS.#COLORS, propertyName, propertyValue);
  }

  static #addLink (rel, type, href)
  {
    // Create new link element for the stylesheet
    let link = document.createElement('link');

    // Set the attributes for link element
    link.rel = rel;
    link.type = type;
    link.href = href;

    // Append link element to HTML head
    CompJS.#head.appendChild(link);
  }

  static addStyleSheet (path)
  {
    try
    {
      if (!path.endsWith('.css'))
        throw new Error("ERROR: Invalid path to stylesheet, it must end with '.css'.");

      CompJS.#addLink('stylesheet', 'text/css', path);

    } catch (e)
    {
      console.error(e);
    }
  }

  // Reset all applied customed styles
  static resetAllAppliedStyles ()
  {
    CompJS.#STYLES_MAP = new Map();
    CompJS.#style.textContent = "";
  }

  // Reset applied customed styles for a given class name
  static #resetClassAppliedStyles (stylesMap, className)
  {
    // Check parameters type
    if (typeof (className) !== string)
      throw new Error(`Parameter '${ className }' of CompJS's 'resetAllAppliedStyles' method must be of type of 'string'`);

    if (typeof (stylesMap) !== 'object')
      throw new Error(`Parameter '${ stylesMap }' of CompJS's 'addStyleClass' method must be of type of 'object' (Map)`);

    // Reset styles for the given class name
    delete stylesMap[className];

    // Reset style element content
    stylesMap.resetAllAppliedStyles();

    // Apply new styles
    stylesMap.applyStyles();
  }

  static _resetClassAppliedStyles (className)
  {
    CompJS.#resetClassAppliedStyles(CompJS.#STYLES_MAP, className);
  }

  // Apply customed styles to 'style' element
  static applyStyles ()
  {
    // Check styles map
    CompJS.#checkStyleElement();

    // Apply customed styles
    // TO DEVELOP...
  }
};
