export class Definition
{
  constructor(
    { path,
      name,
      description,
      location,
      properties,
      rules,
      propertyDefinitions,
      ruleIds })
  {
    this.path = path;
    this.name = name;
    this.description = description;
    this.location = location;
    this.properties = properties;
    this.rules = rules;
    this.propertyDefinitions = propertyDefinitions;
    this.ruleIds = ruleIds;
  }
}
