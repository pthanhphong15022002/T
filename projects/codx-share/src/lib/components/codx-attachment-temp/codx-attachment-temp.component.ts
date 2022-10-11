import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService, CallFuncService } from 'codx-core';

@Component({
  selector: 'codx-attachment-temp',
  templateUrl: './codx-attachment-temp.component.html',
  styleUrls: ['./codx-attachment-temp.component.css']
})
export class CodxAttachmentTempComponent implements OnInit {

  @Input() objectID:string = "";
  services:string = "";
  assamplyName:string = "ERM.Business.";
  className:string = "";
  entityName:string = ""
  lstData:any[] = [];
  countData:number = 0;
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private callFC:CallFuncService
  ) { }

  ngOnInit(): void 
  {
    
  }

}
