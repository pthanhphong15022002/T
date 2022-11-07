import { Component, OnInit } from '@angular/core';
import { FileService } from '@shared/services/file.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'codx-view-flowchart',
  templateUrl: './view-flowchart.component.html',
  styleUrls: ['./view-flowchart.component.css'],
})
export class ViewFlowchartComponent implements OnInit {
  data: any;
  linkFile : any
  isShow = true;
  constructor(private fileService: FileService) {
    this.getImg(''); //test
  }

  ngOnInit(): void {}
  getImg(recID) {
    this.fileService.getFile('636341e8e82afdc6f9a4ab54').subscribe((data) => {
      if (data) {
        this.data = data;
        this.linkFile = environment.urlUpload+"/"+this.data?.pathDisk;
      }
    });
  }
  print() {}
  download() {}
}
