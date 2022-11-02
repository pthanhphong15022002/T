import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';

@Component({
  selector: 'lib-codx-competences',
  templateUrl: './codx-competences.component.html',
  styleUrls: ['./codx-competences.component.css']
})
export class CodxCompetencesComponent implements OnInit {

  dialogData:any = null;
  dialogRef:DialogRef = null;
  positionID:string = "";
  competences:any[] = [];
  parameter:any = null;
  isShowCBB:boolean = false;
  messageNoti:string = "";
  width:number = 720;
  height:number = window.innerHeight;
  constructor(
    private api:ApiHttpService,
    private notifySV : NotificationsService,
    private cache:CacheService,
    private dt:ChangeDetectorRef,
    @Optional() dialog?: DialogData,
    @Optional() dialogRef?: DialogRef

  ) 
  {
    this.dialogRef = dialogRef;
    this.dialogData = dialog?.data;
    this.positionID = this.dialogData?.positionID;
    this.competences = JSON.parse(JSON.stringify(this.dialogData.competences));
    this.parameter = this.dialogData.parameter;
  }

  ngOnInit(): void {
    this.getMessageNoti("SYS031");

  }

  clickClose(){
    this.dialogRef.close();
  }

  valueSliderChange(value:any,competence:any){
    if(competence)
    {
      this.competences.forEach((e:any) => {
        if(e.competenceID == competence.competenceID)
        {
          e.rating = value;
          return;
        }
      });
      this.dt.detectChanges();
    }
  }

  clickOpenCBBPopup(){
    this.isShowCBB = !this.isShowCBB;
  }

  cbbClickSave(event){
    if(event && event?.dataSelected){
      let dataSelected = event.dataSelected;
      if(this.competences && this.competences.length > 0)
      {
        dataSelected.map((e:any) =>{
          let isExsit = this.competences.find((x:any) => x.competenceID == e.CompetenceID );
          if(isExsit){
            let message = Util.stringFormat(this.messageNoti,isExsit.competenceName);
            this.notifySV.notify(message,"2");
          }
          else
          {
            let compentence = {
              recID: Guid.newGuid(),
              competenceID: e.CompetenceID,
              competenceName: e.CompetenceName,
              positionID: this.positionID,
              parentName: "Positions", 
              rating: "0"
            }
            this.competences.push(compentence);
          }
        });
      }
      else
      {
        dataSelected.map((e:any) => {
          let compentence = {
            recID: Guid.newGuid(),
            competenceID: e.CompetenceID,
            competenceName: e.CompetenceName,
            positionID: this.positionID,
            parentName: "Positions", 
            rating: "0"
          };
          this.competences.push(compentence);
        });
      }
      this.dt.detectChanges();
    }
  }

  clickSave(){
    if(this.positionID && this.competences.length > 0)
    {
      this.api.execSv(
        "HR",
        "ERM.Business.HR",
        "PositionsBusiness",
        "UpdateCompetencesAsync",
        [this.positionID,this.competences]
        ).subscribe((res:any) => {
          if(res){
            this.notifySV.notifyCode("SYS007");
            this.dialogRef.close(this.competences);
          }
          else
          {
            this.notifySV.notifyCode("SYS021");
          }
        });
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
