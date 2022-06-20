//Hàm chuyển đổi html thành text
function extractContent(s: any) {
  var span = document.createElement('span');
  span.innerHTML = s;
  return span.textContent || span.innerText;
}
//Hàm so sánh với ngày hiện tại
function compareDate(d: any) {
  var date = new Date(d).getTime();
  var currentDate = new Date().getTime();
  if (date < currentDate) return true;
  return false;
}
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
export { extractContent, compareDate, formatBytes };
