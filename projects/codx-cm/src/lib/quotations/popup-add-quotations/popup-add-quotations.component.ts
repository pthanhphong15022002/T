import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CodxFormComponent, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-quotations',
  templateUrl: './popup-add-quotations.component.html',
  styleUrls: ['./popup-add-quotations.component.css']
})
export class PopupAddQuotationsComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  quotations :any
  dialog: DialogRef;
  headerText ='Thêm form test'
  
  constructor(public sanitizer: DomSanitizer) { 
    
  }

  ngOnInit(): void {
  }

  onSave(){

  }
}
