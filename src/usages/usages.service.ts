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

    async getTop3() {
        const data: Array<{ date: string; totalRequest: number }> = await this.prisma.$queryRawUnsafe(
            `SELECT
                c."client_id" AS "clientId",
                c."name",
                c."email",
                COUNT(logs.id)::int AS "totalRequest"
            FROM "api_logs" logs
            INNER JOIN "clients" c ON c."client_id" = logs."client_id"
                WHERE logs.timestamp >= NOW() - INTERVAL '24 hours'
            GROUP BY c."client_id", c."name", c."email"
            ORDER BY "totalRequest" DESC
            LIMIT 3;`,
        );

        return {
            totalRequest: data.reduce((sum, r) => sum + Number(r.totalRequest), 0),
            data,
        };
    }
}
