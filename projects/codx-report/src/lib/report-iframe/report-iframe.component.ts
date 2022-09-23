import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AuthStore } from "codx-core";

@Component({
  selector: 'report-iframe',
  templateUrl: './report-iframe.component.html',
  styleUrls: ['./report-iframe.component.scss'],
})
export class CodxReportIframeComponent implements OnInit, AfterViewInit,OnChanges {
  @Input() funcID: any;
  @Input() predicates: any = "";
  @Input() dataValues: any = "";
  @Input() print: boolean = false;

  private _preArray:any;
  private _user:any;
  urlSafe: any;
  src: string;
  constructor(
    private authStore: AuthStore,
    public sanitizer: DomSanitizer
  ){
    this._user = this.authStore.get();
  }
  ngOnInit(): void {
    this._preArray = this.predicates.split('&&').join(';');
    this.src = `/${this._user.tenant}/report?reportID=${this.funcID}&predicates=${this._preArray}&dataValues=${this.dataValues}&print=${this.print}`;
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
  }
  ngAfterViewInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {
    this._preArray = this.predicates.split('&&').join(';');
    this.src = `/${this._user.tenant}/report?reportID=${this.funcID}&predicates=${this._preArray}&dataValues=${this.dataValues}&print=${this.print}`;
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
  }
}
