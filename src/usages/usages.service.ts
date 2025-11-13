import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class UsagesService {
    constructor(private prisma: PrismaService) {}

    async getDaily() {
        const data: Array<{ date: string; totalRequest: number }> = await this.prisma.$queryRawUnsafe(
            `SELECT 
                TO_CHAR(dates.date, 'YYYY-MM-DD') AS date,
                COALESCE(COUNT("api_logs".timestamp), 0)::int AS "totalRequest"
            FROM (
                SELECT generate_series(
                    NOW() - INTERVAL '6 days',
                    NOW(),
                    INTERVAL '1 day'
                )::date AS date
            ) AS dates
            LEFT JOIN "api_logs"
                ON DATE("api_logs".timestamp) = dates.date
            GROUP BY dates.date
            ORDER BY dates.date DESC;`,
        );

        return {
            totalRequest: data.reduce((sum, r) => sum + Number(r.totalRequest), 0),
            data,
        };
    }
}
