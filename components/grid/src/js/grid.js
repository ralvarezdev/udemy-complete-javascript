'use strict';

import { CompJS } from "./compjs.js";

export class Grid extends CompJS
{

  // - Static variables

  // Main class name
  static #MAIN_CLASS_NAME = ".grid";

  static #VALID_CLASS_NAMES = [Grid.#MAIN_CLASS_NAME];

  constructor (props)
  {
    super();

    this.props = props;
  }

  // - Setters and Getters

  // Class Name
  get mainClassName ()
  {
    return Grid.#MAIN_CLASS_NAME;
  }

  // General methods for getting CSS classes properties values
  static getClassProperty (className, propertyName)
  {
    CompJS._ifIsValidApply(Grid.#VALID_CLASS_NAMES, className,
      () => CompJS._getClassProperty(className, propertyName));
  }

  static getClassProperties (className, propertiesName)
  {
    const propertiesMap = new Map();

    for (let propertyName of propertiesName)
      propertiesMap.set(propertyName, Grid.getClassProperty(className, property));

    return propertiesMap;
  }

  static getClassProperties (propertiesName)
  {
    return CompJS._getClassProperties(Grid.#MAIN_CLASS_NAME, propertiesName);
  }

  // General methods for setting CSS classes properties values
  static setClassProperty (propertyName, propertyValue)
  {
    CompJS._setClassProperty(Grid.#MAIN_CLASS_NAME, propertyName, propertyValue);
  }

  static setClassProperty (className, propertyName, propertyValue)
  {
    CompJS._setValidClassProperty(Grid.#VALID_CLASS_NAMES, className, propertyName, propertyValue);
  }

  // Reset applied customed styles
  static resetClassAppliedStyles ()
  {
    CompJS._resetClassAppliedStyles(Grid.#MAIN_CLASS_NAME);
  }

  static resetClassAppliedStyles (className)
  {
    CompJS._ifIsValidApply(Grid.#VALID_CLASS_NAMES, className,
      () => CompJS._resetClassAppliedStyles(className));
  }
};