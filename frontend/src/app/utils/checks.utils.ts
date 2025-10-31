import { stringify } from "./utils";

export function assertObjectsMatch(any: Map<string, any[]>, assertion: string
): boolean {
  let log: string = `${assertion}:\n`;

  any.forEach((value: any[], key: string) => {
    log += (`${key}: ${stringify(value)}\n`);
  });

  console.log('%c' + log, `color: #014D4E; background: #7FFFD4; padding: 5px; border-radius: 5px;`);

  let values: Array<any[]> = Array.from(any.values());
  let valuesMatch: boolean = doValuesMatch(values), refMatch: boolean = areRefsIdentical(values);

  console.assert(valuesMatch, `${assertion}: Values mismatch`, { values });
  console.assert(refMatch, `${assertion}: References are not identical`, { values });

  return valuesMatch && refMatch;
}

export function areRefsIdentical(arr: Array<any[]>): boolean {
  return arr.every((value: any[], index: number, array: Array<any[]>) => index === array.length - 1 || value === array[index + 1]);
}

export function doValuesMatch(arr: Array<any[]>): boolean {
  return arr.every((value: any[], index: number, array: Array<any[]>) => index === array.length - 1 || stringify(value) === stringify(array[index + 1]));
}