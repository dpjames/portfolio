function changePage(where){
   getPage(where).then(html => {
      document.getElementById("main").innerHTML = html;
   }).catch(error => alert(error));
}
function getPage(where){
   return fetch('/html/'+where)
         .then(response => response.text());
}
