import { Component, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { CallFuncService, DialogData, DialogRef } from 'codx-core';
import { environment } from 'src/environments/environment';
import { PopupViewFileComponent } from './popup-view-file/popup-view-file.component';

@Component({
  selector: 'app-view-file',
  templateUrl: './view-file.component.html',
  styleUrls: ['./view-file.component.scss']
})
export class ViewFileComponent implements OnInit , OnChanges{
 
  @Input() dataFile:any;
  @Input() questionID:any;
  constructor(
    private callfunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.dataFile && changes.dataFile?.previousValue != changes.dataFile?.currentValue)
    {
      this.dataFile = changes.dataFile?.currentValue;
      this.getDataFile();
    }
  }

  ngOnInit(): void {
    this.getDataFile();
  }
  
  getDataFile()
  {
    this.dataFile = this.dataFile.filter(x=>x.objectID == this.questionID);
  }
  
  getSrcImage(data) {
    if(data?.avatar) return data?.avatar
    return environment.urlUpload + "/" +data?.pathDisk;
  }

  openPopUpViewFile(index = 0)
  {
    this.callfunc.openForm(PopupViewFileComponent , "" , 1000,700 , "" , {dataFile:this.dataFile , selectedIndex : index})
  }
}
