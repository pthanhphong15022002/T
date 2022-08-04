import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApiHttpService, CacheService, LangPipe, NotificationsService } from 'codx-core';

@Component({
  selector: 'report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit, AfterViewInit {
  @ViewChild('paramEle') paramEle: ElementRef<any>;
  @ViewChild('reportEle') reportEle: ElementRef<any>;

  @Input() reportUUID: any = '3cdcde9d-8d64-ec11-941d-00155d035518';
  lstParent: any;
  parameters: any = [];
  lstParamsNotGroup: any = [];
  collapses: any = [];
  objParam: any = {};
  missingLabel = '';
  param: any = {};

  constructor(
    private dt: ChangeDetectorRef,
    private api: ApiHttpService,
    private cache: CacheService,
    private notification: NotificationsService,
  ) {
    var pipe = new LangPipe(this.cache);
    pipe.transform('Thiếu', 'lblMissing', 'Sys').subscribe(
      res => {
        this.missingLabel = res;
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.reportEle) {
      let height = this.reportEle.nativeElement.offsetHeight;
      if (this.paramEle) {
        this.paramEle.nativeElement.style.height = height + 'px';
      }
    }
  }

  ngOnInit(): void {
    this.loadParams();
  }

  changeValueDate(evt: any, dependenceChange?:any) {
    if(dependenceChange){
      console.log('dependenceChange',evt);
    }
    else{
      console.log(evt);

    }
  }

  valueChange(evt: any, dependenceChange?:any, type?:any) {
    if(dependenceChange){
      if(type && (type == 'switch' || type == 'checkbox')){
        this.objParam[evt.field] = evt.data;
        for(let i in this.parameters){
          let item = this.parameters[i];
          if(item && item.length > 0){
            let field = item.find(x=>x.dependences == evt.field);
            if(field){
               field.isVisible = evt.data;
               field = {...field};
            }
           }
        }
      }
      else{
        this.objParam[evt.field] = evt.data;
        for(let i in this.parameters){
          let item = this.parameters[i];
          if(item && item.length > 0){
            let field = item.find(x=>x.dependences == evt.field);
            if(field){
               field.isVisible = true;
               field = {...field};
            }
           }
        }
      }
      this.dt.detectChanges();
    }
    else{
      if(this.checkDependence(evt.field)){
        this.objParam[evt.field] = evt.data;

      }
      else{
        for(let i in this.parameters){
          let item = this.parameters[i];
          if(item && item.length > 0){
            let field = item.find(x=>x.controlName == evt.field);
            if(field && field.defaultValue){
               field.defaultValue = undefined;
            }
           }
        }
      }
    }
  }

  collapseChange(evt: any, eleID?: string) {
    let idx = this.lstParent.findIndex(x=> x == eleID);
    let ele = document.getElementById(eleID);
    if(ele){
      this.collapses[idx] = !this.collapses[idx];
      if (!this.collapses[idx]) {
        ele.classList.add('border-bottom-primary');
      } else {
        if (
          ele.classList.contains(
            'border-bottom-primary'
          )
        ) {
          ele.classList.remove('border-bottom-primary');
        }
      }
    }

  }

  restoreDefault(){
    this.loadParams();
  }

  apply(){
    this.param = this.objParam;
  }

  private loadParams(){
    this.objParam = this.param = {};
    this.api.exec<any>(
      "SYS",
      "ReportParametersBusiness",
      "GetReportParamAsync",
      this.reportUUID
    ).subscribe(res=>{
      if(res && res.length > 0){
        for(let i =0;i< res.length;i++){
          if(!res[i].dependences){
            res[i].isVisible = true;
          }
        }
      }
        this.lstParamsNotGroup = res;
        this.parameters = this.groupBy(res,'parentName');
        this.lstParent = Object.keys(this.parameters);
        this.lstParent.forEach(element => {
        this.collapses.push({[element]: false});
      });
    });
  }

  private groupBy(arr: any, key: any){
    return arr.reduce(function (r, a) {
      r[a[key]] = r[a[key]] || [];
      r[a[key]].push(a);
      return r;
    }, Object.create(null));
  }

  private checkDependence(controlName: any){
    if(this.lstParamsNotGroup && this.lstParamsNotGroup.length > 0){
      let pr = this.lstParamsNotGroup.find(x=> x.controlName == controlName);
      if(pr && pr.dependences){
        if(!this.objParam[pr.dependences]){
          let depenObj = this.lstParamsNotGroup.find(p=>p.controlName == pr.dependences);
          depenObj && this.notification.notify(this.missingLabel +" "+ depenObj.labelName);
          return false;
        }
        return true
      }
      else {
        return true;
      }
    }
    return false;
  }
}
