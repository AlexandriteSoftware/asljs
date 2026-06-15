export class Definition
{
  constructor(
    { definitionPath,
      name,
      description,
      location,
      properties,
      rules,
      propertyDefinitions,
      ruleIds })
  {
    this.definitionPath = definitionPath;
    this.name = name;
    this.description = description;
    this.location = location;
    this.properties = properties;
    this.rules = rules;
    this.propertyDefinitions = propertyDefinitions;
    this.ruleIds = ruleIds;
  }
}
