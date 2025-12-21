export type FairSurpriseLabel =
  | "Major Upset"
  | "Upset"
  | "Logical Outcome"
  | "Missed Edge"
  | "Major Miss";

export function computeFairSurprise(value: number): {
  value: number;
  label: FairSurpriseLabel;
  color: string;
} {
  if (value >= 1.0)
    return { value, label: "Major Upset", color: "bg-red-100 text-red-800" };

  if (value >= 0.4)
    return { value, label: "Upset", color: "bg-orange-100 text-orange-800" };

  if (value > -0.4)
    return { value, label: "Logical Outcome", color: "bg-green-100 text-green-800" };

  if (value > -1.0)
    return { value, label: "Missed Edge", color: "bg-blue-100 text-blue-800" };

  return { value, label: "Major Miss", color: "bg-gray-200 text-gray-800" };
}
