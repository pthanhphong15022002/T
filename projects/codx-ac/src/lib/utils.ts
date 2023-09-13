export function groupBy(arr: any[], key: string): any[][] {
  if (!Array.isArray(arr)) {
    return [[]];
  }

  return Object.values(
    arr.reduce((acc, current) => {
      acc[current[key]] = acc[current[key]] ?? [];
      acc[current[key]].push(current);
      return acc;
    }, {})
  );
}

/** @example StudentId => studentId */
export function toCamelCase(pascalCase: string): string {
  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
}

/** @example studentId => StudentId */
export function toPascalCase(camelCase: string): string {
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}
