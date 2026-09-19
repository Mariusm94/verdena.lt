/** Lietuvių daiktavardžio forma po skaičiaus: [vns., dgs. vard., dgs. kilm.] */
export function ltPlural(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 9) return forms[1];
  return forms[2];
}

export function ltTeams(count: number) {
  return `${count} ${ltPlural(count, ["komanda", "komandos", "komandų"])}`;
}

export function ltMatches(count: number) {
  return `${count} ${ltPlural(count, ["mačas", "mačai", "mačų"])}`;
}
