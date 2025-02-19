import { TemplateRef } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Injector,
  ViewEncapsulation,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  CallFuncService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
// import _ from 'lodash';
import { environment } from 'src/environments/environment';
import { EditPatternComponent } from './edit-pattern/edit-pattern.component';
import { PatternService } from './pattern.service';

@Component({
  selector: 'app-pattern',
  templateUrl: './pattern.component.html',
  styleUrls: ['./pattern.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PatternComponent extends UIComponent implements OnInit {
  @Input() type: string;

  reload = false;
  lstPattern = null;
  dialog: any;
  views: Array<ViewModel> = [];
  functionList: any;
  lstFile: any = new Array();
  REFER_TYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  environment = environment;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  dataService: CRUDService;
  date = new Date();
  constructor(
    private change: ChangeDetectorRef,
    private patternSV: PatternService,
    private injector: Injector,
    private callfunc: CallFuncService
  ) {
    super(injector);
    this.dataService = new CRUDService(injector);
    this.dataService.service = 'FD';
    this.cache.functionList('FDS026').subscribe((res) => {
      if (res) {
        this.functionList = res;
        this.dataService.request.entityName = res.entityName;
        this.dataService.request.funcID = 'FDS026';
      }
    });
    this.getCardType('FDS026');
    this.router.params.subscribe((params) => {
      if (params.funcID) this.funcID = params.funcID;
    });
  }

  onInit(): void {
    this.LoadData();
  }

  ngAfterViewInit() {
    this.patternSV.component = this;
    // this.views = [
    //   {
    //     active: true,
    //     type: ViewType.content,
    //     sameData: true,
    //     model: {
    //       panelLeftRef: this.panelLeftRef,
    //     },
    //   },
    // ];
    this.detectorRef.detectChanges();
  }

  LoadData() {
    this.api
      .execSv(
        'FD',
        'ERM.Business.FD',
        'PatternsBusiness',
        'GetCardTypeAsync',
        this.type
      )
      .subscribe((res) => {
        if (res) {
          this.lstPattern = res;
          this.lstPattern.push({});
          //this.change.detectChanges();
        }
      });
  }

  reLoadData(data) {
    this.reload = true;
    if (data.isDefault) {
      var arr = [];
      this.lstPattern.filter(function (element, index) {
        if (element['isDefault'] === true) element.isDefault = false;
        arr.push(element);
        return arr;
      });
      this.lstPattern = [...arr];
    }
    if (data.cardType != this.type) {
      this.lstPattern = (this.lstPattern as any[]).filter(
        (x) => x.recID != data.recID
      );
      //_.remove(this.lstPattern, { recID: data.recID });
    } else {
      if (this.patternSV.indexEdit > -1)
        this.lstPattern[this.patternSV.indexEdit] = data;
      else {
        this.lstPattern[this.lstPattern.length - 1] = data;
        this.lstPattern.push({});
      }
    }
    this.change.detectChanges();
  }

  reloadChanged(e) {
    this.reload = e;
  }
  trackByfn(index, item) {
    return item.patternID + item.modifiedOn;
  }

  getCardType(funcID) {
    switch (funcID) {
      case 'FDS011':
        this.type = '1';
        break;
      case 'FDS012':
        this.type = '2';
        break;
      case 'FDS013':
        this.type = '3';
        break;
      case 'FDS014':
        this.type = '4';
        break;
      case 'FDS015':
        this.type = '5';
        break;
      case 'FDS016':
        this.type = '6';
        break;
      case 'FDS017':
        this.type = '7';
        break;
    }
  }

  openFormAdd() {
    var obj = {
      formType: 'add',
      dataUpdate: '',
      dataAdd: null,
      formModel: this.functionList,
      funcID: this.funcID,
    };
    let option = new SidebarModel();
    option.DataService = this.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = 'Auto';
    this.dataService.addNew().subscribe((res: any) => {
      res.cardType = this.type;
      obj.dataAdd = res;
      this.dataService.addDatas.clear();
      this.dataService.addDatas.set(res._uuid, res);
      var dialog = this.callfunc.openSide(EditPatternComponent, obj, option);
      dialog.closed.subscribe((e) => {
        if (e?.event?.data?.save) {
          this.lstPattern.splice(this.lstPattern.length - 1, 1);
          this.change.detectChanges();
          this.lstPattern.push(e.event?.data?.save);
          this.lstPattern.push({});
          if (e.event.data.save.isDefault) {
            this.lstPattern.forEach((dt, index) => {
              if (dt.recID == e.event.data.save.recID)
                this.lstPattern[index].isDefault = true;
              else this.lstPattern[index].isDefault = false;
            });
          }
          this.change.detectChanges();
          //var data = e?.event?.data?.save;
          //this.view.dataService.update(data).subscribe();
        }
        this.dataService.clear();
      });
    });

    // this.view.dataService.addNew().subscribe((res: any) => {
    //   let option = new SidebarModel();
    //   option.DataService = this.dataService;
    //   option.FormModel = this.view?.formModel;
    //   option.Width = 'Auto';
    //   var dialog = this.callfunc.openSide(EditPatternComponent, obj, option);
    //   dialog.closed.subscribe((e) => {
    //     if (e?.event?.data?.save) {
    //       this.lstPattern.splice(this.lstPattern.length - 1, 1);
    //       this.change.detectChanges();
    //       this.lstPattern.push(e.event?.data?.save);
    //       this.lstPattern.push({});
    //       if (e.event.data.save.isDefault) {
    //         this.lstPattern.forEach((dt, index) => {
    //           if (dt.recID == e.event.data.save.recID)
    //             this.lstPattern[index].isDefault = true;
    //           else this.lstPattern[index].isDefault = false;
    //         });
    //       }
    //       this.change.detectChanges();
    //       var data = e?.event?.data?.save;
    //       this.view.dataService.update(data).subscribe();
    //     }
    //     this.view.dataService.clear();
    //   });
    // });
    this.change.detectChanges();
  }

  openFormEdit(item = null) {
    var arr = new Array();
    // if (item) {
    //   this.view.dataService.dataSelected = item;
    // }
    var obj = {
      formType: 'edit',
      dataUpdate: item,
      formModel: this.functionList,
      funcID: this.funcID,
    };
    let option = new SidebarModel();
    this.dataService.updateDatas.set(item._uuid, item);
    option.DataService = this.dataService;
    option.FormModel = this.view?.formModel;
    option.Width = 'Auto';
    var dialog = this.callfunc.openSide(EditPatternComponent, obj, option);
    dialog.closed.subscribe((e) => {
      if (e?.event?.data.update) {
        this.date = new Date();
        this.lstPattern.forEach((dt, index) => {
          if (dt.recID == e.event.data.update.recID) {
            this.lstPattern.splice(index, 1);
            this.lstPattern.splice(index, 0, e.event.data.update);
            //this.lstPattern[index] = e.event.data.update;
            this.change.detectChanges();
          } else this.lstPattern[index].isDefault = false;
        });
        //var data = e?.event?.data?.update;
        //this.dataService.update(data).subscribe();
      }
      this.dataService.clear();
    });
    // this.view.dataService
    //   .edit(this.view.dataService.dataSelected)
    //   .subscribe((res: any) => {
    //     let option = new SidebarModel();
    //     option.DataService = this.dataService;
    //     option.FormModel = this.view?.formModel;
    //     option.Width = 'Auto';
    //     var dialog = this.callfunc.openSide(EditPatternComponent, obj, option);
    //     dialog.closed.subscribe((e) => {
    //       if (e?.event?.data.update) {
    //         this.lstPattern.forEach((dt, index) => {
    //           if (dt.recID == e.event.data.update.recID) {
    //             this.lstPattern[index] = e.event.data.update;
    //             this.change.detectChanges();
    //           } else this.lstPattern[index].isDefault = false;
    //         });
    //         var data = e?.event?.data?.update;
    //         this.view.dataService.update(data).subscribe();
    //       }
    //       this.view.dataService.clear();
    //     });
    //   });
    this.change.detectChanges();
  }

  delete(item, index) {
    // this.patternSV.deleteFile(item.recID).subscribe();
    // this.lstPattern.splice(index, 1);
    // this.view.dataService.dataSelected = item;
    this.dataService.delete([item]).subscribe((res: any) => {
      if (res.data) {
        this.patternSV.deleteFile(res.data.recID).subscribe();
        this.lstPattern.splice(index, 1);
      }
    });
    this.change.detectChanges();
  }
}
