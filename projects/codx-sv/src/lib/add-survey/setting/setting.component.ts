import {
  Component,
  Injector,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { ColorPickerEventArgs, PaletteTileEventArgs } from '@syncfusion/ej2-angular-inputs';
import { UIComponent } from 'codx-core';
import { addClass, Browser, createElement } from '@syncfusion/ej2-base';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxSvService } from '../../codx-sv.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';
import { isObservable } from 'rxjs';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SettingComponent extends UIComponent implements OnInit, OnChanges , AfterViewInit {
  @ViewChild('attachment') attachment: AttachmentComponent;

  @Input() formModel: any;
  @Input() data: any;

  today = new Date();
  srcFile: any;
  subject:any;
  messages:any;
  
  listColor: any;
  listBackgroundColor = [];
  saveDataTimeout = new Map();
  
  public = false;
  selectFirst = true;
  changeColors = false;
  primaryColor:any;
  backgroudColor:any;

  constructor(private injector: Injector , private change : ChangeDetectorRef , private SvService : CodxSvService , private shareService : CodxShareService) {
    super(injector);
  }
  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
   
  }

  onInit(): void {
    this.parseDataSetting();
    this.getVll();
  }

  parseDataSetting()
  {
    if(this.data.settings) {
      if(typeof this.data.settings == "string") this.data.settings = JSON.parse(this.data.settings);
      if(this.data.settings?.isPublic == "1") this.public = true;
      if(this.data?.settings?.primaryColor) 
      {
        this.selectFirst = false;
        this.primaryColor = this.data?.settings?.primaryColor;
        this.backgroudColor = this.data?.settings?.backgroudColor;
        this.subject = this.data?.settings?.subject;
        this.messages = this.data?.settings?.messages;
        document.getElementById("bg-color-sv-setting").style.backgroundColor = this.data?.settings?.backgroudColor;
      }
      if(this.data?.settings?.image) this.srcFile = this.data?.settings?.image;
    }
  }
  //lấy vll color
  getVll()
  {
    var vll = this.SvService.loadValuelist("SV006") as any;
   
    if(isObservable(vll))
    {
      vll.subscribe((item:any)=>{
        this.listColor = item.datas;
        this.selectedColor();
      })
    }
    else
    {
      this.listColor = vll.datas;
      this.selectedColor();
    }
  }


  selectedColor()
  {
    //Lấy màu mặc định đầu tiên
    //document.getElementById("id-sv-"+this.listColor[0]?.default).appendChild(createElement('span', { className: 'sv-circle-selectioncolor'}));
    var color = this.selectFirst ? this.listColor[0]?.default : this.primaryColor;
    this.listBackgroundColor = [this.hexToRGB(color,0.1),this.hexToRGB(color,0.3),this.hexToRGB(color,0.5)];

    if(this.selectFirst)
    {
      var data1 = 
      {
        field : "primaryColor",
        data: this.listColor[0]?.default
      }
      var data2 = 
      {
        field : "backgroudColor",
        data: this.listBackgroundColor[0]
      }
      this.valueChangeData(data1);
      this.valueChangeData(data2);
    }
  }

  beforeCircleTileRender(e:any , color:any , type:any)
  {
    this.selectFirst = false;
    this.changeColors = false;
    this.removeElementsByClass("sv-circle-selection" + type);
    e.target.appendChild(createElement('span', { className: 'sv-circle-selection'+ type}));
    
    if(type == "color") {
      this.listBackgroundColor = [this.hexToRGB(color,0.1),this.hexToRGB(color,0.3),this.hexToRGB(color,0.5)];
      var data2 = 
      {
        field : "backgroudColor",
        data: this.listBackgroundColor[0]
      }
      this.valueChangeData(data2);
      this.changeColors = true;

      document.getElementById("bg-color-sv-setting").style.backgroundColor = this.listBackgroundColor[0];
      if(document.getElementById("btn-sv-release")) document.getElementById("btn-sv-release").style.backgroundColor = color;
      document.getElementById("icon-sv-default").style.color = color;
    
      
    }
    else document.getElementById("bg-color-sv-setting").style.backgroundColor = color;
    var data = 
    {
      field : type == "color" ? "primaryColor" : "backgroudColor",
      data: color
    }
    this.valueChangeData(data);
  }

  removeElementsByClass(className){
    const elements = document.getElementsByClassName(className);
    for(var i =0 ; i < elements.length ; i++)
    {
      elements[i].parentNode.removeChild(elements[i])
    }
  }

  hexToRGB(hex:any, alpha:any) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return this.rgba2hex("rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")");
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  }
  rgba2hex(orig:any) {
    var a, isPercent,
      rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = (rgb && rgb[4] || "").trim(),
      hex = rgb ?
      (rgb[1] | 1 << 8).toString(16).slice(1) +
      (rgb[2] | 1 << 8).toString(16).slice(1) +
      (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
  
    if (alpha !== "") {
      a = alpha;
    } else {
      a = 1;
    }
    // multiply before convert to HEX
    a = ((a * 255) | 1 << 8).toString(16).slice(1)
    hex = hex + a;
  
    return "#" + hex;
  }

  fileAdded(e:any)
  {
    if(e?.pathDisk)
    {
      this.srcFile = this.shareService.getThumbByUrl(e?.pathDisk);

      var data = 
      {
        field : "image",
        data: environment.urlUpload + "/" + e?.pathDisk
      }

      this.valueChangeData(data);
    }
  }

  openFormUploadFile() {
    this.attachment.uploadFile();
  }

  changeColor(e:any)
  {
    var data = 
    {
      default : e?.target?.value
    }
    this.listColor.push(data);
  }

  valueChangeData(e:any)
  {
    switch(e?.field)
    {
      case "expiredOn":
        {
          this.data[e?.field] = e?.data?.fromDate;
          break;
        }
      case "isPublic":
      case "primaryColor":
      case "backgroudColor":
      case "subject":
      case "messages":
      case "image":
        {
          if(typeof this.data.settings == 'string') this.data.settings = JSON.parse(this.data.settings);
          else if(!this.data.settings) this.data.settings = {};

          if(e?.field == "isPublic") this.data.settings[e?.field] = e?.data ? "1" : "0";
          else this.data.settings[e?.field] = e?.data;
          
          break;
        }
      default :
      {
        this.data[e?.field] = e?.data;
        break;
      }
    }
   
    if(typeof this.data.settings == "object") this.data.settings = JSON.stringify(this.data.settings);
    this.setTimeoutSaveData(this.data);

    this.SvService.signalSave.next('saving');
  }

  setTimeoutSaveData(data:any)
  {
    clearTimeout(this.saveDataTimeout?.get(data.recID));
    this.saveDataTimeout?.delete(this.saveDataTimeout?.get(data.recID));
    this.saveDataTimeout.set(
      data.recID,
      setTimeout(
        this.onSave.bind(
          this,
          data
        ),
        2000
      )
    );
  }

  onSave(data:any) {
    this.SvService.updateSV(data?.recID,data).subscribe((res) => {
      if (res) {
        this.SvService.signalSave.next('done');
      }
    }); 
  }
}
