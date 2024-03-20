import { I } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  EventEmitter,
  HostBinding,
  Output,
} from '@angular/core';
import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  MultiSelectService,
  RteService,
} from '@syncfusion/ej2-angular-inplace-editor';
import { RichTextEditorModel } from '@syncfusion/ej2-angular-richtexteditor';
import {
  AESCryptoService,
  AuthService,
  AuthStore,
  UIComponent,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxSvService } from '../../codx-sv.service';
import { SV_Respondents } from '../../models/SV_Respondents';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [RteService, MultiSelectService],
})
export class ReviewComponent extends UIComponent implements OnInit {
  @HostBinding('class.h-100') someField: boolean = false;

  avatar: any;
  primaryColor: any;
  backgroudColor: any;
  en = environment;
  respondents: SV_Respondents = new SV_Respondents();
  questions: any = [];
  functionList: any;
  recID: any;
  repondID: any;
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
  isSent: boolean = false;
  survey: any;
  //Thời hạn trả lời
  expiredOn = false;
  dataRepond: any;
  dataSVRepondents: any;
  typeRepondent: any;
  select: any;
  isPublic: any;
  dataMatrixCount = [];
  autoCreated = false;
  html =
    '<div class="text-required-rv ms-6 d-flex align-items-center"><i class="icon-error_outline text-danger"></i><span class="ms-2 text-danger fw-bold">Đây là một câu hỏi bắt buộc</span></div>';
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
  statusRepondent: any;

  constructor(
    private injector: Injector,
    private SVServices: CodxSvService,
    private shareService: CodxShareService,
    private change: ChangeDetectorRef,
    private auth: AuthStore,
    private sanitizer: DomSanitizer,
    private aesCrypto: AESCryptoService,
    private authService: AuthService
  ) {
    super(injector);
    this.user = this.auth.get();
    this.router.queryParams.subscribe((queryParams) => {
      if (queryParams?._k) {
        var key = this.aesCrypto.decode(queryParams?._k);
        if (key) {
          var obj = JSON.parse(key);
          this.repondID = obj?.repondentID;
          if (obj?.autoCreated) this.autoCreated = obj?.autoCreated;
          if (this.repondID) this.getData();
          else {
            this.funcID = obj?.funcID;
            this.cache.functionList(this.funcID).subscribe((res) => {
              if (res) {
                this.functionList = res;
                if (obj?.recID) {
                  this.recID = obj?.recID;
                  this.loadData();
                } else if (obj?.transID) {
                  this.repondID = obj?.transID;
                  this.SVServices.getDataRepondent(this.repondID).subscribe(
                    (item: any) => {
                      this.dataSVRepondents = item;
                      this.dataRepond = item?.responds;
                      this.recID = item?.transID;
                      this.loadData();
                    }
                  );
                }
              }
            });
          }
        }
      }
    });
  }

