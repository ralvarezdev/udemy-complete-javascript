import {COMPJS} from "./compjs-props.js";

class CompJS {
    // Document elements
    #head;
    #body
    #style;

    // Styles
    #stylesMap;

    // Loaded SVG files
    #LOADED_SVGS
    #hiddenSVGContainer

    // Elements
    #ELEMENTS_ID;

    constructor() {
        // Store head element
        this.#head = document.querySelector('head');
        this.#body = document.querySelector('body');

        // Insert default CSS style to HTML
        this.addStyleSheet(COMPJS.PATHS.MAIN_STYLE);

        // Custom CSS style
        this.#initStyleElement();
        this.#stylesMap = new Map();
        this.#ELEMENTS_ID = new Map();
        this.#LOADED_SVGS = new Map()
    }

    // - Utilities

    // Sleep n milliseconds
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Convert pixels to rem
    convertPixelsToRem(pixels) {
        return pixels / parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    // Check if a variable is a string
    isString(variable) {
        return variable instanceof String || typeof (variable) === 'string';
    }

    // Check selectors
    checkSelector(selector) {
        if (!this.isString(selector))
            throw new Error('Selector must be a string...');
    }

    checkSelectors(...selectors) {
        if (selectors === undefined || selectors === null)
            throw new Error('Selectors are undefined or null...');

        if (selectors.length === 0)
            throw new Error('Selectors list is empty...');

        selectors.forEach(selector => this.checkSelector(selector))
    }

    // Get formatted class name
    getFormattedClassName(selector) {
        this.checkSelector(selector)
        return selector.startsWith(".") ? selector : ("." + selector);
    }

    // Get formatted class names
    getFormattedClassNames(selectors) {
        this.checkSelectors(...selectors)

        selectors.forEach((selector, i) => {
            selectors[i] = this.getFormattedClassName(selector);
        })
        return selectors
    }

    // Get formatted ID
    getFormattedId(selector) {
        this.checkSelector(selector)
        return selector.startsWith("#") ? selector : ("#" + selector);
    }

    // Get formatted IDs
    getFormattedIds(selectors) {
        this.checkSelectors(...selectors)

        selectors.forEach((selector, i) => {
            selectors[i] = this.getFormattedId(selector);
        })
        return selectors
    }

    // Check property name
    checkPropertyName(propertyName) {
        if (!this.isString(propertyName))
            throw new Error('Property name must be a string...');
    }

    // Check property value
    checkPropertyValue(propertyValue) {
        if (!this.isString(propertyValue))
            throw new Error('Property value must be a string...');
    }

    // - Initializers

    // Initialize the style element and append to the head element
    #initStyleElement() {
        // Create style element
        this.#style = document.createElement('style');
        this.#style.id = COMPJS.SELECTORS.STYLE;

        // Append style element to head element
        this.#head.appendChild(this.#style);
    }

    // - Getters

    // Get element from selector
    getElement(selector) {
        this.checkSelector(selector)
        return document.querySelector(selector);
    }

    // Get element computed style
    getCompStyle(element) {
        return element ? window.getComputedStyle(element) : null;
    }

    // Get selector computed style
    getSelectorCompStyle(selector) {
        const element = this.getElement(selector);
        return getComputedStyle(element);
    }

    // Get computed style property
    #getProperty(compStyle, propertyName) {
        this.checkPropertyName(propertyName);

