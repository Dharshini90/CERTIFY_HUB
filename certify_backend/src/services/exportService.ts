import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { CertificateModel } from '../models/Certificate';
import { ExportFormat, StatsFilters, ExportData } from '../types';

export class ExportService {
    static async generateExport(
        format: ExportFormat,
        filters: StatsFilters
    ): Promise<string> {
        const rawData = await CertificateModel.getAggregatedStats(filters);

        // Ensure platform_counts is parsed if it comes as a string from DB
        const data = rawData.map(row => ({
            ...row,
            platform_counts: typeof row.platform_counts === 'string'
                ? JSON.parse(row.platform_counts)
                : row.platform_counts || {}
        }));

        if (format === ExportFormat.EXCEL) {
            return this.generateExcel(data);
        }

        throw new Error('Unsupported export format');
    }

    private static getPlatformNames(data: ExportData[]): string[] {
        const platformNames = new Set<string>();
        data.forEach(row => {
            if (row.platform_counts) {
                Object.keys(row.platform_counts).forEach(name => platformNames.add(name));
            }
        });
        return Array.from(platformNames).sort();
    }

    private static async generateExcel(data: ExportData[]): Promise<string> {
        const filePath = path.join('uploads', `export_${Date.now()}.xlsx`);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Certificate Report');

        if (data.length === 0) {
            worksheet.addRow(['No data available']);
            await workbook.xlsx.writeFile(filePath);
            return filePath;
        }

        const platformNames = this.getPlatformNames(data);

        // Define columns
        worksheet.columns = [
            { header: 'Roll Number', key: 'roll_number', width: 15 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Year', key: 'year', width: 15 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Section', key: 'section', width: 10 },
            { header: 'Total Certificates', key: 'total_certificates', width: 18 },
            { header: 'Verified', key: 'verified_certificates', width: 12 },
            { header: 'Rejected', key: 'rejected_certificates', width: 12 },
            ...platformNames.map((p) => ({
                header: `${p} Count`,
                key: `platform_${p}`,
                width: 15,
            })),
        ];

        // Add data rows
        data.forEach((row) => {
            const rowData: any = {
                roll_number: row.roll_number,
                name: row.name,
                year: row.year,
                department: row.department,
                section: row.section,
                total_certificates: row.total_certificates,
                verified_certificates: row.verified_certificates,
                rejected_certificates: row.rejected_certificates,
            };

            platformNames.forEach((p) => {
                rowData[`platform_${p}`] = (row.platform_counts as any)?.[p] || 0;
            });

            worksheet.addRow(rowData);
        });

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' },
        };

        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }
}

