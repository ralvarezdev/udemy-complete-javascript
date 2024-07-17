import {COMPJS_SELECTORS, COMPJS_VARIABLES_LIST, COMPJS_PATHS, COMPJS_URIS} from "./compjs-props.js";

export class CompJS {
    // Unique instance
    static #INSTANCE;

    // Document elements
    #head;
    #style;

    // Styles
    #STYLES_MAP;

    // Loaded SVG files
    #LOADED_SVGS

    // Elements
    #ELEMENTS_ID;

    constructor() {
        return CompJS.getInstance(this);
    }

    static getInstance(obj) {
        if (CompJS.#INSTANCE === undefined) {
            if (!obj instanceof CompJS)
                throw new Error("Object must be an instance of CompJS.");

            // Store head element
            obj.#head = document.querySelector('head');

            // Insert default CSS style to HTML
            obj.addStyleSheet(COMPJS_PATHS.ROOT_STYLE);
            obj.addStyleSheet(COMPJS_PATHS.COMPJS_STYLE)

            // Custom CSS style
            obj.#checkStyleElement();
            obj.#STYLES_MAP = new Map();
            obj.#ELEMENTS_ID = new Map();
            obj.#LOADED_SVGS=new Map()

            CompJS.#INSTANCE = obj;
        }
        return CompJS.#INSTANCE;
    }

    // - Utilities

