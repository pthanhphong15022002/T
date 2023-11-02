import { ChangeDetectionStrategy, Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';
import { Subject, map } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-journals-add-idimcontrol',
  templateUrl: './journals-add-idimcontrol.component.html',
  styleUrls: ['./journals-add-idimcontrol.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalsAddIdimcontrolComponent extends UIComponent {
  //#region Constructor
  dialog!: DialogRef; 
  dialogData?: any;
  headerText:any;
  lsselectidimcontrol:any;
  showAll:any;
  //arridimControl:any = ['0','1','2','3','4','5','6','7','8','9'];
  vllAC069:any;
  visibleIdimControls:any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.lsselectidimcontrol = [...dialogData.data?.lsselectidimcontrol];
    this.showAll = dialogData.data?.showAll;
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '15%', '38%');
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        map((arr) => arr.filter((f) => f.category === '1')?.[0]),
        map((data) => JSON.parse(data.dataValue)?.IDIMControl?.split(';')),
      )
      .subscribe((settingIdimControls) => {
        this.cache
          .valueList('AC069')
          .pipe(
            map((data) =>
              data.datas
                .filter((d) =>
                  this.showAll ? true : settingIdimControls?.includes(d.value)
                )
                .map((d) => ({
                  value: d.value,
                  text: d.text,
                  checked: this.lsselectidimcontrol?.includes(d.value),
                }))
            )
          )
          .subscribe((res) => {
            this.visibleIdimControls = res;
            this.detectorRef.detectChanges();
          });
      });
  }

  ngAfterViewInit() {}

  ngDocheck(){
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Method
  onSave(){
    this.lsselectidimcontrol.sort((a,b) => a-b);
    this.dialog.close(this.lsselectidimcontrol.join(';'));
  }
  //#endregion Method

  //#region Event
  valueChange(event,value){
    let index;
    if (event?.data) {
      index = this.lsselectidimcontrol.findIndex(x => x == value);
      if (index == -1) {
        this.lsselectidimcontrol.push(value);
      }
    }else{
      index = this.lsselectidimcontrol.findIndex(x => x == value);
      if (index > -1) {
        this.lsselectidimcontrol.splice(index, 1);
      }
    }
  }
  //#endregion Event
}
