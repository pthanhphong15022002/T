import { Pipe, PipeTransform } from "@angular/core";
import { of, concatMap, groupBy, mergeMap, zip, toArray } from "rxjs";

@Pipe({
    name: 'disctintPipe'
  })
  export class DisctintPipe implements PipeTransform {
    transform(value: any,key:string) {
      // return [
      //   ...new Map(value.map((item: any) => [item[key], item])).values(),
      // ] as any;
      if(value && value.length > 0)
        return ([...new Map(value.map((item: any) => [item[key], item])).values()] as any).map((x) => ({voteType: x[key], count: value.filter(y => y.voteType == x[key]).length}));
      else return [];
    }
  }