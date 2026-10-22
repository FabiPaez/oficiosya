export function getZonesFromCoverage(
  coverage: string | null | undefined,
): string[] {
  switch (coverage) {
    case 'SOLO CENTRO':
      return ['Jáchal Centro']

    case 'RURAL':
      return ['Zonas rurales']

    case 'CENTRO + RURAL':
      return ['Jáchal Centro', 'Zonas rurales']

    default:
      return []
  }
}