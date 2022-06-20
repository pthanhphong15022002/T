import { formatDate } from "@angular/common";
import { Injectable, OnDestroy } from "@angular/core";
// import { ApiHttpService } from "@core/services";
// import {
//   alertRule,
//   fieldAdv,
//   fieldChoose,
//   objectPara,
//   opCondition,
//   SaveAdvSearch,
// } from "@shared/components/systemDialog/alertRule.model";
import { ApiHttpService } from "codx-core";
import { BehaviorSubject, Observable } from "rxjs";
import { alertRule, fieldAdv, fieldChoose, objectPara, SaveAdvSearch, opCondition } from "./alertRule.model";

@Injectable({
  providedIn: "root",
})
export class SystemDialogService implements OnDestroy {

  // public openAttachment = new BehaviorSubject<boolean>(null);
  // isOpenAttachment = this.openAttachment.asObservable();

  public onOpenViewFileDialog = new BehaviorSubject<objectPara>(null);
  isOnOpenViewFileDialog = this.onOpenViewFileDialog.asObservable();

  public onOpenAlertDialog = new BehaviorSubject<objectPara>(null);
  isOnOpenAlertDialog = this.onOpenAlertDialog.asObservable();

  public onOpenChooseFieldsDialog = new BehaviorSubject<fieldChoose[]>(null);
  isOnOpenChooseFieldsDialog = this.onOpenChooseFieldsDialog.asObservable();

  public onChoosedFields = new BehaviorSubject<fieldChoose[]>(null);
  isOnChoosedFields = this.onChoosedFields.asObservable();

  public onOpenFieldsAdvDialog = new BehaviorSubject<objectPara>(null);
  isOnOpenFieldsAdvDialog = this.onOpenFieldsAdvDialog.asObservable();

  public onFieldsAdv = new BehaviorSubject<fieldAdv[]>(null);
  isOnFieldsAdv = this.onFieldsAdv.asObservable();

  public onGetAlertRule = new BehaviorSubject<alertRule>(null);
  isOnGetAlertRule = this.onGetAlertRule.asObservable();

  public onSave = new BehaviorSubject<SaveAdvSearch>(null);
  isOnSave = this.onSave.asObservable();

  public onOpenScheduleTask = new BehaviorSubject<string>(null);
  isOnOpenScheduleTask = this.onOpenScheduleTask.asObservable();

  constructor(private api: ApiHttpService) { }

  ngOnDestroy() { }

  setConditionVll(condition: any) {
    if (condition != null && condition?.length > 0) {
      condition.forEach((element) => {
        if (element.value.toString() == "19")
          opCondition["PERIOD"]["name"] = element.text;
        else opCondition[element.value]["name"] = element.text;
      });
    }
  }

  getFieldList(
    formName: string,
    gridView: string,
    entityName: string,
    _default: string
  ): Observable<fieldAdv[]> {
    return this.api.exec<fieldAdv[]>(
      "SYS",
      "GridViewSetupBusiness",
      "GetListAlertRuleAsync",
      [formName, gridView, entityName, _default]
    );
  }

  getAlertRule(entityName: string): Observable<alertRule> {
    return this.api.exec<alertRule>(
      "AD",
      "AlertRulesBusiness",
      "GetAsync",
      entityName
    );
  }
  saveAlertRule(model: alertRule): Observable<string> {
    return this.api.exec<string>(
      "AD",
      "AlertRulesBusiness",
      "UpdateAsync",
      model
    );
  }

  saveAdvSearch(model: SaveAdvSearch): Observable<string> {
    return this.api.exec<string>(
      "AD",
      "SearchAdvancedBusiness",
      "SaveAsync",
      model
    );
  }

  getDescriptionForFilterAdv(fs: fieldAdv[]): string {
    var ConditionMemo = "";
    for (let index = 0; index < fs.length; index++) {
      const element = fs[index];
      if (ConditionMemo != "" && (element.text || element.value))
        ConditionMemo = ConditionMemo + "; " + element.condition.name + " ";
      if (element.text || element.value) {
        ConditionMemo = ConditionMemo + "[" + element.name + "]" + " ";
        ConditionMemo = ConditionMemo + element.opValue.name + " ";
        if (element.type == "string") {
          ConditionMemo =
            ConditionMemo + '"' + (element.text || element.value || "") + '" ';
        }
        else if (element.type == "date") {
          var v = "";
          if (element.value instanceof Date) {
            v = formatDate(element.value as Date, "dd/MM/yyyy", "vi-VN");
          }
          ConditionMemo = ConditionMemo + '"' + v + '" ';
          if (element.opValue.id == "BETWEEN") {
            ConditionMemo = ConditionMemo + " và ";
            v = "";
            if (element.value1 instanceof Date) {
              v = v + formatDate(element.value1 as Date, "dd/MM/yyyy", "vi-VN");
            }

            ConditionMemo = ConditionMemo + '"' + v + '" ';
          }
        }
        else if (element.type == "bool") {
          var v = "sai";
          if (element.value == "1") {
            v = "đúng";
          } else if (element.value == "11") {
            v = "Không chọn";
          }
          ConditionMemo = ConditionMemo + '"' + v + '" ';
        }
        else if (element.type == "number") {
          var v = "";
          if (element.value instanceof Number) {
            v = (element.value as Number).toLocaleString();
          }

          ConditionMemo = ConditionMemo + '"' + v + '" ';
        }
      }

    }
    return ConditionMemo;
  }
}
