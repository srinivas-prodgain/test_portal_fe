export const cn = (...values: Array<string | undefined | false | null>): string =>
  values.filter(Boolean).join(" ");