        const propertyValue = compStyle.getPropertyValue(propertyName);
        return propertyValue ? propertyValue : null;
    }

    // Get computed style property from selector
    getSelectorProperty(selector, propertyName) {
        const compStyle = this.getSelectorCompStyle(selector);
        return this.#getProperty(compStyle, propertyName);
    }

    // Get selector properties
    getSelectorProperties(selector, ...propertiesName) {
        this.checkSelector(selector);

        const selectorPropertiesMap = new Map();
        const element = this.getElement(selector);
        const compStyle = this.getCompStyle(element);

        for (let propertyName of propertiesName) {
            let propertyValue = this.#getProperty(compStyle, propertyName);
            selectorPropertiesMap.set(propertyName, propertyValue);
        }

        return selectorPropertiesMap;
    }

    // Get CompJS element by ID
    getCompJSElementById(elementId) {
        const element = this.#ELEMENTS_ID.get(elementId);

        if (element === undefined)
            throw new Error("Element ID does not exist...");

        return element;
    }

    // Get element total height
    getElementTotalHeight(element) {
        const elementStyle = this.getCompStyle(element)
        return parseInt(elementStyle.marginTop) + parseInt(elementStyle.marginBottom) + element.offsetHeight
    }

    // - Setters

    // Set class property values
    setSelectorProperty(selector, propertyName, propertyValue) {
        // Check parameters
        this.checkSelector(selector)
        this.checkPropertyName(propertyName);
        this.checkPropertyValue(propertyValue);

        // Add class property style
        const propertiesMap = this.#stylesMap.get(selector);

        if (propertiesMap === undefined) {
            this.#stylesMap.set(selector, new Map([[propertyName, propertyValue]]));
            return;
        }

        propertiesMap.set(propertyName, propertyValue);
    }

    // Set CompJS selector property values
    setCompJSSelectorProperty(propertyName, propertyValue) {
        this.setSelectorProperty(COMPJS.SELECTORS.ROOT, propertyName, propertyValue);
    }

    // Set CompJS element ID
    setCompJSElementId(element, id) {
        this.checkSelector(id);

        if (this.getCompJSElementById(id))
            throw new Error("Element ID has already being assigned...");

        this.#ELEMENTS_ID.set(id, element);
    }

    // Set element ID
    setElementId(element, id) {
        if (id)
            element.id = id
    }

    // Set class property values
    addClassNames(element, ...classNames) {
        if (!classNames || !classNames instanceof Array)
            return

        this.checkSelectors(...classNames);
        element.classList.add(...classNames);
    }

    // - Links

    // Create new link element
    addLink(rel, type, href, id) {
        let link = document.createElement('link');

        // Set the attributes for link element
        link.rel = rel;
        link.type = type;
        link.href = href;

        this.setElementId(link, id);

        // Append link element to HTML head
        this.#head.appendChild(link);
    }

    // Add stylesheet
    addStyleSheet(path) {
        if (!path.endsWith('.css'))
            throw new Error("Invalid path to stylesheet, it must end with '.css'...");

        this.addLink('stylesheet', 'text/css', path);
    }

    // - Resets

    // Reset map with customized styles
    resetStylesMap() {
        this.#stylesMap = new Map();
    }

    // Reset all applied customized styles
    resetAppliedStyles() {
        this.#style.textContent = "";
    }

    // Reset applied customized styles for a given class name
    resetAppliedStyle(selector) {
        this.checkSelector(selector);

        // Reset styles for the given class name
        if (this.#stylesMap.has(selector)) {
            this.#stylesMap.delete(selector);

            // Reset style element content
            this.#stylesMap.resetAppliedStyles();

            // Apply new styles
            this.#stylesMap.applyStyles();
        }
    }

    // Apply customized styles to 'style' element
    applyStyles() {
        let newContent = "";

        for (let [selector, property] of this.#stylesMap.entries()) {
            let newPropertyContent = `${selector} {\n`;

            for (let [propertyName, propertyValue] of property.entries())
                newPropertyContent += `${propertyName}: ${propertyValue};\n`;

            newPropertyContent += "}\n\n";
            newContent += newPropertyContent;
        }

        // Append element as head last child
        this.#head.appendChild(this.#style);

        // Apply customized styles
        this.#style.textContent = newContent;
    }

    // - Element initializers

    // Create element with ID
    createElementWithId(tagName, parentElement, id, ...classNames) {
        const element = document.createElement(tagName);

        this.setElementId(element, id)
        this.addClassNames(element, ...classNames)

        parentElement.appendChild(element);
        return element;
    }

    // Create element
    createElement(tagName, parentElement, ...classNames) {
        return this.createElementWithId(tagName, parentElement, null, ...classNames);
    }

    // Create div element with ID
    createDivWithId(parentElement, id, ...classNames) {
        return this.createElementWithId('div', parentElement, id, ...classNames);
    }

    // Create div element
    createDiv(parentElement, ...classNames) {
        return this.createDivWithId(parentElement, null, ...classNames);
    }

    // Create button element with ID
    createButtonWithId(parentElement, id, ...classNames) {
        return this.createElementWithId('button', parentElement, id, ...classNames, COMPJS.SELECTORS.ELEMENTS.BUTTON);
    }

    // Create button element
    createButton(parentElement, ...classNames) {
        return this.createButtonWithId(parentElement, null, ...classNames);
    }

    // Create input element with ID
    createInputWithId(parentElement, type, name, value, id, ...classNames) {
        const inputElement = this.createElementWithId('input', parentElement, id, ...classNames, COMPJS.SELECTORS.ELEMENTS.INPUT);

        if (name)
            inputElement.name = name

        if (type)
            inputElement.type = type

        if (value)
            inputElement.value = value

        return inputElement;
    }

    // Create input element
    createInput(parentElement, type, name, value, ...classNames) {
        return this.createInputWithId(parentElement, type, name, value, null, ...classNames);
    }

    // Create input radio element with ID
    createInputRadioWithId(parentElement, name, value, checked, id, ...classNames) {
        const inputElement = this.createInputWithId(parentElement, 'radio', name, value, id, ...classNames, COMPJS.SELECTORS.ELEMENTS.RADIO);
        inputElement.checked = checked

        return inputElement
    }

    // Create input radio element
    createInputRadio(parentElement, name, value, checked, ...classNames) {
        return this.createInputRadioWithId(parentElement, name, value, checked, null, ...classNames);
    }

    // Create input checkbox element with ID
    createInputCheckboxWithId(parentElement, name, value, checked, id, ...classNames) {
        const inputElement = this.createInputWithId(parentElement, 'checkbox', name, value, id, ...classNames, COMPJS.SELECTORS.ELEMENTS.CHECKBOX);
        inputElement.checked = checked

        return inputElement
    }

    // Create input checkbox element
    createInputCheckbox(parentElement, name, value, checked, ...classNames) {
        return this.createInputCheckboxWithId(parentElement, name, value, checked, null, ...classNames);
    }

    // - Loaders

    /*
    loadUniqueImg(parentElement, url, alt, id, ...classNames) {
        const imgElement = document.createElement("img");
        imgElement.src = url;

        if (alt)
            imgElement.alt = alt;

        this.setElementId(imgElement, id)
        this.addClassNames(imgElement,...classNames)

        parentElement.appendChild(imgElement);

        return imgElement;
    }

    loadImg(parentElement, url, alt, ...classNames) {
        return this.loadImgWithId(parentElement, url, alt, null, ...classNames);
    }

    loadUniqueSVGImg(parentElement, url, alt, id, ...classNames) {
        // Create SVG img element
        return this.loadImgWithId(parentElement, url, alt, id, ...classNames);
    }

    loadSVGImg(parentElement, url, alt, ...classNames) {
        return this.loadImg(parentElement, url, alt, ...classNames);
    }

    loadUniqueObject(parentElement, data, type, id, ...classNames) {
        const objectElement = document.createElement('object');

        if (data)
            objectElement.data = data;

        if (type)
            objectElement.type = type;

        this.setElementId(objectElement, id)
        this.addClassNames(objectElement,...classNames)

        parentElement.appendChild(objectElement);
        return objectElement;
    }

    // Load object
    loadObject(parentElement, data, type, ...classNames) {
        return this.loadObjectWithId(parentElement, data, type, null, ...classNames);
    }
    */

    // Load hidden SVG to be used as reference
    async loadHiddenSVG(url, viewBox, id) {
        if (!this.#hiddenSVGContainer)
            this.#hiddenSVGContainer = this.createDiv(this.#body, COMPJS.SELECTORS.ELEMENTS.HIDDEN_SVG_CONTAINER, COMPJS.SELECTORS.UTILITIES.HIDE)

        // SVG already loaded
        if (this.#LOADED_SVGS.get(id))
            return

        // Set SVG as being loaded
        this.#LOADED_SVGS.set(id, true)

        const svgElement = document.createElementNS(COMPJS.URIS.NAMESPACES.SVG, 'svg');
        const symbolElement = document.createElementNS(COMPJS.URIS.NAMESPACES.SVG, 'symbol');

        this.setElementId(symbolElement, id)

        svgElement.appendChild(symbolElement);
        this.#hiddenSVGContainer.appendChild(svgElement);

        fetch(url)
            .then(response => response.text())
            .then(svgData => {
                const parser = new DOMParser();
                const parsedSvg = parser.parseFromString(svgData, "image/svg+xml");

                svgElement.version = "2.0";
                svgElement.classList.add(COMPJS.SELECTORS.ELEMENTS.HIDDEN_SVG)
                symbolElement.setAttribute('viewBox', viewBox);

                symbolElement.innerHTML = parsedSvg.documentElement.innerHTML;
            });
    }

    // Load SVG using a hidden SVG element
    loadSVG(parentElement, id, ...classNames) {
        id = this.getFormattedId(id)
        const getHiddenSVG = document.querySelector(id);

        if (!getHiddenSVG)
            throw new Error("Hidden SVG element not found...");

        const svgElement = document.createElementNS(COMPJS.URIS.NAMESPACES.SVG, 'svg');
        const useElement = document.createElementNS(COMPJS.URIS.NAMESPACES.SVG, 'use');
        useElement.setAttribute('href', id);

        this.addClassNames(svgElement, ...classNames)
        svgElement.appendChild(useElement);
        parentElement.appendChild(svgElement);

        return svgElement;
    }
}

export const compJS = Object.freeze(new CompJS());