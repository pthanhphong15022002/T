import { Component, Input, OnInit } from '@angular/core';
import { CacheService, CallFuncService, SidebarModel, FormModel, DialogModel } from 'codx-core';
import { OKRs } from '../../model/okr.model';
import { PopupAddKRComponent } from '../../popup/popup-add-kr/popup-add-kr.component';
import { PopupShowKRComponent } from '../../popup/popup-show-kr/popup-show-kr.component';
import { OkrEditComponent } from '../okr-edit/okr-edit.component';

@Component({
  selector: 'lib-okr-targets',
  templateUrl: './okr-targets.component.html',
  styleUrls: ['./okr-targets.component.css']
})
export class OkrTargetsComponent implements OnInit {

  @Input() dataOKR : any;
  @Input() formModel : any;
  @Input() gridView:any;
  dtStatus = [];
  openAccordion = [];

  formModelKR= new FormModel();

  constructor(
    private callfunc: CallFuncService,
    private cache : CacheService
  ) { }

  ngOnInit(): void {
    this.cache.valueList('OM002').subscribe(item=>{
      if(item?.datas) this.dtStatus = item?.datas;
    })
    // Tạo FormModel cho OKRs
    this.formModelKR.entityName="OM_OKRs";
    this.formModelKR.gridViewName="grvOKRs";
    this.formModelKR.formName="OKRs";
    this.formModelKR.entityPer="OM_OKRs"
  }
  //Lấy danh sách kr của mục tiêu
  getItemOKR(i:any,recID:any)
  {
    this.openAccordion[i] = !this.openAccordion[i];
    // if(this.dataOKR[i].child && this.dataOKR[i].child.length<=0)
    //   this.okrService.getKRByOKR(recID).subscribe((item:any)=>{
    //     if(item) this.dataOKR[i].child = item
    //   });
  }

  clickMF(e:any)
  {
    var funcID = e?.functionID;
    switch(funcID)
    {
      case 'SYS03':
      {
        let dialog = this.callfunc.openSide(
          OkrEditComponent,
          [
            this.gridView
          ]
        );
        break;
      }
    }
  }
  // Thêm/sửa  KR
  addKR(o:any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.formModel;

    let dialogKR= this.callfunc.openSide(
      PopupAddKRComponent,
      [null,o,this.formModelKR,true,'Thêm mới kết quả chính'],
      option
    );
  }

  editKR(kr:any,o:any,popupTitle:any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.formModel;

    let dialogKR= this.callfunc.openSide(
      PopupAddKRComponent,
      [kr,o,this.formModelKR,false,popupTitle],
      option
    );
  }

  clickKRMF(e:any,kr:any,o:any)
  {
    let popupTitle= e.text + ' kết quả chính';
    var funcID = e?.functionID;
    switch(funcID)
    {
      case 'SYS03':
      {
        this.editKR(kr,o,popupTitle);
        break;
      }
      
    }
  }

  //Xem chi tiết KR
  showKR(kr:any, o:any){
    var dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    let dialog = this.callfunc.openForm(
      PopupShowKRComponent,
      '',
      null,
      null,
      null,
      [],
      '',
      dialogModel
    );
    
  }
}
