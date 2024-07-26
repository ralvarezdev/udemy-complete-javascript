import {compJS} from "./compjs.js";

export class CompJSElement {
    // Element properties
    #ELEMENT_ID;
    #PARENT_ELEMENT

    constructor(elementId, parentElement) {
        this.#PARENT_ELEMENT = parentElement ? parentElement : document.body;
        this.#ELEMENT_ID = String(elementId)
    }

    // - Errors

    // Throw undefined element error
    _throwUndefinedElementError(elementName) {
        throw new Error(`CompJS ${elementName} element is not defined...`)
    }

    // - Getters

    // Get parent element
    get parentElement() {
        return this.#PARENT_ELEMENT
    }

    // Get element ID
    get elementId() {
        return this.#ELEMENT_ID
    }

    get id() {
        return this.elementId()
    }

    // Get selector with element ID
    getIdFromSelector(selector) {
        return [selector, this.#ELEMENT_ID].join('--')
    }

    // Get formatted selector with element ID
    getFormattedIdFromSelector(selector) {
        const id = this.getIdFromSelector(selector)
        return compJS.getFormattedId(id)
    }

    // Get class properties values
    getClassNameProperties(className, ...propertiesName) {
        className = compJS.getFormattedClassName(className)
        return compJS.getSelectorProperties(className, ...propertiesName);
    }

    // Get class properties values
    getIdProperties(id, ...propertiesName) {
        id = compJS.getFormattedId(id)
        return compJS.getSelectorProperties(id, ...propertiesName);
    }

    // Get class with element ID properties values
    getIdFromSelectorProperties(selector, ...propertiesName) {
        const id = this.getFormattedIdFromSelector(selector)
        return compJS.getSelectorProperties(id, ...propertiesName);
    }

    // Get formatted data name
    getFormattedDataName(dataName) {
        return dataName.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`)
    }

    // - Query selectors

    // Get element with the given selector and data
    _querySelectorWithData(parentElement, parentElementName, selector, dataName, data) {
        if (parentElement === undefined)
            this._throwUndefinedElementError(parentElementName)

        dataName = this.getFormattedDataName(dataName)
        return parentElement.querySelector(`${selector}[data-${dataName}='${data}']`)
    }

    // Get element with the given selector
    _querySelector(parentElement, parentElementName, selector) {
        if (parentElement === undefined)
            this._throwUndefinedElementError(parentElementName)

        return parentElement.querySelector(selector)
    }

    // Get all elements with the given selector and data
    _querySelectorAllWithData(parentElement, parentElementName, selector, dataName, data) {
        if (parentElement === undefined)
            this._throwUndefinedElementError(parentElementName)

        dataName = this.getFormattedDataName(dataName)
        return parentElement.querySelectorAll(`${selector}[data-${dataName}='${data}']`)
    }

    // Get all elements with the given selector
    _querySelectorAll(parentElement, parentElementName, selector) {
        if (parentElement === undefined)
            this._throwUndefinedElementError(parentElementName)

        return parentElement.querySelectorAll(selector)
    }

    // - Setters

    // Set class property value
    setClassProperty(className, propertyName, propertyValue) {
        className = compJS.getFormattedClassName(className)
        compJS.setSelectorProperty(className, propertyName, propertyValue);
    }

    // Set ID property value
    setIdProperty(id, propertyName, propertyValue) {
        id = compJS.getFormattedId(id)
        compJS.setSelectorProperty(id, propertyName, propertyValue);
    }

    // Set class with element ID property value
    setIdFromSelectorProperty(selector, propertyName, propertyValue) {
        const id = this.getFormattedIdFromSelector(selector)
        compJS.setSelectorProperty(id, propertyName, propertyValue);
    }

    // Make element editable
    setEditable(element, contentEditable) {
        element.contentEditable = contentEditable;
    }

    // - Element initializers

    // Create element with ID
    createElementWithId(tagName, parentElement, selector, ...classNames) {
        const id = this.getIdFromSelector(selector)
        return compJS.createElementWithId(tagName, parentElement, id, ...classNames);
    }

    // Create div with ID
    createDivWithId(parentElement, selector, ...classNames) {
        const id = this.getIdFromSelector(selector)
        return compJS.createDivWithId(parentElement, id, ...classNames);
    }

    // Create button with ID
    createButtonWithId(parentElement, selector, ...classNames) {
        const id = this.getIdFromSelector(selector)
        return compJS.createButtonWithId(parentElement, id, ...classNames);
    }

    // Create input with ID
    createInputWithId(parentElement, selector, name, type, value, ...classNames) {
        const id = this.getIdFromSelector(selector)
        return compJS.createInputWithId(parentElement, id, name, type, value, ...classNames);
    }

    // - Re-setters

    // Reset applied customized styles
    resetAppliedStyles(selector) {
        compJS.checkSelector(selector);
        compJS.resetAppliedStyle(selector);
    }
}