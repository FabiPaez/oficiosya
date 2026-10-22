
export function getZonesFromCoverage(
  coverage: string | null | undefined,
): string[] {
  switch (coverage) {
    case 'SOLO CENTRO':
      return ['Centro']

    case 'RURAL':
      return ['Rural']

    case 'CENTRO + RURAL':
      return ['Centro', 'Rural']

    default:
      return []
  }
}