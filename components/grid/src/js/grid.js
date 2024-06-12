'use strict';

import * as compjs from "./compjs.js";

export class Grid extends compjs.CompJS
{

  // - Static variables

  // Main class name
  static #MAIN_CLASS_NAME = ".grid";

  static #VALID_CLASS_NAMES = [this.#MAIN_CLASS_NAME];

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
    compjs.CompJS._ifIsValidApply(Grid.#VALID_CLASS_NAMES, className,
      () =>
      {
        const propertyValue = compjs.CompJS._getCompStyle(className, propertyName);
        return (propertyValue === undefined) ? null : propertyValue;
      });
  }

  static getClassProperties (className, ...propertiesName)
  {
    const propertiesMap = new Map();

    for (let propertyName of propertiesName)
      propertiesMap.set(propertyName, Grid.getClassProperty(className, property));

    return propertiesMap;
  }

  static getClassProperties (...propertiesName)
  {
    return CompJS._getClassProperties(Grid.#MAIN_CLASS_NAME, propertiesName);
  }

  // General methods for setting CSS classes properties values
  static setClassProperty (propertyName, propertyValue)
  {
    compjs.CompJS._setClassProperty(Grid.#MAIN_CLASS_NAME, propertyName, propertyValue);
  }

  static setClassProperty (className, propertyName, propertyValue)
  {
    compjs.CompJS._setValidClassProperty(Grid.#VALID_CLASS_NAMES, className, propertyName, propertyValue);
  }

  // Reset applied customed styles
  static resetClassAppliedStyles ()
  {
    compjs.CompJS._resetClassAppliedStyles(Grid.#MAIN_CLASS_NAME);
  }

  static resetClassAppliedStyles (className)
  {
    compjs.CompJS._ifIsValidApply(Grid.#VALID_CLASS_NAMES, className,
      () =>
      {
        compjs.CompJS._resetClassAppliedStyles(className);
      });
  }
};