import { Component, OnInit, Optional } from '@angular/core';
import { ButtonModel, CodxService, DialogData, DialogRef, ViewModel, ViewType } from 'codx-core';
import { CodxWsService } from '../codx-ws.service';

@Component({
  selector: 'lib-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss']
})
export class BookmarkComponent implements OnInit{
  type:any;
  dialog:any;
  listGroup:any;
  listBookMarks:any;
  listBookMark:any;
  viewList: Array<ViewModel> = [];
  fMoreFuncs: ButtonModel[];
  index = "All";
  imgDefault = "assets/themes/ws/default/img/Report_Empty.svg";
  constructor(
    private codxService: CodxService,
    private codxWsService: CodxWsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) 
  {
    this.dialog = dialog;
    this.type = data?.data?.type;
    this.listGroup = data?.data?.listGroup;
    this.listBookMarks = data?.data?.listBookMarks;
    this.listBookMark = JSON.parse(JSON.stringify(this.listBookMarks));
  }
  ngOnInit(): void {
    this.viewList = 
    [
      {
        id: '1',
        type: ViewType.card,
        active: true,
        sameData: true,
      },
      // {
      //   id: '2',
      //   type: ViewType.list,
      //   active: false,
      //   sameData: true,
      // },
    ];

    this.fMoreFuncs = [
      {
        id: 'id-select-multi',
        formName: 'System',
        text: 'Chọn nhiều dòng',
        disabled: false,
      },
      // {
      //   id: 'id-refresh',
      //   formName: 'System',
      //   text: 'Làm mới',
      //   disabled: true,
      // },
      {
        id: 'id-codx-open-setting',
        formName: 'System',
        text: 'Thiết lập',
        disabled: false,
      },
    ];
  }
  selectedGroup(data:any)
  {
    this.index = data?.functionID;
    if(this.index == "All") this.listBookMark = JSON.parse(JSON.stringify(this.listBookMarks));
    else this.listBookMark = JSON.parse(JSON.stringify(this.listBookMarks.filter(x=>x.moduleID == this.index)));
  }
  selectedChange(data:any)
  {
    this.dialog.close();
    if(this.type == "R") this.codxService.navigate("","/ws/report/detail/"+data.recID);
    else  this.codxService.navigate("","/ws/"+data.moduleID.toLowerCase()+"/dashboard/"+data.reportID);
    this.codxWsService.functionID = data.reportID;
    data.functionID = data.reportID;
    this.codxWsService.listBreadCumb.push(data);
  }

  onSearch(e:any)
  {

  }
  
  viewChanged(e:any)
  {

  }
  
  sortChanged(e:any)
  {

  }

  clickToolbarMore(e:any)
  {

  }
}
