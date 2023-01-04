import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { UIComponent } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxSvService } from '../../codx-sv.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  encapsulation: ViewEncapsulation.None,
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

  constructor(private injector: Injector, private SVServices: CodxSvService) {
    super(injector);
    this.router.queryParams.subscribe((queryParams) => {
      if (queryParams?.funcID) {
        this.funcID = queryParams.funcID;
        this.cache.functionList(this.funcID).subscribe((res) => {
          if (res) this.functionList = res;
        });
      }
      if (queryParams?.recID) {
        this.recID = queryParams.recID;
      }
      this.loadData();
    });
  }

  onInit(): void {}

  loadData() {
    this.questions = null;
    this.api
      .exec('ERM.Business.SV', 'QuestionsBusiness', 'GetByRecIDAsync', [
        this.recID,
      ])
      .subscribe((res: any) => {
        if (res[0] && res[0].length > 0) {
          this.questions = this.getHierarchy(res[0], res[1]);
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
}
