import {COMPJS_PATHS, COMPJS_SELECTORS, COMPJS_VARIABLES_LIST} from "./compjs-props.js";

export class CompJS {
    // Unique instance
    static #INSTANCE;

    // Document elements
    #head;
    #style;

    // Styles
    #STYLES_MAP;

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
            obj.addStyleSheet(COMPJS_PATHS.BASE);

            // Custom CSS style
            obj.#checkStyleElement();
            obj.#STYLES_MAP = new Map();
            obj.#ELEMENTS_ID = new Map();

            CompJS.#INSTANCE = obj;
        }
        return CompJS.#INSTANCE;
    }

    // - Utilities

    // Method to convert pixels to rem
    convertPixelsToRem(pixels) {
        return pixels/ parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    // Method to check if the style element exists and is inside the head element
    #checkStyleElement() {
        if (this.#style === undefined) {
            this.#style = document.createElement('style');
            this.#style.id = COMPJS_SELECTORS.STYLE;
        }

        if (this.#head.contains(this.#style) === false)
            this.#head.appendChild(this.#style);
    }

    // Method to check if a variable is a string
    isString(variable) {
        return variable instanceof String || typeof (variable) === 'string';
    }

    // Method to check class names
    checkClassName(className) {
        if (!this.isString(className))
            throw new Error('Class name must be a string...');
    }

    getFormattedClassName(className) {
        return className.startsWith(".") ? className : ("."+className);
    }

    checkClassNames(classNames) {
        if (classNames === undefined)
            throw new Error('Class names are undefined...');

        if (classNames.length === 0)
            throw new Error('Class names list is empty...');


        classNames.forEach(className=>this.checkClassName(className))
    }

    getFormattedClassNames(classNames) {
        this.checkClassNames(classNames)

        const checkedClassNames=new Array(classNames.length)

        classNames.forEach((className, i)=>{
            checkedClassNames[i]=this.getFormattedClassName(className);
        })

        return checkedClassNames
    }

    // Methods to check property names
    checkPropertyName(propertyName) {
        if (!this.isString(propertyName))
            throw new Error('Property name must be a string...');
    }

    /*
    isCompJSPropertyNameValid(propertyName) {
        // Check if the given property name is valid
        this.checkPropertyName(propertyName);

        for (let validPropertyName of COMPJS_VARIABLES_LIST)
            if (validPropertyName === propertyName)
                return true;

        return false;
    }
    */

    // Methods to check property value
    checkPropertyValue(propertyValue) {
        if (!this.isString(propertyValue))
            throw new Error('Property value must be a string...');
    }

    // - Setters and getters

    // General methods for getting CSS classes properties values
    getClassElement(className) {
        this.checkClassName(className)
        className=this.getFormattedClassName(className);

        return document.querySelector(className);
    }

    getCompStyle(className) {
        const classElement = this.getClassElement(className);

        return (classElement === null) ? null : window.getComputedStyle(classElement);
    }

    #getClassPropertyValue(className, propertyName) {
        this.checkPropertyName(propertyName);
        const compStyle = this.getCompStyle(className);
        const propertyValue = compStyle.getPropertyValue(propertyName);

        return (propertyValue === undefined) ? null : propertyValue;
    }

    getClassPropertiesValues(className, propertiesName) {
        this.checkClassName(className);
        className=this.getFormattedClassName(className);

        const classPropertiesMap = new Map();

        for (let propertyName of propertiesName) {
            let propertyValue = this.#getClassPropertyValue(className, propertyName);

            if (classPropertiesMap.has(className) === false) {
                classPropertiesMap.set(className, new Map([[propertyName, propertyValue]]));
                continue;
            }

            classPropertiesMap.get(className).set(propertyName, propertyValue);
        }

        return classPropertiesMap;
    }

    getCompJSRootPropertiesValues() {
        return this.getClassPropertiesValues(COMPJS_SELECTORS.ROOT, COMPJS_VARIABLES_LIST);
    }

    // General methods for setting CSS class property values
    #setClassPropertyValue(className, propertyName, propertyValue) {
        // Check parameters
        this.checkPropertyName(propertyName);
        this.checkPropertyValue(propertyValue);

        // Add class property style
        if (this.#STYLES_MAP.has(className) === false) {
            this.#STYLES_MAP.set(className, new Map([[propertyName, propertyValue]]));
            return;
        }

        this.#STYLES_MAP.get(className).set(propertyName, propertyValue);
    }

    setCompJSPropertyValue(className, propertyName, propertyValue) {
        this.checkClassName(className)
        className=this.getFormattedClassName(className);

        /*
        if (!this.isCompJSPropertyNameValid(propertyName))
            throw new Error(`'${propertyName}' is an invalid property name...`);
         */

        this.#setClassPropertyValue(className, propertyName, propertyValue);
    }

    setCompJSRootPropertyValue(propertyName, propertyValue) {
        this.setCompJSPropertyValue(COMPJS_SELECTORS.ROOT, propertyName, propertyValue);
    }

    // - Links
    #addLink(rel, type, href) {
        // Create new link element for the stylesheet
        let link = document.createElement('link');

        // Set the attributes for link element
        link.rel = rel;
        link.type = type;
        link.href = href;

        // Append link element to HTML head
        this.#head.appendChild(link);
    }

    addStyleSheet(path) {
        if (!path.endsWith('.css'))
            throw new Error("Invalid path to stylesheet, it must end with '.css'...");

        this.#addLink('stylesheet', 'text/css', path);
    }

    // - Resets

    // Reset all applied customized styles
    resetAllAppliedStyles() {
        this.#style.textContent = "";
    }

    // Reset map with customized styles
    resetStylesMap() {
        this.#STYLES_MAP = new Map();
    }

    // Reset applied customized styles for a given class name
    resetAppliedClassStyles(className) {
        className=this.checkClassName(className);

        // Reset styles for the given class name
        if (this.#STYLES_MAP.has(className)) {
            this.#STYLES_MAP.delete(className);

            // Reset style element content
            this.#STYLES_MAP.resetAllAppliedStyles();

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

        for (let [className, property] of this.#STYLES_MAP.entries()) {
            let newPropertyContent = `${className} {\n`;

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

    createElement(tagName, parentElement, ...classNames) {
        const element = document.createElement(tagName);

        if (classNames !== undefined && classNames.length > 0) {
            this.checkClassNames(classNames);
            element.classList.add(...classNames);
        }

        parentElement.appendChild(element);

        return element;
    }

    setElementID(elementId, element) {
        if (this.#ELEMENTS_ID.get(elementId) !== undefined)
            throw new Error("Element ID has already being assigned...");

        this.#ELEMENTS_ID.set(elementId, element);
    }

    // - Loaders

    loadImg(parentElement, url, alt, classNames) {
        const imgElement = document.createElement("img");
        imgElement.src = url;

        if (alt !== undefined)
            imgElement.alt = alt;

        if (classNames !== undefined && classNames.length > 0) {
            this.checkClassNames(classNames);
            imgElement.classList.add(...classNames);
        }

        parentElement.appendChild(imgElement);

        return imgElement;
    }

    loadObject(parentElement, data, type, classNames) {
        const objectElement = document.createElement('object');

        if (data !== undefined)
            objectElement.data = data;

        if (type !== undefined)
            objectElement.type = type;

        if (classNames !== undefined && classNames.length > 0) {
            this.checkClassNames(classNames);
            objectElement.classList.add(...classNames);
        }

        parentElement.appendChild(objectElement);
        return objectElement;
    }

    loadSVG(parentElement, url, alt, ...classNames) {
        // Create SVG img element
        return this.loadImg(parentElement, url, alt, classNames);
    }
}
