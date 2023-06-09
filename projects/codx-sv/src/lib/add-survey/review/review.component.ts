import { I } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, HostBinding } from '@angular/core';
import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  MultiSelectService,
  RteService,
} from '@syncfusion/ej2-angular-inplace-editor';
import { RichTextEditorModel } from '@syncfusion/ej2-angular-richtexteditor';
import { AuthService, AuthStore, UIComponent } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxSvService } from '../../codx-sv.service';
import { SV_Respondents } from '../../models/SV_Respondents';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [RteService, MultiSelectService],
})
export class ReviewComponent extends UIComponent implements OnInit {

  @HostBinding('class.h-100') someField: boolean = false;
  en = environment;
  respondents: SV_Respondents = new SV_Respondents();
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
  lstQuestionTemp: any;
  lstQuestion: any;
  isSent:boolean = false;
  survey:any;
  html = '<div class="text-required-rv ms-6 d-flex align-items-center"><i class="icon-error_outline text-danger"></i><span class="ms-2 text-danger">Đây là một câu hỏi bắt buộc</span></div>'
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
    private auth: AuthService,
    private sanitizer: DomSanitizer
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
    this.someField = true
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
        if(res && res[2]) this.survey = res[2];
        if (res && res[0] && res[0].length > 0) {
          this.questions = this.getHierarchy(res[0], res[1]);
          if (this.questions) {
            this.lstQuestionTemp = JSON.parse(JSON.stringify(this.questions));
            this.lstQuestion = this.lstQuestionTemp;
            this.itemSession = JSON.parse(JSON.stringify(this.questions[0]));
            this.itemSessionFirst = JSON.parse(
              JSON.stringify(this.questions[0])
            );
          }
          //hàm lấy safe url của các question là video youtube
          this.getURLEmbed(res[1]);
          this.SVServices.getFilesByObjectTypeRefer(
            this.functionList.entityName,
            this.recID
          ).subscribe((res: any) => {
            if (res) {
              res.forEach((x) => {
                if (x.referType == this.recID +"_"+this.REFER_TYPE.VIDEO)
                  x['srcVideo'] = `${environment.urlUpload}/${x.pathDisk}`;
              });
              this.lstEditIV = res;
            }
          });
          this.getDataAnswer(this.lstQuestionTemp);
        }
       
      });
  }

  getDataAnswer(lstData) {
    if (lstData) {
      let objAnswer = {
        seqNo: null,
        answer: null,
        other: false,
        columnNo: 0,
      };
      lstData.forEach((x) => {
        x.children.forEach((y) => {
          y.answers = [objAnswer];
        });
      });
    }
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

  lstUrlEmbedSafe: any = [];
  getURLEmbed(lstData) {
    if (lstData && lstData.length > 0) {
      lstData.forEach((x) => {
        if (x.url && x.videoID) {
          const ID = this.getEmbedID(x.url);
          let urlEmbed = `//www.youtube.com/embed/${ID}`;
          x.url = this.sanitizer.bypassSecurityTrustResourceUrl(urlEmbed);
        }
      });
    }
  }

  getEmbedID(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  filterDataColumn(data) {
    data = data.filter((x) => x.isColumn);
    return data;
  }

  filterDataRow(data) {
    data = data.filter((x) => !x.isColumn);
    return data;
  }

  continue(pageNum) {
    let html = document.getElementById('page-questions');
    html.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    this.itemSession = this.questions[pageNum];
    this.lstQuestion = JSON.parse(JSON.stringify(this.lstQuestionTemp));
    this.change.detectChanges();
  }

  lstAnswer: any = [];
  valueChange(e, itemSession, itemQuestion, itemAnswer) {
    //itemAnswer.choose = true
    debugger
    if(itemQuestion.answerType == "L")
    {
      this.lstQuestion[itemSession.seqNo].children[
        itemQuestion.seqNo
      ].answers[0].answer = itemAnswer;

      return;
    }

    if (!e.data && !e.component) return;
    if (e.component) {
      if (
        e.field == 'D' ||
        e.field == 'H' ||
        e.field == 'T' ||
        e.field == 'T2'||
        e.field == 'R'
      ) {
        let data = '';
        if (e.field == 'D' || e.field == 'H') data = e.data.fromDate;
        else data = e.data;
        let results = {
          seqNo: 0,
          answer: data,
          other: 0,
          columnNo: 0,
        };
        this.lstQuestion[itemSession.seqNo].children[
          itemQuestion.seqNo
        ].answers[0] = results;
      } else if (e.field == 'C') {
        if (e.data) this.lstAnswer.push(JSON.parse(JSON.stringify(itemAnswer)));
        else
          this.lstAnswer = this.lstAnswer.filter((x) => {
            x.seqNo == itemAnswer.seqNo;
          });
        this.lstQuestion[itemSession.seqNo].children[
          itemQuestion.seqNo
        ].answers = this.lstAnswer;
      }
       else
        this.lstQuestion[itemSession.seqNo].children[
          itemQuestion.seqNo
        ].answers[0] = JSON.parse(JSON.stringify(itemAnswer));
      
      
    }

    if(itemQuestion.mandatory) this.removeClass(itemQuestion.recID)
  }

  checkAnswer(seqNoSession, seqNoQuestion, seqNoAnswer, answerType = null) {
    if (this.lstQuestion) {
      let seqNo = 0;
      if (!answerType)
        seqNo = JSON.parse(
          JSON.stringify(
            this.lstQuestion[seqNoSession].children[seqNoQuestion].answers[0]
              .seqNo
          )
        );
      else if (answerType == 'C') {
        if (
          this.lstQuestion[seqNoSession].children[seqNoQuestion].answers
            .length > 1
        ) {
          if (
            seqNoAnswer !=
            this.lstQuestion[seqNoSession].children[seqNoQuestion].answers
              .length
          ) {
            seqNo = JSON.parse(
              JSON.stringify(
                this.lstQuestion[seqNoSession].children[seqNoQuestion].answers[
                  seqNoAnswer
                ].seqNo
              )
            );
          }
        } else
          seqNo = JSON.parse(
            JSON.stringify(
              this.lstQuestion[seqNoSession].children[seqNoQuestion].answers[0]
                .seqNo
            )
          );
      }
      if (seqNo == seqNoAnswer) return true;
      else return false;
    } else return false;
  }

  getValue(seqNoSession, seqNoQuestion, seqNoAnswer) {
    if (this.lstQuestion && this.lstQuestion[seqNoSession].children[seqNoQuestion].answers != null) {
      return this.lstQuestion[seqNoSession].children[seqNoQuestion].answers[
        seqNoAnswer
      ].answer;
    } else return '';
  }

  onSubmit() {
    this.checkRequired();
    let lstAnswers = [];
    this.lstQuestion.forEach((y) => {
      lstAnswers = [...lstAnswers, ...y.children];
    });
    let respondQuestion: any = [];
    var check = false;
    debugger
    lstAnswers.forEach((x) => {
      if (x.answerType) {
        let respondResult: any = [];
        x.answers.forEach((y) => {
          let other = false;
          if(y.other == 1) other = true; 
          let seqNo = 0;
          if(y.seqNo) seqNo = y.seqNo;
          let answer = '';
          if(y.answer) answer = y.answer;
          let objR = {
            seqNo: seqNo,
            answer: answer,
            other: other,
            columnNo: false,
          };
          respondResult.push(objR);

          if(x.mandatory && !objR.answer)
          {
            check = true
            document.getElementById("formError"+x.recID).innerHTML = this.html;
            document.getElementById("formId"+x.recID).className += " border-danger";
          }
          else
          {}

        });
        if (respondResult) {
          let objQ = {
            questionID: x.recID,
            question: x.question,
            results: respondResult,
            scores: 0,
          };
          respondQuestion.push(objQ);
        }
      }
    });
    if(!check)
    {
      this.respondents.email = this.user.email;
      this.respondents.respondent = this.user.userName;
      this.respondents.position = this.user.positionID;
      this.respondents.department = this.user.departmentID;
      this.respondents.responds = respondQuestion;
      this.respondents.objectType = '';
      this.respondents.objectID = '';
      this.respondents.finishedOn = new Date();
      this.respondents.transID = this.recID;
      this.respondents.scores = 0;
      this.respondents.duration = 20;
      this.respondents.pending = true;
      this.SVServices.onSubmit(this.respondents).subscribe((res:any) => {
        if(res && res.status == 5) this.isSent = true
      });
    }
    
  }
  convertAnswer(answer:any,type=null)
  {
    if(answer)
    {
      var spilts = answer.split("/");
      if(spilts && spilts.length > 0)
      {
        if(type == 'l') return spilts[2]
        else if(type == 'r') return spilts[3]
        else
        {
          var arr = [];
          for(var i = Number(spilts[0]) ; i<= spilts[1] ; i++)
          {
            arr.push(i);
          }
          return arr
        }
      }
      return null
    }
    return null;
  }

  checkRequired()
  {
    var a = this.itemSession;
  }

  removeClass(id:any = null)
  {
    if(!id)
    {
      var elems = document.querySelectorAll(".card-survey-question");
      elems.forEach(el=>{
        el.classList.remove("border-danger");
      });
      var elemss = document.querySelectorAll(".formError");
      elemss.forEach(el=>{
        el.remove();
      });
    }
    else
    {
      document.getElementById("formError"+id).remove();
      document.getElementById("formId"+id).classList.remove("border-danger");
    }
  }
}
