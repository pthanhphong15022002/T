import { ApiHttpService } from "codx-core";
import { DispatchService } from "../services/dispatch.service";
var api: ApiHttpService;

//Hàm chuyển đổi html thành text
function extractContent(s:any) {
  if(s)
  {
    var span = document.createElement('span');
    span.innerHTML = s;
    return span.textContent || span.innerText;
  }
  return ""
};

//Hàm so sánh với ngày hiện tại
function compareDate(d:any)
{
  var date = new Date(d).getTime();
  var currentDate = new Date().getTime();
  if(date < currentDate) return true
  return false
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getListImg(data: any) {
  const datas :any = getUniqueListBy(data,'userID');
  var text = "";
  if (datas.length > 0) {
    datas.forEach((item, i) => {
      if (item.status != 7) {
        if (i == 0) text = item.userID;
        else text = text + ";" + item.userID;
      }
    })
    return text;
  }
  return "";
}

function getUniqueListBy(arr, key) {
  return [...new Map(arr.map(item => [item[key], item])).values()]
}
function getJSONString(data:any) {
  return JSON.stringify(data);    
}
function formatDtDis(item:any)
{
  var txtLstAgency = '';
  if(item.listAgency !=undefined && item.listAgency !=null && item.listAgency.length>0)
  {
    item.listAgency.forEach((elm) => {
      if(elm.category == "9")
      txtLstAgency = txtLstAgency + " " + elm.agencyName
    })
  }
  item.txtLstAgency = txtLstAgency;
  if(item.relations != null) item.lstUserID = getListImg(item.relations)
  return item;
}
export{
  extractContent,
  compareDate,
  formatBytes,
  getListImg,
  getJSONString,
  formatDtDis
}