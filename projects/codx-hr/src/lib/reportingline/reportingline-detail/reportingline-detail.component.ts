import { ChangeDetectorRef, Component, Input, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { getUid, tab } from '@syncfusion/ej2-angular-grids';
import { ApiHttpService, CacheService, CallFuncService, CRUDService, DialogData, DialogModel, DialogRef, NotificationsService, Util } from 'codx-core';
import { CodxCompetencesComponent } from 'projects/codx-share/src/lib/components/codx-competences/codx-competences.component';

@Component({
  selector: 'lib-reportingline-detail',
  templateUrl: './reportingline-detail.component.html',
  styleUrls: ['./reportingline-detail.component.css']
})
export class ReportinglineDetailComponent implements OnInit {

  @ViewChild("tmpEditCompetence") tmpEditCompetence:TemplateRef<any>;
  dialogData:any;
  dialogRef:DialogRef = null;
  title:string = "Chi tiết"
  data:any = null;
  tabSelected = 1;
  competences:any[] = [];
  parameter:any = null;
  valueX:object = {valueType: 'competeneName'};
  valueY:object = {
    minimum: 0, maximum: 10
  };
  isShowCBB = false;
  isShowCBBPopup = false
  width:number = 720;
  height:number = window.innerHeight;
  messageNoti:string = "";
  constructor(
    private api:ApiHttpService,
    private notifySV:NotificationsService,
    private callFC:CallFuncService,
    private cache:CacheService,
    private dt:ChangeDetectorRef,
    @Optional() dialogData?:DialogData,
    @Optional() dialogRef?:DialogRef
  ) 
  {
    this.data = dialogData.data;
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {
    this.getPositonInfoByID(this.data.positionID);
    this.getParameterAsync("HRParameters","1");
    this.getMessageNoti("SYS031");
  }

  getPositonInfoByID(positionID:string){
    if(positionID){
      this.api.execSv("HR",
      "ERM.Business.HR",
      "PositionsBusiness",
      "GetPositionByIDAsync",
      [positionID])
      .subscribe((res:any) =>{
        if(res)
        {
          this.data = res;
          console.log(res);
        }
      });
    }
  }

  getJobCompetencesByPositionID(positionID:string,parentName:string){
    if(positionID && parentName){
      this.api.execSv(
        "HR",
        "ERM.Business.HR",
        "JobsBusiness",
        "GetJobCompetencesByPositionIDAsync",
        [positionID,parentName])
        .subscribe((res:any) => {
        if(res){
          this.competences = res;
          this.dt.detectChanges();
        }
      })
    }
  }

  
  getParameterAsync(formName:string,category:string)
  {
    if(!formName || !category) return;
    this.api.execSv("SYS",
    "ERM.Business.SYS",
    "SettingValuesBusiness",
    "GetParameterAsync",
    [formName,category]).
    subscribe((res:any) => {
      if(res)
      {
        this.parameter = JSON.parse(res); 
        this.dt.detectChanges();
      }
    });
  }

  clickClosePopup(){
    this.dialogRef.close();
  }

  selectTab(tabIndex:number)
  {
    if(!tabIndex){
      this.tabSelected = 1;
      return;
    }
    else
    {
      if(tabIndex == 2)
      {

        this.getJobCompetencesByPositionID(this.data.positionID,"Positions");
      }
      this.tabSelected = tabIndex;
      this.dt.detectChanges();

    }
  }
  
  clickEditTop(){

  }

  clickEditBottom(){
    if(this.tabSelected == 2){
      var model = new DialogModel();
      var data = {
        positionID: this.data.positionID,
        competences: this.competences,
        parameter:this.parameter
      }
      let popup = this.callFC.openForm(CodxCompetencesComponent, '', 500, this.height, '', data, "", model);
      popup.closed.subscribe((res:any) => {
        if(res && res?.event){
          this.competences = res.event;
        }
      });  
    }
  }

  clickOpenCBB()
  {
    this.isShowCBB =  !this.isShowCBB ;
  }

  clickInsertCompetences(event){
    if(event && event?.dataSelected){
      let dataSelected = event.dataSelected;
      let dataInsert = [];
      if(this.competences && this.competences.length > 0)
      {
        dataSelected.map((e:any) =>{
          let isExsit = this.competences.find((x:any) => x.competenceID == e.CompetenceID );
          if(isExsit){
            let message = Util.stringFormat(this.messageNoti,isExsit.competenceName);
            this.notifySV.notify(message,"2");
          }
          else{
            let compentence = {
              RecID: Guid.newGuid(),
              CompetenceID: e.CompetenceID,
              CompetenceName: e.CompetenceName,
              PositionID: this.data.positionID,
              ParentName: "Positions", 
              Rating: "0"
            }
            dataInsert.push(compentence);
          }
        });
      }
      else{
        dataSelected.map((e:any) => {
            let compentence = {
            RecID: Guid.newGuid(),
            CompetenceID: e.CompetenceID,
            CompetenceName: e.CompetenceName,
            PositionID: this.data.positionID,
            ParentName: "Positions", 
            Rating: "0"
          }
          dataInsert.push(compentence);
        });
      }
      if(dataInsert.length > 0){
        this.api.execSv(
          "HR",
          "ERM.Business.HR",
          "PositionsBusiness",
          "InsertCompetencesAsync",
          [this.data.positionID,dataInsert]
        ).subscribe((res:any) =>{
          if(res)
          {
            this.competences = this.competences.concat(res);
            console.log(this.competences);
            this.dt.detectChanges();
            this.notifySV.notifyCode("SYS006");
          }
        });
      }
    }
  }  

  getMessageNoti(mssgCode:string){
    if(mssgCode){
      this.cache.message(mssgCode).subscribe((mssg:any) =>{
        if(mssg && mssg.defaultName){
          this.messageNoti = mssg.defaultName;
        }
      });
    }
  }
}

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
