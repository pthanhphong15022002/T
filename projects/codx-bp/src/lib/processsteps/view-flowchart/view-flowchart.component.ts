import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FileService } from '@shared/services/file.service';
import { NotificationsService } from 'codx-core';
import { environment } from 'src/environments/environment';
import {
  ToolbarService,
  PrintService,
} from '@syncfusion/ej2-angular-documenteditor';

@Component({
  selector: 'codx-view-flowchart',
  templateUrl: './view-flowchart.component.html',
  styleUrls: ['./view-flowchart.component.css'],
  providers: [ToolbarService, PrintService],
})
export class ViewFlowchartComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() dataFile: any;
  heightFlowChart = 600;
  data: any;
  linkFile: any;
  isShow = true;
   
  // pzProperties = {
  //   zoomControlScale: 2,
  //   minScale: 2,
  //   limitPan: true,
  //   wheelZoomFactor: 1,
  // };
  constructor(
    private fileService: FileService,
    private notificationsService: NotificationsService,
    private changeRef: ChangeDetectorRef
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataFile) {
      this.data = this.dataFile;
      this.linkFile = environment.urlUpload + '/' + this.data?.pathDisk;
      this.changeRef.detectChanges();
    }
  }
  ngAfterViewInit(): void {}

  ngOnInit(): void {
    let viewContent = document.getElementById('view-detail-processstep');
    let viewMenu = document.getElementById('menu-flowchart');
    this.heightFlowChart =
      viewContent.offsetHeight - viewMenu.offsetHeight - 100;
    this.changeRef.detectChanges();
  }

  //chu thich
  // [transition-duration]="500" do tre
  ///[limit-zoom]="2" lan chuot
  //[auto-zoom-out]="true" khoi phuc sau khi click 2 ngon tay [draggableImage]="true"//dùng lia đủ chỗ
}
