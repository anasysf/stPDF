export default function plurify(str: string, amount: number): string {
  return `${str}${amount === 1 ? '' : 's'}`;
}