    // Convert pixels to rem
    convertPixelsToRem(pixels) {
        return pixels / parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    // Check if the style element exists and is inside the head element
    #checkStyleElement() {
        if (this.#style === undefined) {
            this.#style = document.createElement('style');
            this.#style.id = COMPJS_SELECTORS.STYLE;
        }

        if (this.#head.contains(this.#style) === false)
            this.#head.appendChild(this.#style);
    }

    // Check if a variable is a string
    isString(variable) {
        return variable instanceof String || typeof (variable) === 'string';
    }

    // Check selectors
    checkSelector(selector) {
        if (!this.isString(selector))
            throw new Error('Class name must be a string...');
    }

    checkSelectors(...selectors) {
        if (selectors === undefined)
            throw new Error('Selectors are undefined...');

        if (selectors.length === 0)
            throw new Error('Selectors list is empty...');

        selectors.forEach(selector => this.checkSelector(selector))
    }

    // Get formatted class names
    getFormattedClassName(selector) {
        this.checkSelector(selector)
        return selector.startsWith(".") ? selector : ("." + selector);
    }

    getFormattedClassNames(selectors) {
        this.checkSelectors(...selectors)

        selectors.forEach((selector, i) => {
            selectors[i] = this.getFormattedClassName(selector);
        })
        return selectors
    }

    // Get formatted IDs
    getFormattedId(selector) {
        this.checkSelector(selector)
        return selector.startsWith("#") ? selector : ("#" + selector);
    }

    getFormattedIds(selectors) {
        this.checkSelectors(...selectors)

        selectors.forEach((selector, i) => {
            selectors[i] = this.getFormattedClassName(selector);
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

    // - Getters

    // Get element from selector
    getElement(selector) {
        this.checkSelector(selector)
        return document.querySelector(selector);
    }

    // Get element computed style
    getCompStyle(element){
        return (element === null) ? null : window.getComputedStyle(element);
    }

    // Get selector computed style
    getSelectorCompStyle(selector) {
        const element = this.getElement(selector);
        return  getComputedStyle(element);
    }

    // Get computed style property
    #getProperty(compStyle, propertyName) {
        this.checkPropertyName(propertyName);

        const propertyValue = compStyle.getPropertyValue(propertyName);
        return (propertyValue === undefined) ? null : propertyValue;
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
        const compStyle= this.getCompStyle(element);

        for (let propertyName of propertiesName) {
            let propertyValue = this.#getProperty(compStyle, propertyName);

            if (selectorPropertiesMap.has(selector) === false) {
                selectorPropertiesMap.set(selector, new Map([[propertyName, propertyValue]]));
                continue;
            }

            selectorPropertiesMap.get(selector).set(propertyName, propertyValue);
        }

        return selectorPropertiesMap;
    }

    // Get CompJS properties
    getCompJSProperties() {
        return this.getSelectorProperties(COMPJS_SELECTORS.ROOT, ...COMPJS_VARIABLES_LIST);
    }

    getCompJSElementId(elementId) {
        const element= this.#ELEMENTS_ID.get(elementId);

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
        if (this.#STYLES_MAP.has(selector) === false) {
            this.#STYLES_MAP.set(selector, new Map([[propertyName, propertyValue]]));
            return;
        }

        this.#STYLES_MAP.get(selector).set(propertyName, propertyValue);
    }

    // Set CompJS selector property values
    setCompJSSelectorProperty(propertyName, propertyValue) {
        this.setSelectorProperty(COMPJS_SELECTORS.ROOT, propertyName, propertyValue);
    }

    // Set CompJS element ID
    setCompJSElementId(element, id) {
        this.checkSelector(id);

        if (this.getCompJSElementId(id))
            throw new Error("Element ID has already being assigned...");

        this.#ELEMENTS_ID.set(id, element);
    }

    setElementId(element, id) {
        if(id)
            element.id=id
    }

    addClassNames(element,...classNames){
        if(!classNames)
            return

        if(!classNames instanceof Array)
            return

        this.checkSelectors(...classNames);
        element.classList.add(...classNames);
    }

    // - Links
    addLink(rel, type, href, id) {
        // Create new link element for the stylesheet
        let link = document.createElement('link');

        // Set the attributes for link element
        link.rel = rel;
        link.type = type;
        link.href = href;

        this.setElementId(link, id);

        // Append link element to HTML head
        this.#head.appendChild(link);
    }

    addStyleSheet(path) {
        if (!path.endsWith('.css'))
            throw new Error("Invalid path to stylesheet, it must end with '.css'...");

        this.addLink('stylesheet', 'text/css', path);
    }

    // - Resets

    // Reset map with customized styles
    resetStylesMap() {
        this.#STYLES_MAP = new Map();
    }

    // Reset all applied customized styles
    resetAppliedStyles() {
        this.#style.textContent = "";
    }

    // Reset applied customized styles for a given class name
    resetAppliedStyle(selector) {
        this.checkSelector(selector);

        // Reset styles for the given class name
        if (this.#STYLES_MAP.has(selector)) {
            this.#STYLES_MAP.delete(selector);

            // Reset style element content
            this.#STYLES_MAP.resetAppliedStyles();

            // Apply new styles
            this.#STYLES_MAP.applyStyles();
        }
    }

    // Apply customized styles to 'style' element
    applyStyles() {
        // Check styles map
        this.#checkStyleElement();

        // Append customized styles
        let newContent = "";

        for (let [selector, property] of this.#STYLES_MAP.entries()) {
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
    createElementWithId(tagName, parentElement, id,...classNames) {
        const element = document.createElement(tagName);

        this.setElementId(element, id)
        this.addClassNames(element,...classNames)

        parentElement.appendChild(element);
        return element;
    }

    // Create element
    createElement(tagName, parentElement, ...classNames) {
        return this.createElementWithId(tagName, parentElement, null, ...classNames);
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
    async loadHiddenSVG( url, viewBox, id) {
            // SVG already loaded
            if(this.#LOADED_SVGS.get(id))
                return

            // Set SVG as being loaded
            this.#LOADED_SVGS.set(id, true)

            const svgElement = document.createElementNS(COMPJS_URIS.SVG_NAMESPACE, 'svg');
            const symbolElement = document.createElementNS(COMPJS_URIS.SVG_NAMESPACE, 'symbol');

            this.setElementId(symbolElement, id)

            svgElement.appendChild(symbolElement);
            document.querySelector("body").appendChild(svgElement);

            fetch(url)
                .then(response => response.text())
                .then(svgData => {
                    const parser = new DOMParser();
                    const parsedSvg = parser.parseFromString(svgData, "image/svg+xml");

                    svgElement.version="2.0";
                    svgElement.classList.add(COMPJS_SELECTORS.HIDE)
                    symbolElement.setAttribute('viewBox', viewBox);

                    symbolElement.innerHTML=parsedSvg.documentElement.innerHTML;
                });
    }

    // Load SVG
    loadSVG(parentElement, id, ...classNames) {
        id=this.getFormattedId(id)
        const getHiddenSVG=document.querySelector(id);

        if(!getHiddenSVG)
            throw new Error("Hidden SVG element not found...");

        const svgElement = document.createElementNS(COMPJS_URIS.SVG_NAMESPACE, 'svg');
        const useElement=document.createElementNS(COMPJS_URIS.SVG_NAMESPACE, 'use');
        useElement.setAttribute('href', id);

        this.addClassNames(svgElement,...classNames)
        svgElement.appendChild(useElement);
        parentElement.appendChild(svgElement);

        return svgElement;
    }
}
