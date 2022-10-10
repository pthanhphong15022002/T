import { from } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { CacheService } from 'codx-core';
@Pipe({
    name: 'message',
    pure: false
})
export class MessagePipe implements PipeTransform {
    constructor(private cache: CacheService) { }
    private content: any = null;
    transform(content: string, dataPipe: Array<string>): any {
        if (content && dataPipe)
            return this.stringInject(content, dataPipe);
        return "";
    }
    stringInject(str, arr): string {
        if (typeof str !== 'string' || !(arr instanceof Array)) {
            return "";
        }

        return str.replace(/({\d})/g, function (i) {
            return arr[i.replace(/{/, '').replace(/}/, '')];
        });
    }
}