import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FileService } from '@shared/services/file.service';
import { NotificationsService } from 'codx-core';
import { environment } from 'src/environments/environment';
import { ToolbarService , PrintService } from '@syncfusion/ej2-angular-documenteditor'


@Component({
  selector: 'codx-view-flowchart',
  templateUrl: './view-flowchart.component.html',
  styleUrls: ['./view-flowchart.component.css'],
  providers:[ToolbarService , PrintService]
})
export class ViewFlowchartComponent implements OnInit,OnChanges {
  @Input() dataFile: any;
  data: any;
  linkFile : any
  isShow = true; 
  heightFlowChart = 600 ;

  pzProperties = {
    zoomControlScale: 2,
    minScale: 2,
    limitPan: true,
    wheelZoomFactor: 1
  };
  constructor(private fileService: FileService, private notificationsService : NotificationsService) {
    if(this.dataFile){
      this.data = this.dataFile ;
      this.linkFile = environment.urlUpload+"/"+this.data?.pathDisk;
      this.heightFlowChart = screen.height 
    }
    // else
    //  this.getImg(''); //test
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.dataFile){
      this.data = this.dataFile ;
      this.linkFile = environment.urlUpload+"/"+this.data?.pathDisk;
    }
  }

  ngOnInit(): void {}
 
  // getImg(recID) {
  //   this.fileService.getFile('636341e8e82afdc6f9a4ab54').subscribe((data) => {
  //     if (data) {
  //       this.data = data;
  //       this.linkFile = environment.urlUpload+"/"+this.data?.pathDisk;
  //     }
  //   });
  // }
 
  print() {
    if (this.linkFile) 
    {
     const output = document.getElementById("output");
     const img = document.createElement("img");
     img.src = this.linkFile;
     output.appendChild(img);        
     const br = document.createElement("br");
     output.appendChild(br);
     window.print();

     document.body.removeChild(output);
    }
    else 
      window.frames[0].postMessage(JSON.stringify({ 'MessageId': 'Action_Print' }), '*');
      
   }

   checkDownloadRight() {
    return this.data.download;
  }
   async download(): Promise<void> {
    var id = this.data?.recID;
    var fullName = this.data.fileName;
    var that = this;
    
    if (this.checkDownloadRight()) {   
      ///lấy hàm của chung dang fail
      this.fileService.downloadFile(id).subscribe(async res => {
        if (res) {                   
          let blob = await fetch(res).then(r => r.blob());                
          let url = window.URL.createObjectURL(blob);
          var link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", fullName);
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    }
    else {
      this.notificationsService.notifyCode("SYS018");
    }
  }

}
