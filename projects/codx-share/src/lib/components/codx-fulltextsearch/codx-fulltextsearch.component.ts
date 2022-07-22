import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, Optional, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ViewModel } from 'codx-core';
@Component({
  selector: 'codx-fulltextsearch',
  templateUrl: './codx-fulltextsearch.component.html',
  styleUrls: ['./codx-fulltextsearch.component.scss']
})

export class CodxFullTextSearch implements OnInit , OnChanges {
    views: Array<ViewModel> | any = [];
    @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  constructor(  
    private changeDetectRef: ChangeDetectorRef
  ) 
  { 

  }
  ngOnInit(): void {
    alert("bn");
  }
  ngOnChanges(changes: SimpleChanges): void {
  }
  ngAfterViewInit(): void {
    this.views = [{
        id: '1',
        type: 'content',
        active: true,
        model: {
          panelLeftRef: this.panelLeftRef,
          widthAsideRight: '500px'
        }
      }];
      this.changeDetectRef.detectChanges();
  }
}
