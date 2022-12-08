import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  AuthService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { ChartData } from '../../model/chart.model';
import { PopupCheckInComponent } from '../popup-check-in/popup-check-in.component';


@Component({
  selector: 'popup-show-kr',
  templateUrl: 'popup-show-kr.component.html',
  styleUrls: ['popup-show-kr.component.scss'],
})
export class PopupShowKRComponent extends UIComponent implements AfterViewInit {
  
  views: Array<ViewModel> | any = [];
  @ViewChild('checkin') checkin: TemplateRef<any>;
  @ViewChild('alignKR') alignKR: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;
  dtStatus:any;
  dataOKR=[];
  openAccordion = [];
  dataKR:any;
  loremArr=[1,2,3,4];
  chartData: ChartData = {
    title: '15 Objectives',
    primaryXAxis: {
      valueType: 'Category',
      majorGridLines: { width: 0 },
      edgeLabelPlacement: 'Shift',
    },
    primaryYAxis: {
      minimum: 0,
      maximum: 100,
      interval: 10,
    },
    seriesSetting: [
      {
        type: 'Pie',
        xName: 'name',
        yName: 'value',
        innerRadius: '80%',
        radius: '70%',
        startAngle: 0,
        explodeIndex: 1,
        explodeOffset: '10%',
        explode: true,
        endAngle: 360,
        groupTo: '2',
        groupMode: 'Value',
        dataLabel: {
          name: 'text',
          visible: true,
          position: 'Inside',
          font: {
            fontWeight: '600',
          },
        },
      },
    ],
    service: 'OM',
    assembly: 'ERM.Business.OM',
    className: 'OKRBusiness',
    method: 'GetChartData1Async',
  };

  dialogCheckIn: DialogRef;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.headerText= "Xem chi tiết - Kết quả chính"//dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.formModel = dialogData.data[2];    
    this.dataOKR.push(dialogData.data[1]);
    this.dataKR=dialogData.data[0];
    
  }
  getItemOKR(i:any,recID:any)
  {
    this.openAccordion[i] = !this.openAccordion[i];
    // if(this.dataOKR[i].child && this.dataOKR[i].child.length<=0)
    //   this.okrService.getKRByOKR(recID).subscribe((item:any)=>{
    //     if(item) this.dataOKR[i].child = item
    //   });
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.alignKR,
          contextMenu: '',
        },
      },
    ];
  }

  onInit(): void {
    this.cache.valueList('OM002').subscribe(item=>{
      if(item?.datas) this.dtStatus = item?.datas;
    })
  }
  click(event: any) {
    switch (event) {
      
    }
  }
  //Check-in region
  checkIn(evt:any, kr:any){   

      this.dialogCheckIn = this.callfc.openForm(
        PopupCheckInComponent,'',800,500,"OMT01",
        [kr,this.formModel]          
      );
  }

  checkinSave(){

  }
  checkinCancel(){
    this.dialogCheckIn.close();
  }
  
  popupUploadFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileCount(evt:any){
    
  }

  fileAdded(evt:any){

  }
}
