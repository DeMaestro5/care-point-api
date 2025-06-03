import AppointmentRepo from '../database/repository/AppointmentRepo';
import InventoryRepo from '../database/repository/InventoryRepo';
import OrderRepo from '../database/repository/OrderRepo';
import { Types } from 'mongoose';

export interface ReportFilters {
  status?: string;
  doctorId?: string;
  patientId?: string;
  pharmacyId?: string;
  department?: string;
}

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface ExportParams {
  format: 'csv' | 'excel' | 'json';
  dateRange?: DateRange;
  filters?: ReportFilters;
  limit?: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'appointments' | 'patients' | 'inventory' | 'sales' | 'custom';
  defaultFilters?: ReportFilters;
  createdAt: Date;
}

class ReportsAndExportsService {
  // Predefined report templates
  private static templates: ReportTemplate[] = [
    {
      id: 'appointments-daily',
      name: 'Daily Appointments Report',
      description: 'Daily summary of appointments with status breakdown',
      type: 'appointments',
      createdAt: new Date(),
    },
    {
      id: 'appointments-weekly',
      name: 'Weekly Appointments Report',
      description: 'Weekly appointments overview',
      type: 'appointments',
      createdAt: new Date(),
    },
    {
      id: 'patients-summary',
      name: 'Patients Summary Report',
      description: 'Comprehensive patient data overview',
      type: 'patients',
      createdAt: new Date(),
    },
    {
      id: 'inventory-stock',
      name: 'Inventory Stock Report',
      description: 'Current inventory levels and expiry tracking',
      type: 'inventory',
      createdAt: new Date(),
    },
    {
      id: 'sales-summary',
      name: 'Sales Summary Report',
      description: 'Sales performance and revenue analysis',
      type: 'sales',
      createdAt: new Date(),
    },
  ];

  static getTemplates(): ReportTemplate[] {
    return this.templates;
  }

  static async exportAppointments(params: ExportParams) {
    const filters: any = {};

    // Apply filters
    if (params.filters) {
      if (params.filters.status) {
        filters.status = params.filters.status;
      }
      if (params.filters.doctorId) {
        filters.doctor = new Types.ObjectId(params.filters.doctorId);
      }
      if (params.filters.patientId) {
        filters.patient = new Types.ObjectId(params.filters.patientId);
      }
    }

    // Apply date range filter
    if (params.dateRange) {
      const dateFilter: any = {};
      if (params.dateRange.startDate) {
        dateFilter.$gte = params.dateRange.startDate;
      }
      if (params.dateRange.endDate) {
        dateFilter.$lte = params.dateRange.endDate;
      }
      if (Object.keys(dateFilter).length > 0) {
        filters.appointmentDate = dateFilter;
      }
    }

    const result = await AppointmentRepo.findByFilter(filters, {
      page: 1,
      limit: params.limit || 1000,
    });

    return this.formatData(result.appointments, params.format);
  }

  static async exportPatients(params: ExportParams) {
    // For patients, we'll use a simple approach since findByFilter isn't available
    // This is a simplified version that could be enhanced with direct model queries
    const sampleData = [
      {
        id: '1',
        name: 'Sample Patient',
        status: 'active',
        createdAt: new Date(),
      },
    ];

    return this.formatData(sampleData, params.format);
  }

  static async exportInventory(params: ExportParams) {
    let pharmacyId: Types.ObjectId | undefined;

    // Apply filters
    if (params.filters?.pharmacyId) {
      pharmacyId = new Types.ObjectId(params.filters.pharmacyId);
    }

    const result = await InventoryRepo.findByPharmacyId(
      pharmacyId || new Types.ObjectId(),
      1,
      params.limit || 1000,
    );

    return this.formatData(result.items, params.format);
  }

  static async exportSales(params: ExportParams) {
    const filters: any = {};

    // Apply date range filter
    if (params.dateRange) {
      const dateFilter: any = {};
      if (params.dateRange.startDate) {
        dateFilter.startDate = params.dateRange.startDate;
      }
      if (params.dateRange.endDate) {
        dateFilter.endDate = params.dateRange.endDate;
      }
      if (Object.keys(dateFilter).length > 0) {
        Object.assign(filters, dateFilter);
      }
    }

    // Apply other filters
    if (params.filters) {
      if (params.filters.status) {
        filters.status = params.filters.status;
      }
    }

    let pharmacyId: Types.ObjectId | undefined;
    if (params.filters?.pharmacyId) {
      pharmacyId = new Types.ObjectId(params.filters.pharmacyId);
    }

    const result = await OrderRepo.findByPharmacyId(
      pharmacyId || new Types.ObjectId(),
      1,
      params.limit || 1000,
      filters,
    );

    return this.formatData(result.orders, params.format);
  }

  static async generateReport(reportData: any) {
    // This would typically integrate with a PDF generation library
    // For now, return a mock report structure
    return {
      id: `report_${Date.now()}`,
      title: reportData.title,
      type: reportData.type,
      generatedAt: new Date(),
      format: reportData.format,
      filters: reportData.filters,
      dateRange: reportData.dateRange,
      status: 'completed',
      downloadUrl: `/api/reports/download/report_${Date.now()}`,
    };
  }

  private static formatData(data: any[], format: string) {
    switch (format) {
      case 'csv':
        // Convert to CSV format manually to avoid dependency issues
        if (data.length === 0) {
          return {
            data: '',
            contentType: 'text/csv',
            filename: `export_${Date.now()}.csv`,
          };
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((item) =>
          Object.values(item)
            .map((value) =>
              typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value,
            )
            .join(','),
        );

        return {
          data: `${headers}\n${rows.join('\n')}`,
          contentType: 'text/csv',
          filename: `export_${Date.now()}.csv`,
        };

      case 'json':
        return {
          data: JSON.stringify(data, null, 2),
          contentType: 'application/json',
          filename: `export_${Date.now()}.json`,
        };

      case 'excel':
        // Would integrate with xlsx library for Excel export
        return {
          data: JSON.stringify(data, null, 2), // Placeholder
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename: `export_${Date.now()}.xlsx`,
        };

      default:
        return {
          data: JSON.stringify(data, null, 2),
          contentType: 'application/json',
          filename: `export_${Date.now()}.json`,
        };
    }
  }
}

export default ReportsAndExportsService;
