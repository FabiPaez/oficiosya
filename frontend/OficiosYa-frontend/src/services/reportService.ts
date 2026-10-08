import { mockReports } from '../data/mockReports'
import type { Report, ReportReason } from '../types/report'

interface CreateReportData {
  reporterId: string
  workerId?: string
  reviewId?: string
  reason: ReportReason
  description: string
}

export const reportService = {
  async getAll(): Promise<Report[]> {
    return Promise.resolve([...mockReports])
  },

  async getByReporterId(
    reporterId: string,
  ): Promise<Report[]> {
    return Promise.resolve(
      mockReports.filter(
        (report) => report.reporterId === reporterId,
      ),
    )
  },

  async getByWorkerId(
    workerId: string,
  ): Promise<Report[]> {
    return Promise.resolve(
      mockReports.filter(
        (report) => report.workerId === workerId,
      ),
    )
  },

  async create(data: CreateReportData): Promise<Report> {
    const report: Report = {
      id: `report-${Date.now()}`,
      reporterId: data.reporterId,
      workerId: data.workerId,
      reviewId: data.reviewId,
      reason: data.reason,
      description: data.description,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    mockReports.push(report)

    return Promise.resolve(report)
  },
}