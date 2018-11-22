function changePage(where){
   getPage(where).then(html => {
      document.getElementById("main").innerHTML = html;
      var js = document.createElement("script");
      js.setAttribute("src", "/js/"+where+".js");
      document.getElementsByTagName("head")[0].appendChild(js);
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
