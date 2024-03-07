import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
} from 'codx-core';
import { EmailSendTo } from 'projects/codx-es/src/lib/codx-es.model';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-setting-mail',
  templateUrl: './setting-mail.component.html',
  styleUrls: ['./setting-mail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SettingMailComponent implements OnInit {
  lstTo = [];
  lstCc = [];
  lstBcc = [];
  lstFrom = [];
  showCC = false;
  showBCC = false;
  vllShare = 'ES014';
  sendType: string;
  vllShareData: any;
  formModel: FormModel;
  data = {};
  templateID: string = '';
  constructor(
    private callFc: CallFuncService,
    private cache: CacheService,
    private codxService: CodxShareService,
    private detectorRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.formModel = new FormModel();
    this.formModel.entityName = 'AD_EmailTemplates';
    this.formModel.formName = 'EmailTemplates';
    this.formModel.gridViewName = 'grvEmailTemplates';
    this.cache.valueList(this.vllShare).subscribe((res) => {
      this.vllShareData = res;
    });
    if (this.templateID) {
      this.codxService.getEmailTemplate(this.templateID).subscribe((res1) => {
        if (res1 != null) {
          this.data = res1[0];
          let lstUser = res1[1];
          if (lstUser && lstUser.length > 0) {
            lstUser.forEach((element) => {
              switch (element.sendType) {
                case '1':
                  this.lstFrom.push(element);
                  break;
                case '2':
                  this.lstTo.push(element);
                  break;
                case '3':
                  this.lstCc.push(element);
                  break;
                case '4':
                  this.lstBcc.push(element);
                  break;
              }
            });
          }
        }
      });
    }
  }

  deleteItem(data, type) {}

  toChange(evt: any, sendType: string) {
    let value = evt?.currentTarget?.value;
    let r = this.validateEmail(value);
    if (!r) return;
    let o: any = {};
    o['sendType'] = sendType;
    o['objectType'] = 'Email';
    o['objectID'] = value;
    if (sendType == '2') {
      if (
        !this.lstTo.find(
          (x) =>
            x.objectID.toLowerCase() == value.toLowerCase() &&
            x.objectType == 'Email'
        )
      )
        this.lstTo.push(o);
    } else if (sendType == '3') {
      if (
        !this.lstCc.find((x) => x.objectID == value && x.objectType == 'Email')
      )
        this.lstCc.push(o);
    } else if (sendType == '4') {
      if (
        !this.lstBcc.find(
          (x) => x.objectID.toLo == value.to && x.objectType == 'Email'
        )
      )
        this.lstBcc.push(o);
    }
    evt.currentTarget.value = '';
  }

  onKeydown(evt: KeyboardEvent, sendType: string) {
    const key = evt.code;
    let value = (evt.currentTarget as any).value;
    if (value) return;
    if (key === 'Backspace') {
      if (sendType == '2') {
        if (this.lstTo.length > 0) this.lstTo = this.lstTo.slice(0, -1);
      } else if (sendType == '3') {
        if (this.lstCc.length > 0) this.lstCc = this.lstCc.slice(0, -1);
      } else if (sendType == '4') {
        if (this.lstBcc.length > 0) this.lstBcc = this.lstBcc.slice(0, -1);
      }
    }
  }

  validateEmail(inputText: string): boolean {
    if (!inputText) return false;
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailformat)) {
      return true;
    } else {
      return false;
    }
  }

  changeSendType(sendType) {
    if (sendType == 'cc') {
      this.showCC = !this.showCC;
    } else if (sendType == 'bcc') {
      this.showBCC = !this.showBCC;
    }
  }

  openShare(share, sendType) {
    let option = new DialogModel();
    option.zIndex = 1010;
    this.sendType = sendType;
    this.callFc.openForm(
      share,
      '',
      420,
      window.innerHeight,
      null,
      null,
      null,
      option
    );
  }

  applyShare(event, sendType) {
    if (event) {
      let lst = [];
      event.forEach((element) => {
        if (element.objectType == 'A' || element.objectType == 'S') {
          let isExist = this.isExist(element?.objectType, sendType);
          if (isExist == false) {
            let appr = new EmailSendTo();
            appr.objectID = element?.objectType;
            appr.text = element?.objectName;
            appr.objectType = element?.objectType;
            appr.sendType = sendType.toString();
            appr.icon = sendType.icon;
            lst.push(appr);
          }
        } else if (element.objectType.length == 1) {
          let lstID = element?.id.split(';');
          let lstUserName = element?.text.split(';');

          for (let i = 0; i < lstID?.length; i++) {
            let isExist = this.isExist(element?.objectType, sendType);
            if (lstID[i].toString() != '' && isExist == false) {
              let appr = new EmailSendTo();
              appr.objectType = element.objectType;
              appr.text = lstUserName[i];
              appr.objectID = lstID[i];
              appr.sendType = sendType.toString();
              lst.push(appr);
            }
          }
        } else {
          let isExist = this.isExist(element?.objectType, sendType);
          if (isExist == false) {
            let appr = new EmailSendTo();
            appr.objectID =
              element?.objectType == 'SYS061'
                ? element?.id
                : element?.objectType;
            appr.text =
              element?.objectType == 'SYS061'
                ? element?.text
                : element?.objectName;
            appr.objectType =
              element?.objectType == 'SYS061'
                ? element?.id
                : element?.objectType;
            appr.sendType = sendType.toString();
            appr.icon = element?.icon ?? element?.dataSelected?.icon;
            if (element?.objectType == 'SYS061' && !appr.icon) {
              appr.icon = this.vllShareData?.datas?.find(
                (x) => x.value == 'SYS061'
              )?.icon;
            }
            lst.push(appr);
          }
        }
      });

      switch (sendType) {
        case '1':
          this.lstFrom.push(...lst);
          this.lstFrom = JSON.parse(JSON.stringify(this.lstFrom));
          break;
        case '2':
          this.lstTo.push(...lst);
          this.lstTo = JSON.parse(JSON.stringify(this.lstTo));
          break;
        case '3':
          this.lstCc.push(...lst);
          this.lstCc = JSON.parse(JSON.stringify(this.lstCc));
          break;
        case '4':
          this.lstBcc.push(...lst);
          this.lstBcc = JSON.parse(JSON.stringify(this.lstBcc));
          break;
      }
    }
    this.detectorRef.detectChanges();
  }

  isExist(objectID, sendType) {
    let index = -1;
    switch (sendType) {
      case '1':
        index = this.lstFrom.findIndex((p) => p.objectID == objectID);
        break;
      case '2':
        index = this.lstTo.findIndex((p) => p.objectID == objectID);
        break;
      case '3':
        index = this.lstCc.findIndex((p) => p.objectID == objectID);
        break;
      case '4':
        index = this.lstBcc.findIndex((p) => p.objectID == objectID);
        break;
    }

    if (index == -1) return false;
    else return true;
  }

  valueChange(event) {
    if (event?.field && event.component) {
      switch (event.field) {
        case 'template': {
          if (event?.data != '') {
            this.templateID = event?.data;
            this.codxService
              .getEmailTemplate(this.templateID)
              .subscribe((res) => {
                if (res) {
                  this.data = res[0]
                  let lstUser = res[1];
                  if (lstUser && lstUser.length > 0) {
                    console.log(lstUser);
                    lstUser.forEach((element) => {
                      switch (element.sendType) {
                        case '1':
                          this.lstFrom.push(element);
                          break;
                        case '2':
                          this.lstTo.push(element);
                          break;
                        case '3':
                          this.lstCc.push(element);
                          break;
                        case '4':
                          this.lstBcc.push(element);
                          break;
                      }
                    });
                  }
                  this.detectorRef.detectChanges();
                }
              });
          }
          break;
        }
        default:
          this.data[event?.field] = event?.data;
          this.detectorRef.detectChanges();
          break;
      }
    }
  }
}
