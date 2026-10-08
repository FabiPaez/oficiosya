import type { Worker } from '../types/worker'
import { normalizeText } from './normalizeText'

const MIN_REVIEWS_FOR_RATING = 3

interface RankingContext {
  query?: string
  categoryId?: string
  zone?: string
}

function getRatingScore(worker: Worker): number {
  if (worker.reviewCount < MIN_REVIEWS_FOR_RATING) {
    return 0
  }

  return worker.ratingAverage / 5
}

function getReviewCountScore(worker: Worker): number {
  if (worker.reviewCount === 0) {
    return 0
  }

  return Math.min(worker.reviewCount / 20, 1)
}

function getPremiumScore(worker: Worker): number {
  return worker.premium ? 1 : 0
}

function getRelevanceScore(
  worker: Worker,
  context: RankingContext,
): number {
  const query = normalizeText(context.query ?? '')

  if (!query) {
    return 0
  }

  const name = normalizeText(
    `${worker.firstName} ${worker.lastName}`,
  )

  const description = normalizeText(worker.description)

  const categories = worker.categories.map(normalizeText)

  const zones = worker.zones.map(normalizeText)

  if (name === query) {
    return 1
  }

  if (
    categories.some(
      (category) => category === query,
    )
  ) {
    return 0.95
  }

  if (name.startsWith(query)) {
    return 0.9
  }

  if (
    categories.some((category) =>
      category.startsWith(query),
    )
  ) {
    return 0.85
  }

  if (name.includes(query)) {
    return 0.8
  }

  if (
    categories.some((category) =>
      category.includes(query),
    )
  ) {
    return 0.75
  }

  if (
    zones.some((zone) =>
      zone.includes(query),
    )
  ) {
    return 0.6
  }

  if (description.includes(query)) {
    return 0.5
  }

  return 0
}

export function getWorkerRankingScore(
  worker: Worker,
  context: RankingContext,
): number {
  const relevanceScore = getRelevanceScore(
    worker,
    context,
  )

  const ratingScore = getRatingScore(worker)
  const reviewCountScore = getReviewCountScore(worker)
  const premiumScore = getPremiumScore(worker)

  return (
    relevanceScore * 0.4 +
    ratingScore * 0.3 +
    reviewCountScore * 0.2 +
    premiumScore * 0.1
  )
}

export function rankWorkers(
  workers: Worker[],
  context: RankingContext,
): Worker[] {
  return [...workers].sort(
    (workerA, workerB) =>
      getWorkerRankingScore(workerB, context) -
      getWorkerRankingScore(workerA, context),
  )
}