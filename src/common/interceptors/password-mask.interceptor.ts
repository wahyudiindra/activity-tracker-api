import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { isArray, isDate, isEmpty, isObject } from 'class-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PasswordMaskInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(map((data) => this.maskPasswords(data)));
    }

    maskPasswords(data: any): any {
        if (isArray(data)) {
            return data.map((item) => this.maskPasswords(item));
        } else if (isDate(data) || !isObject(data) || isEmpty(data)) {
            return data;
        }

        return Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, /password/i.test(k) ? '******' : this.maskPasswords(v)]),
        );
    }
}
