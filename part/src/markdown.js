export function extractHeading(content)
{
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

export function extractSectionBody(content, sectionName)
{
  const lines = content.split(/\r?\n/);
  let activeSection = null;
  const buffer = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+)$/);

    if (sectionMatch) {
      const currentSection = sectionMatch[1].trim();

      if (activeSection === sectionName) {
        break;
      }

      activeSection = currentSection;
      continue;
    }

    if (activeSection === sectionName) {
      buffer.push(line);
    }
  }

  if (buffer.length === 0) {
    return null;
  }

  return buffer.join('\n').trim();
}

export function parseLocationFolder(locationBody)
{
  const inlineCodeMatch = locationBody.match(/`([^`]+)`/);

  if (inlineCodeMatch) {
    return inlineCodeMatch[1].trim();
  }

  const proseMatch = locationBody.match(/stored in (?:the )?(.+?) folder/i);
  return proseMatch ? proseMatch[1].trim() : null;
}

export function parsePropertyDefinitions(propertiesBody)
{
  const definitions = new Map();

  for (const match of propertiesBody.matchAll(/^-\s+([^:\n]+):/gm)) {
    const label = match[1].trim();
    definitions.set(normalizeLabel(label), toPropertyName(label));
  }

  return definitions;
}

export function parsePropertyValues(content, propertyDefinitions = new Map())
{
  const properties = {};

  for (const match of content.matchAll(/^-\s+([^:\n]+):\s+(.+)$/gm)) {
    const label = match[1].trim();
    const value = match[2].trim();
    const propertyName = propertyDefinitions.get(normalizeLabel(label)) ?? toPropertyName(label);
    properties[propertyName] = value;
  }

  return properties;
}

export function parseRuleIds(rulesBody)
{
  return Array.from(rulesBody.matchAll(/^-\s+([A-Z]\d+)\b/gm), (match) => match[1]);
}

export function toTypeId(name)
{
  const parts = name.match(/[A-Za-z0-9]+/g) ?? [];
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

function toPropertyName(label)
{
  const parts = label.match(/[A-Za-z0-9]+/g) ?? [];

  return parts
    .map((part, index) => {
      const lowerPart = part.toLowerCase();
      return index === 0
        ? lowerPart
        : lowerPart.charAt(0).toUpperCase() + lowerPart.slice(1);
    })
    .join('');
}

function normalizeLabel(label)
{
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}