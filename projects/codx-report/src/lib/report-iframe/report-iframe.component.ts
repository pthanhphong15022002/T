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
  private environment: any;
  private _preArray:any;
  private _user:any;
  urlSafe: any;
  src: string;

  constructor(
    private authStore: AuthStore,
    public sanitizer: DomSanitizer,
    @Optional() config?: EnvironmentConfig
  ){
    this.environment = config.environment;
    this._user = this.authStore.get();
  }
  ngOnInit(): void {
     this._preArray = this.predicates.split('&&').join(';');
    this.src = `${this.environment.reportUrl}?reportID=${this.funcID}&predicates=${this._preArray}&dataValues=${this.dataValues}&locale=vi&lvtk=${this._user.token}`;
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
  }
  ngAfterViewInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes["param"] &&changes["param"].currentValue){
      this.src = `${this.environment.reportUrl}?reportID=${this.funcID}&_param=${changes["param"].currentValue}&locale=vi&lvtk=${this._user.token}`;
      this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    }
    else{
    this._preArray = this.predicates.split('&&').join(';');
    this.src = `${this.environment.reportUrl}?reportID=${this.funcID}&predicates=${this._preArray}&dataValues=${this.dataValues}&locale=vi&lvtk=${this._user.token}`;
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
    }
  }
}
