export type EvaluableClass = string | null | undefined | boolean | number;

export function cls(...classes: EvaluableClass[]) {
  return classes.filter(Boolean).join(" ");
}
