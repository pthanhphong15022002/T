import { ApiHttpService } from "codx-core";
import { DispatchService } from "../services/dispatch.service";
var api: ApiHttpService;

//Hàm chuyển đổi html thành text
function extractContent(s:any) {
  var span = document.createElement('span');
  if(s)
  {
    span.innerHTML = s;
    span.classList.add("fs-6")
  }
  else
  {
    span.classList.add("text-gray-300")
    span.classList.add("fw-light")
    span.innerHTML = 'Mô tả ngắn gọn'
  } 
  return span.outerHTML || span.innerText;
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
function convertHtmlAgency(agencyName: any , headerText: any) {
  var divE = document.createElement('div');
  divE.classList.add("d-flex");
  if(agencyName)
    divE.innerHTML = '<div class="d-flex align-items-center me-2"><span class="icon-apartment icon-20"></span><span class="ms-1">' + agencyName + '</span></div>';
  else
  {
    divE.classList.add("text-gray-400")
    divE.innerHTML = headerText;  
  } 
  return divE.outerHTML  || divE.innerText;
}
function convertHtmlAgency2(agencyName,txtLstAgency:any)
{
  if(!agencyName && !txtLstAgency)
    return '<div><span class="tex-gray-300">Tên công ty</span></div>';
  var desc = '<div class="d-flex">';
  if(agencyName)
    desc += '<div class="d-flex align-items-center me-2"><span class="icon-apartment icon-20"></span><span class="ms-1">' +agencyName+'</span></div>';
  if(txtLstAgency)
    desc +='<div class="d-flex align-items-center me-6"><span class="me-2">| Phòng :</span><span class="ms-1">'+txtLstAgency+'</span></div>';
  return desc + '</div>';
}
function getIdUser(createdBy: any, owner: any) {
  var arr = [];
  if (createdBy) arr.push(createdBy);
  if (owner && createdBy != owner) arr.push(owner);
  return arr.join(";");
}
//Chữ đầu thành chữ thường
function capitalizeFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
function getDifference(array1:any, array2:any) {
  return array1.filter(object1 => {
    return !array2.some(object2 => {
      return object1.recID === object2.recID;
    });
  });
}
export{
  extractContent,
  compareDate,
  formatBytes,
  getListImg,
  getJSONString,
  formatDtDis,
  getIdUser,
  convertHtmlAgency,
  convertHtmlAgency2,
  capitalizeFirstLetter,
  getDifference
}