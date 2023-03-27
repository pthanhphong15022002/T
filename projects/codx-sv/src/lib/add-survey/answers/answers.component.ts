import { Browser } from '@syncfusion/ej2-base';
import {
  Component,
  Injector,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UIComponent } from 'codx-core';
import { CodxSVAnswerService } from './answers.service';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { isObservable } from 'rxjs';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.scss'],
})
export class AnswersComponent extends UIComponent implements OnInit, OnChanges {
  @ViewChild('tabContent') public tabContent: TabComponent;
  
  @Input() formModel: any;
  @Input() recID: any; //Mã bảng khảo sát

  lstRespondents: any = [];
  respondents:any
  seletedDropDown: any
  indexQ : number = 1;
  next = true;
  pervious = false;
  question:any;
  lstCountQuestion = [];
  indexQuesAns: number = 0;
  constructor(
    private injector: Injector,
    private awserSV :CodxSVAnswerService
  ) {
    super(injector);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['changeModeA']) {
    }
  }

  onInit(): void {
    //Lấy thông tin danh sách câu trả lời bằng id SV
    this.getRespondents();
    //this.tabContent.refreshActiveTab();
  }

 
  onSelectTab(e:any)
  {
    var dc= document.getElementById("ejstab-survey-id");
    if(e.selectedIndex == 1) dc.classList.add("border-bt-none");
    else dc.classList.remove("border-bt-none")
  }

  //Ẩn hiện collaspe
  showCollapse()
  {
    var dc= document.getElementById("collapseExample");
    if(dc.classList.contains('show')) dc.classList.remove('show');
    else dc.classList.add('show');
  }
  //Lấy thông tin danh sách câu trả lời bằng id SV
  getRespondents()
  {
    if(this.recID)
    {
      this.awserSV.getRespondents(this.recID).subscribe((item:any) =>{
        if(item && item.length>0) {
          this.lstRespondents = item;
          this.respondents = this.lstRespondents[this.lstRespondents.length - 1];
          this.loadDataAnswerID(this.respondents.responds[0].questionID);
          this.setSelectedDropDown(this.respondents.responds[0].question)
          this.awserSV.loadQuestion(this.respondents.responds[0].questionID).subscribe(itemQ =>{
            if(itemQ) this.question = itemQ;
          })
        }
      })
    }
  }

  //Get content form string html
  extractContent(s:any) {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
  };

  //Set text selected dropdown
  setSelectedDropDown(item:any)
  {
    if(item) this.seletedDropDown = this.extractContent(item);
  }

  selectedDropDown(index:any,item:any=null)
  {
    if(!item) item = this.respondents.responds[(index - 1)].question;
    else
    {
      var e = {data : index + 1 };
      this.valueChangeIndex(e);
    }

    this.setSelectedDropDown(item);
    this.loadDataAnswerID(this.respondents.responds[this.indexQ-1].questionID);
    var o = this.awserSV.loadQuestion(this.respondents.responds[this.indexQ-1].questionID);
    if(isObservable(o))
    {
      o.subscribe(itemQ =>{
        if(itemQ) {
          this.question = itemQ;
          this.detectorRef.detectChanges();
        }
      })
    }
    else this.question = o;

  }

  //Thay đổi câu hỏi kế tiếp hoặc câu hỏi trước đó
  changeQuestion(type:any)
  {
    //Câu hỏi kế tiếp
    if(type == 'next')
    {
      if(!this.next) return;
      this.indexQ ++;

      if(this.indexQ == this.respondents.responds.length) {
        this.next = false;
        this.removeAddDis("div-next" , 'add');
      }
      if(this.indexQ <= 2) {
        this.pervious = true;
        this.removeAddDis("div-pervious" , 'remove');
      }
    }
    else
    {
      if(!this.pervious) return;

      this.indexQ --;

      if(this.indexQ == 1) {
        this.pervious = false;
        this.removeAddDis("div-pervious" , 'add');
      }
      this.next = true
      this.removeAddDis("div-next" , 'remove');
    }
    this.selectedDropDown(this.indexQ);
  }

  //Add class disable 
  removeAddDis(id:any,type:any)
  {
    var clss = document.getElementById(id);
    if(type == 'remove')
    {
      clss.classList.add("div-back-cricle");
      clss.classList.remove("disabled");
    }
    else
    {
      clss.classList.remove("div-back-cricle");
      clss.classList.add("disabled");
    }
  }
  
  valueChangeIndex(e:any)
  {
    if(e?.data)
    {
      this.indexQ = e?.data;

      var nexts = true , 
          perviouss = true,
          handleNext = "remove",
          handlePervious = "remove";

      if(this.indexQ == 1)
      {
        nexts = true;
        perviouss = false;
        handleNext = "remove";
        handlePervious = "add";
      }
      else if(this.indexQ == this.respondents.responds.length)
      {
        nexts = false;
        perviouss = true;
        handleNext = "add";
        handlePervious = "remove";
      }
      this.next = nexts;
      this.pervious = perviouss;
      this.removeAddDis("div-next" , handleNext);
      this.removeAddDis("div-pervious" , handlePervious);
      this.selectedDropDown(this.indexQ);
      this.refeshShowDropDown();
    }
  }

  refeshShowDropDown()
  {
    var dc= document.getElementById("collapseExample");
    dc.classList.remove("show");
  }
  //Lọc dữ liệu câu hỏi 
  loadDataAnswerID(idQ:any)
  {
    var indexQs = this.lstCountQuestion.findIndex(x=>x.idQ == idQ);
    if(indexQs >= 0) return
    for(var a = 0 ; a < this.lstRespondents.length ; a++)
    {
      for(var i = 0 ; i< this.lstRespondents[a].responds.length ; i++)
      {
       
        if(this.lstRespondents[a].responds[i].questionID == idQ)
        {
          var check = this.lstCountQuestion.findIndex(x=>x.idQ == idQ);
          if(check < 0)
          {
            var obj = 
            {
              idQ: idQ,
              listAnswer : []
            }
            if(this.lstRespondents[a].responds[i].results.length > 0)
            {

              for(var y = 0 ; y < this.lstRespondents[a].responds[i].results.length ; y++)
              {
                var obj2 = 
                {
                  answer:  this.lstRespondents[a].responds[i].results[y].answer,
                  count : 1,
                  respondents : [
                    {
                      index : (a + 1),
                      recID : this.lstRespondents[a].recID
                    }
                  ]
                }
                obj.listAnswer.push(obj2)
              }
            }
            this.lstCountQuestion.push(obj);
          }
          else
          {
  
            for(var y = 0 ; y < this.lstRespondents[a].responds[i].results.length ; y++)
            {
              var index = this.lstCountQuestion[check].listAnswer.findIndex(x=>x.answer == this.lstRespondents[a].responds[i].results[y].answer);
              if(index < 0)
              {
                var obj2 = 
                {
                  answer:  this.lstRespondents[a].responds[i].results[y].answer,
                  count : 1,
                  respondents : [
                    {
                      index : (a + 1),
                      recID : this.lstRespondents[a].recID
                    }
                  ]
                }
                this.lstCountQuestion[check].listAnswer.push(obj2)
              }
              else {
                this.lstCountQuestion[check].listAnswer[index].count ++;
                this.lstCountQuestion[check].listAnswer[index].respondents.push( {
                  index : (a + 1),
                  recID : this.lstRespondents[a].recID
                });
              }
            
            }
          }
        }
      }
      
    }
    console.log(this.lstCountQuestion)
    this.detectorRef.detectChanges();
  }
}
