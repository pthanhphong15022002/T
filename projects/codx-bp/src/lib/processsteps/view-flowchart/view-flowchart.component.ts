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
  implements OnInit, AfterViewInit,OnChanges
{
  @Input() dataFile: any;
  data: any;
  linkFile: any;
  isShow = true;
  heightFlowChart = 600;

  pzProperties = {
    zoomControlScale: 2,
    minScale: 2,
    limitPan: true,
    wheelZoomFactor: 1,
  };
  constructor(
    private fileService: FileService,
    private notificationsService: NotificationsService,
    private changeRef : ChangeDetectorRef
  ) {
    // if (this.dataFile) {
    //   this.data = this.dataFile;
    //   this.linkFile = environment.urlUpload + '/' + this.data?.pathDisk;
    //   //this.heightFlowChart = screen.height;
    // }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataFile) {
      this.data = this.dataFile;
      this.linkFile = environment.urlUpload + '/' + this.data?.pathDisk;
      this.changeRef.detectChanges()
    }
  }
  ngAfterViewInit(): void {   
  }

  ngOnInit(): void {
  }
}