  getData() {
    var split = this.repondID.split(';');
    this.repondID = split[0];
    this.funcID = split[1];
    this.typeRepondent = split[2];
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.functionList = res;
        this.SVServices.getDataRepondent(this.repondID).subscribe(
          (item: any) => {
            this.dataSVRepondents = item;
            if (
              this.typeRepondent == '1' &&
              this.dataSVRepondents.status != '1'
            )
              this.isSent = true;
            this.dataRepond = item?.responds;
            this.recID = item?.transID;
            this.loadData();
          }
        );
      }
    });
  }

  onInit(): void {
    this.someField = true;
    this.SVServices.getFormModel(this.funcID).then((res) => {
      if (res) this.formModel = res;
    });
  }

  loadData() {
    this.questions = null;

    this.SVServices.getDataQuestion(this.recID).subscribe((res) => {
      if (res && res[2]) {
        this.survey = res[2];
        if (
          this.survey?.expiredOn &&
          new Date(this.survey?.expiredOn) <= new Date()
        )
          this.expiredOn = true;
        if (this.dataSVRepondents?.objectType == 'S') this.setGuest();
        else if (this.dataSVRepondents?.objectType == 'U') this.setUser();
        else this.getAvatar(this.survey);
      }
      if (res && res[0] && res[0].length > 0) {
        this.questions = this.getHierarchy(res[0], res[1]);
        if (this.questions) {
          this.lstQuestionTemp = JSON.parse(JSON.stringify(this.questions));
          this.lstQuestion = this.lstQuestionTemp;
          this.itemSession = JSON.parse(JSON.stringify(this.questions[0]));
          this.itemSessionFirst = JSON.parse(JSON.stringify(this.questions[0]));
        }
        //hàm lấy safe url của các question là video youtube
        this.getURLEmbed(res[1]);
        this.SVServices.getFilesByObjectTypeRefer(
          this.functionList.entityName,
          this.recID
        ).subscribe((res: any) => {
          if (res) {
            res.forEach((x) => {
              if (x.referType == this.recID + '_' + this.REFER_TYPE.VIDEO)
                x['srcVideo'] = `${environment.urlUpload}/${x.pathDisk}`;
            });
            this.lstEditIV = res;
          }
        });
        this.getDataAnswer(this.lstQuestionTemp);
      }
    });
  }

  getAvatar(data: any) {
    if (data && data.settings) {
      data.settings = JSON.parse(data.settings);
      if (data?.settings?.image) this.avatar = data?.settings?.image;
      if (data?.settings?.primaryColor)
        this.primaryColor = data?.settings?.primaryColor;
      if (data?.settings?.backgroudColor) {
        this.backgroudColor = data?.settings?.backgroudColor;
      }
      if (data?.settings?.isPublic) {
        this.isPublic = data?.settings?.isPublic;

        if (this.isPublic) this.setAuthNoLogin();
      }
    }
  }

  setGuest() {
    if(!this.user) this.user = {};
    this.user.userID = '';
    this.user.email = this.dataSVRepondents?.email;
    this.setAuthNoLogin();
  }

  setUser() {
    this.user.userID = this.dataSVRepondents.objectID;
  }
  setAuthNoLogin() {
    this.api
      .execSv('SYS', 'AD', 'UsersBusiness', 'CreateUserNoLoginAsync', '')
      .subscribe((item: any) => {
        if (item) this.auth.set(item);
      });
  }

  getDataAnswer(lstData) {
    if (lstData) {
      if (this.repondID && this.dataSVRepondents.status != '1') {
        lstData.forEach((x) => {
          x.children.forEach((y) => {
            var answers = this.dataRepond.filter(
              (r) => r.questionID == y?.recID
            );
            if (answers[0].results) {
              if (y?.answerType == 'C') this.lstAnswer = answers[0].results;
              y.answers = answers[0].results;
            } else {
              let objAnswer = {
                seqNo: null,
                answer: null,
                other: false,
                columnNo: 0,
              };
              y.answers = [objAnswer];
            }
          });
        });
      } else {
        let objAnswer = {
          seqNo: null,
          answer: null,
          other: false,
          columnNo: 0,
        };
        lstData.forEach((x) => {
          x.children.forEach((y) => {
            y.answers = [];
          });
        });
      }
    }
  }

  getHierarchy(dataSession, dataQuestion) {
    var dataTemp = JSON.parse(JSON.stringify(dataSession));
    dataTemp.forEach((res) => {
      res['children'] = [];
      dataQuestion.forEach((x) => {
        if (x.parentID == res.recID) {
          if (this.repondID && this.dataSVRepondents?.status != '1') {
            var answer = this.dataRepond.filter((r) => r.questionID == x.recID);
            switch (x.answerType) {
              case 'O': {
                if (answer[0]?.results.length > 0) {
                  var result = answer[0]?.results[0].answer;
                  var other = answer[0]?.results[0].other;
                  if (other) {
                    x.answers.forEach((y) => {
                      if (y.other) {
                        y.checked = true;
                        y.answer = result;
                      }
                    });
                  } else {
                    x.answers.forEach((y) => {
                      if (y.answer == result) y.checked = true;
                    });
                  }
                }
                break;
              }
              case 'C': {
                var result = answer[0]?.results;

                for (var rs = 0; rs < result.length; rs++) {
                  if (result[rs].other) {
                    x.answers.forEach((y) => {
                      if (y.other) {
                        y.checked = true;
                        y.answer = result[rs].answer;
                      }
                    });
                  } else {
                    x.answers.forEach((y) => {
                      if (y.answer == result[rs].answer) y.checked = true;
                    });
                  }
                }
                break;
              }
              case 'L': {
                if (answer[0]?.results.length > 0)
                  this.select = answer[0]?.results[0].answer;
                break;
              }
            }
          }
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

  filterDataRow(data, recID) {
    data = data.filter((x) => !x.isColumn);
    var check = this.dataMatrixCount.findIndex((x) => x.recID == recID);
    if (check < 0)
      this.dataMatrixCount.push({ recID: recID, count: data.length });
    return data;
  }

  continue(pageNum) {
    let html = document.getElementById('page-review');
    html.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    let session = this.questions[pageNum];
    let data = this.lstQuestion.findIndex((x) => x.recID == session.recID);
    this.itemSession = this.setSession(
      this.questions[pageNum],
      this.lstQuestion[pageNum]
    );
    //this.lstQuestion = JSON.parse(JSON.stringify(this.lstQuestionTemp));
    this.change.detectChanges();
  }

  setSession(dataQuestion, questNews) {
    dataQuestion?.children?.forEach((x) => {
      let child = questNews?.children?.find((el) => x.recID == el.recID);
      let answers = child ? child.answers : [];
      switch (x.answerType) {
        case 'O':
        case 'C': {
          x.answers.forEach((y) => {
            if (answers?.some((q) => q.recID == y.recID)) y.checked = true;
            else y.checked = false;
          });
          break;
        }
        case 'L':
          x.answers.forEach((y) => {
            if (answers?.some((q) => q.answer == y.answer)){
              this.select = y.answer;
              y.checked = true;
            }else{
              y.checked = false;
            }
          });
          break;
      }
    });
    return dataQuestion;
  }

  lstAnswer: any = [];
  valueChange(
    e,
    itemSession,
    itemQuestion,
    itemAnswer,
    seqNoSession = null,
    itemR = null
  ) {
    if (itemQuestion.answerType == 'L') {
      let objAnswer = {
        seqNo: 0,
        answer: itemAnswer,
        other: false,
        checked: true,
        columnNo: 0,
      };
      this.lstQuestion[itemSession.seqNo].children[itemQuestion.seqNo].answers =
        [objAnswer];

      return;
    }

    if (!e.data && !e.component) return;
    if (e.component) {
      if (
        e.field == 'D' ||
        e.field == 'H' ||
        e.field == 'T' ||
        e.field == 'T2' ||
        e.field == 'R'
      ) {
        let data = '';
        if (e.field == 'D' || e.field == 'H') data = e.data.fromDate;
        else data = e.data;
        let results = {
          seqNo: 0,
          answer: data,
          other: false,
          columnNo: 0,
        };
        this.lstQuestion[itemSession.seqNo].children[
          itemQuestion.seqNo
        ].answers[0] = results;
      } else if (e.field == 'C') {
        if (e.data) this.lstAnswer.push(JSON.parse(JSON.stringify(itemAnswer)));
        else
          this.lstAnswer = this.lstAnswer.filter(
            (x) => x.seqNo != itemAnswer.seqNo
          );

        var listID = itemQuestion.answers.map((u) => u.id).join(';');
        var listAnswers = this.lstAnswer.filter((x) => listID.includes(x.id));
        this.lstQuestion[itemSession.seqNo].children[
          itemQuestion.seqNo
        ].answers = listAnswers;
      } else if (e.field == 'O2' || e.field == 'C2') {
        let data = JSON.parse(JSON.stringify(itemAnswer));
        var index = this.lstQuestion[itemSession.seqNo].children[
          itemQuestion.seqNo
        ].answers.findIndex(
          (x) => x.recID == itemAnswer.recID && x.seqNo == itemR.seqNo
        );
        if (index < 0) {
          data.columnNo = data.seqNo;
          data.seqNo = itemR.seqNo;
          this.lstQuestion[itemSession.seqNo].children[
            itemQuestion.seqNo
          ].answers.push(data);
        } else
          this.lstQuestion[itemSession.seqNo].children[
            itemQuestion.seqNo
          ].answers[index] = data;
      } else if (e.field == 'O') {
        this.lstQuestion[itemSession.seqNo].children[
          itemQuestion.seqNo
        ].answers[0] = itemAnswer;
      } else {
        this.lstQuestion[itemSession.seqNo].children[
          itemQuestion.seqNo
        ].answers[0] = itemAnswer;
      }
      var doc = document.getElementById(
        'ip-order-' + seqNoSession + itemQuestion?.recID
      ) as HTMLInputElement;
      if (doc) {
        doc.setAttribute('disabled', '');
        doc.focus();
      }
    }

    if (itemQuestion.mandatory) this.removeClass(itemQuestion.recID);
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

  checkDisabelAnswerOrder(
    e,
    itemSession,
    itemQuestion,
    itemAnswer,
    seqNoSession
  ) {
    itemAnswer.choose = true;
    itemAnswer.answer = e?.target?.value;
    var seqNo = itemQuestion.answerType == 'O' ? 0 : itemAnswer.seqNo;
    this.lstQuestion[itemSession.seqNo].children[itemQuestion.seqNo].answers[
      seqNo
    ] = itemAnswer;
    document
      .getElementById('ip-order-' + seqNoSession + itemQuestion?.recID)
      .removeAttribute('disabled');
    if (e?.target?.value)
      (
        document.getElementById(
          'ip-order-' + seqNoSession + itemQuestion?.recID
        ) as HTMLInputElement
      ).focus();
    //if(itemQuestion.mandatory) this.removeClass(itemQuestion.recID);
  }

  checkDisabelAnswerOrderC(
    e: any,
    itemSession,
    itemQuestion,
    itemAnswer,
    seqNoSession
  ) {
    if (e.data) {
      document
        .getElementById('ip-order-' + seqNoSession + itemQuestion?.recID)
        .removeAttribute('disabled');
      (
        document.getElementById(
          'ip-order-' + seqNoSession + itemQuestion?.recID
        ) as HTMLInputElement
      ).focus();
    } else {
      this.lstAnswer = this.lstAnswer.filter(
        (x) => x.seqNo != itemAnswer.seqNo
      );
      this.lstQuestion[itemSession.seqNo].children[itemQuestion.seqNo].answers =
        this.lstAnswer;
      (
        document.getElementById(
          'ip-order-' + seqNoSession + itemQuestion?.recID
        ) as HTMLInputElement
      ).value = '';
      document
        .getElementById('ip-order-' + seqNoSession + itemQuestion?.recID)
        .setAttribute('disabled', '');
    }

    //if(itemQuestion.mandatory) this.removeClass(itemQuestion.recID);
  }

  getValue(seqNoSession, seqNoQuestion, seqNoAnswer) {
    if (
      this.lstQuestion &&
      this.lstQuestion[seqNoSession].children[seqNoQuestion]?.answers &&
      this.lstQuestion &&
      this.lstQuestion[seqNoSession].children[seqNoQuestion]?.answers.length > 0
    ) {
      return this.lstQuestion[seqNoSession].children[seqNoQuestion].answers[
        seqNoAnswer
      ]?.answer;
    } else return '';
  }

  onSubmit() {
    if (this.survey?.status != '3' || this.survey?.stop || this.expiredOn)
      return;
    this.checkRequired();
    let lstAnswers = [];
    this.lstQuestion.forEach((y) => {
      lstAnswers = [...lstAnswers, ...y.children];
    });
    let respondQuestion: any = [];
    var check = false;
    lstAnswers.forEach((x) => {
      if (x.answerType) {
        let respondResult: any = [];
        if (x.answers && x.answers.length > 0) {
          x.answers.forEach((y) => {
            let seqNo = 0;
            let objR = null;
            if (x.answerType == 'O2' || x.answerType == 'C2') {
              objR = {
                seqNo: y.seqNo,
                answer: y.answer,
                other: y.other,
                columnNo: y.columnNo,
              };
            } else {
              if (y.seqNo) seqNo = y.seqNo;
              objR = {
                seqNo: seqNo,
                answer: y.answer,
                other: y.other,
                columnNo: '',
              };
            }

            //let answer = '';
            // if(y.other) answer = (document.getElementById('ip-order-'+x.seqNo+x.recID) as HTMLInputElement).value;
            // else if(y.answer) answer = y.answer;

            respondResult.push(objR);

            if (x.mandatory && !objR.answer) {
              check = true;
              document.getElementById('formError' + x.recID).innerHTML =
                this.html;
              document.getElementById('formId' + x.recID).className +=
                ' border-danger';
            }
          });

          if (x.answerType == 'O2' && x.mandatory) {
            var dt = this.dataMatrixCount.filter((y) => y.recID == x.recID);
            if (dt && dt[0].count > x.answers.length) {
              check = true;
              this.setErrorElm(x.recID);
            }
          }
        } else if (x.mandatory) {
          check = true;
          this.setErrorElm(x.recID);
        }
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

    if (this.repondID && !check) {
      this.dataSVRepondents.responds = respondQuestion;
      this.dataSVRepondents.status = '2';
      this.SVServices.onUpdate(this.dataSVRepondents).subscribe((res: any) => {
        if (res) this.isSent = true;
      });
    } else if (!check) {
      if (this.isPublic != '1') {
        this.respondents.email = this.user?.email;
        this.respondents.respondent = this.user?.userName;
        this.respondents.objectID = this.user?.userID;
        this.respondents.createdBy = this.user?.userID;
      } else {
        this.respondents.createdBy = 'System';
      }
      this.respondents.responds = respondQuestion;
      this.respondents.objectType = this.dataSVRepondents?.objectType || 'U';
      this.respondents.finishedOn = new Date();
      this.respondents.transID = this.recID;
      this.respondents.scores = 0;
      this.respondents.duration = 20;
      this.respondents.pending = true;
      this.respondents.status = '2'; //Đã trả lời
      this.respondents.autoCreated = this.autoCreated;
      this.SVServices.onSubmit(this.respondents).subscribe((res: any) => {
        if (res && res.status == '2') this.isSent = true;
      });
    }
  }

  setErrorElm(recID: any) {
    if (document.getElementById('formError' + recID))
      document.getElementById('formError' + recID).innerHTML = this.html;
    if (document.getElementById('formId' + recID))
      document.getElementById('formId' + recID).className += ' border-danger';
  }

  convertAnswer(answer: any, type = null) {
    if (answer) {
      var spilts = answer.split('/');
      if (spilts && spilts.length > 0) {
        if (type == 'l') return spilts[2];
        else if (type == 'r') return spilts[3];
        else {
          var arr = [];
          for (var i = Number(spilts[0]); i <= spilts[1]; i++) {
            arr.push(i);
          }
          return arr;
        }
      }
      return null;
    }
    return null;
  }

  checkRequired() {
    var a = this.itemSession;
  }

  removeClass(id: any = null) {
    if (!id) {
      var elems = document.querySelectorAll('.card-survey-question');
      elems.forEach((el) => {
        el.classList.remove('border-danger');
      });
      var elemss = document.querySelectorAll('.formError');
      elemss.forEach((el) => {
        el.remove();
      });
    } else {
      document.getElementById('formError' + id).remove();
      document.getElementById('formId' + id).classList.remove('border-danger');
    }
  }
}
