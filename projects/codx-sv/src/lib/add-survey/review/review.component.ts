import { ChangeDetectorRef } from '@angular/core';
import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import {
  MultiSelectService,
  RteService,
} from '@syncfusion/ej2-angular-inplace-editor';
import {
  RichTextEditorModel,
} from '@syncfusion/ej2-angular-richtexteditor';
import { AuthService, UIComponent } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxSvService } from '../../codx-sv.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [RteService, MultiSelectService],
})
export class ReviewComponent extends UIComponent implements OnInit {
  questions: any = [];
  functionList: any;
  recID: any;
  funcID: any;
  lstEditIV: any = [];
  REFER_TYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  formModel: any;
  amountOfRow = 0;
  itemSession: any;
  itemSessionFirst: any;
  user: any;
  empty = '';
  public titleEditorModel: RichTextEditorModel = {
    toolbarSettings: {
      enableFloating: false,
      items: ['Bold', 'Italic', 'Underline', 'ClearFormat', 'CreateLink'],
    },
  };
  public descriptionEditorModel: RichTextEditorModel = {
    toolbarSettings: {
      enableFloating: false,
      items: [
        'Bold',
        'Italic',
        'Underline',
        'ClearFormat',
        'CreateLink',
        'NumberFormatList',
        'BulletFormatList',
      ],
    },
  };

  constructor(
    private injector: Injector,
    private SVServices: CodxSvService,
    private change: ChangeDetectorRef,
    private auth: AuthService
  ) {
    super(injector);
    let data: any = this.auth.user$;
    this.user = data.source.value;
    this.router.queryParams.subscribe((queryParams) => {
      if (queryParams?.funcID) {
        this.funcID = queryParams.funcID;
        this.cache.functionList(this.funcID).subscribe((res) => {
          if (res) {
            this.functionList = res;
            if (queryParams?.recID) {
              this.recID = queryParams.recID;
            }
            this.loadData();
          }
        });
      }
    });
  }

  onInit(): void {
    this.SVServices.getFormModel(this.funcID).then((res) => {
      if (res) this.formModel = res;
    });
  }

  loadData() {
    this.questions = null;
    this.api
      .exec('ERM.Business.SV', 'QuestionsBusiness', 'GetByRecIDAsync', [
        this.recID,
      ])
      .subscribe((res: any) => {
        if (res[0] && res[0].length > 0) {
          this.questions = this.getHierarchy(res[0], res[1]);
          this.itemSession = JSON.parse(JSON.stringify(this.questions[0]));
          this.itemSessionFirst = JSON.parse(JSON.stringify(this.questions[0]));
          this.SVServices.getFilesByObjectType(
            this.functionList.entityName
          ).subscribe((res: any) => {
            if (res) {
              res.forEach((x) => {
                if (x.referType == this.REFER_TYPE.VIDEO)
                  x['srcVideo'] = `${environment.urlUpload}/${x.pathDisk}`;
              });
              this.lstEditIV = res;
            }
            console.log('check lstFile', this.lstEditIV);
            console.log('check this.questions', this.questions);
          });
        }
      });
  }

  getHierarchy(dataSession, dataQuestion) {
    var dataTemp = JSON.parse(JSON.stringify(dataSession));
    dataTemp.forEach((res) => {
      res['children'] = [];
      dataQuestion.forEach((x) => {
        if (x.parentID == res.recID) {
          res['children'].push(x);
        }
      });
    });
    return dataTemp;
  }

  public focusIn(target: HTMLElement): void {
    target.parentElement.classList.add('e-input-focus');
  }

  public focusOut(target: HTMLElement): void {
    target.parentElement.classList.remove('e-input-focus');
  }

  getSrcImage(data) {
    return (data['srcImage'] = `${environment.urlUpload}/${
      data.urlPath ? data.urlPath : data.pathDisk
    }`);
  }

  filterDataColumn(data) {
    data = data.filter((x) => x.isColumn);
    return data;
  }

  filterDataRow(data) {
    data = data.filter((x) => !x.isColumn);
    return data;
  }

  getUrlImageOfVideo(ID) {
    var url = `https://img.youtube.com/vi/${ID}/hqdefault.jpg`;
    return url;
  }

  continue(pageNum) {
    let html = document.getElementById('page-questions');
    html.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    this.itemSession = this.questions[pageNum];
    this.change.detectChanges();
  }

  back(pageNum) {
    this.itemSession = this.questions[pageNum];
    this.change.detectChanges();
  }

  onSubmit() {}
}
