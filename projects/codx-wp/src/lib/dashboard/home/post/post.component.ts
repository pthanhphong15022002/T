import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LIST_TYPE } from '@syncfusion/ej2-angular-richtexteditor';
import { Thickness } from '@syncfusion/ej2-charts';
import { ViewModel, ViewsComponent, ViewType } from 'codx-core';

@Component({
  selector: 'wp-lib-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit,AfterViewInit {
  views: Array<ViewModel> | any = [];
  @ViewChild("content") content : TemplateRef<any>;
  constructor(
    private dt:ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        model: {
          panelLeftRef: this.content
        }
      },
    ];
    this.dt.detectChanges();
  }

  ngOnInit(): void {
    console.log("call")
  }

}
