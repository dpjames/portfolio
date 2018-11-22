function changePage(where){
   getPage(where).then(html => {
      document.getElementById("main").innerHTML = html;
      var js = document.createElement("script");
      js.setAttribute("src", "/js/"+where+".js");
      document.getElementsByTagName("head")[0].appendChild(js);
   })
   .catch(error => alert(error));
}
function getPage(where){
   return fetch('/html/'+where+".html")
         .then(response => response.text());
}
