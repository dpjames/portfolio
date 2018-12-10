function changePage(caller){
   where = caller.getAttribute('tplName');
   getPage(where).then(html => {
      document.querySelector(".activePage").classList.toggle("activePage");
      caller.classList.toggle("activePage");
      document.getElementById("main").innerHTML = html;
      //const head = document.getElementsByTagName("head")[0];
      const head = document.getElementById("viewHead");
      head.innerHTML = "";
      const js = document.createElement("script");
      const css = document.createElement("link");
      js.setAttribute("src", "/js/"+where+".js");
      css.setAttribute("rel","stylesheet");
      css.setAttribute("href","css/"+where+".css");
      head.appendChild(js);
      head.appendChild(css);
      //<!--link rel="stylesheet" href="css/about.css"-->
      hideMobileNav();
   })
   .catch(error => alert(error));
}
function getPage(where){
   return fetch('/html/'+where+".html")
         .then(response => response.text());
}
function toggleMobileNav(){
   document.getElementById("nav").classList.toggle("mediahide");
}
function hideMobileNav(){
   document.getElementById("nav").classList.add("mediahide");
}
function createListEntry(image){
   items = []

   var li = document.createElement("div");
   li.classList.add("contentListItem");
   if(image){
      var image = document.createElement("div");
      image.classList.add("contentListItemImage");
      li.appendChild(image);
   }
   var title = document.createElement("div");
   title.classList.add("contentListItemTitle");
   li.appendChild(title);
   var description = document.createElement("div");
   description.classList.add("contentListItemDescription");
   li.appendChild(description);


   return li;
}
