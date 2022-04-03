import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'groupfilter',
})
export class GroupFilterPipe implements PipeTransform {
    transform(items: any[], groupName: string, index = -1): any {
        var itemreturn = items;
        var classs = groupName;
        if (groupName) {
            itemreturn = items.filter(x => x[groupName] == groupName);
            if (itemreturn.length == 0) {
                classs = "group-control";
                itemreturn = items.filter(x => x[groupName] == groupName);
            }
            if (itemreturn && itemreturn.length > 0)
                itemreturn = itemreturn.sort(function (a, b) { return a['columnOrder'] - b['columnOrder'] });
        }
        if (index > -1) {
            var el = document.querySelector('.' + classs + " .row[data-index=" + index + "]");

            if (el) {
                var chs = el.children;
                if (chs && chs.length > 0)
                    index = -1;
                itemreturn = items.filter(x => x['columnOrder'] == index);
                itemreturn = itemreturn.sort(function (a, b) { return a['columnOrder'] - b['columnOrder'] || a['sortOrder'] - b['sortOrder'] });
                //_.orderBy(itemreturn, ['columnOrder', 'sortOrder'], ['asc', 'asc']);
            }
        }

        //console.log(itemreturn);
        return itemreturn;
    }
}