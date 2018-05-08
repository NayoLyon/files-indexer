
// For date formatting: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/DateTimeFormat
export function printValue(val) {
  if (val instanceof Date) {
    return val.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  }
  return `${val}`;
}

export function dummy() {
  // To avoid eslint error...
}
