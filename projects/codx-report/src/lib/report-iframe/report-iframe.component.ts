import { AfterViewInit, Component, Input, OnChanges, OnInit, Optional, SimpleChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AuthStore, EnvironmentConfig } from "codx-core";
import { environment } from "src/environments/environment";

@Component({
  selector: 'codx-report-iframe',
  templateUrl: './report-iframe.component.html',
  styleUrls: ['./report-iframe.component.scss'],
})
export class CodxReportIframeComponent implements OnInit, AfterViewInit,OnChanges {
  @Input() funcID: any;
  @Input() predicates: any = "";
  @Input() dataValues: any = "";
  @Input() print: boolean = false;
  @Input() param: string = "";
  @Input() labels: string = "";
  @Input() format: string = "";
  @Input() service: string = "";

  private _preArray:any;
  private _user:any;
  urlSafe: any;
  src: string;

  constructor(
    private authStore: AuthStore,
    public sanitizer: DomSanitizer,
    @Optional() config?: EnvironmentConfig
  ){
    this._user = this.authStore.get();
  }
  ngOnInit(): void {
    debugger
    this._preArray = this.predicates.split('&&').join(';');
    // this.src = `${environment.reportUrl}?reportID=${this.funcID}&predicates=${this._preArray}&dataValues=${this.dataValues}&locale=vi&lvtk=${this._user.token}`;
    this.src = `${environment.reportUrl}?service=${this.service}&reportID=${this.funcID}&_param=${this.param}&_labels=${this.labels}&_format=${this.format}&predicates=${this._preArray}&dataValues=${this.dataValues}&locale=vi&lvtk=${this._user.token}`;
    
    if(this._user.administrator || this._user.functionAdmin) this.src +='&isAdmin=true';
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
  }
  ngAfterViewInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {
    debugger
    this.src = `${environment.reportUrl}?service=${this.service}&reportID=${this.funcID}&_param=${this.param}&_labels=${this.labels}&_format=${this.format}&locale=vi&lvtk=${this._user.token}`;
    if(this._user.administrator || this._user.functionAdmin) this.src +='&isAdmin=true';
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    // if(changes["param"] && changes["param"].currentValue){
    //   this.src = `${environment.reportUrl}?service=${this.service}&reportID=${this.funcID}&_param=${changes["param"].currentValue}&_labels=${this.labels}&_format=${this.format}&locale=vi&lvtk=${this._user.token}`;
    //   if(this._user.administrator || this._user.functionAdmin) this.src +='&isAdmin=true';
    //   this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    // }
    // else
    // {
    //   this._preArray = this.predicates.split('&&').join(';');
    //   this.src = `${environment.reportUrl}?service=${this.service}&reportID=${this.funcID}&predicates=${this._preArray}&dataValues=${this.dataValues}&locale=vi&lvtk=${this._user.token}`;
      
    //   if(this._user.administrator || this._user.functionAdmin) this.src +='&isAdmin=true';
    //   this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    // }
    // if(changes["labels"] &&changes["labels"].currentValue){
    //   this.src = `${environment.reportUrl}?service=${this.service}&reportID=${this.funcID}&_param=${this.param}&_labels=${changes["labels"].currentValue}&_format=${this.format}&locale=vi&lvtk=${this._user.token}`;
      
    //   if(this._user.administrator || this._user.functionAdmin) this.src +='&isAdmin=true';
    //   this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    // }
    // else
    // {
    // this._preArray = this.predicates.split('&&').join(';');
    // this.src = `${environment.reportUrl}?service=${this.service}&reportID=${this.funcID}&predicates=${this._preArray}&dataValues=${this.dataValues}&_param=${changes["param"].currentValue}&_labels=${changes["labels"].currentValue}&_format=${changes["format"].currentValue}&locale=vi&lvtk=${this._user.token}`;
    
    // if(this._user.administrator || this._user.functionAdmin) this.src +='&isAdmin=true';
    // this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    // }

  }
}
