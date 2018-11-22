function circleHover(who){
   var content = who.querySelector(".circleText");
   var title   = who.querySelector(".circleTitle");
   title.classList.toggle("hide");
   content.classList.toggle("hide");
}
function fillMobileRows(){
   var titles = document.querySelectorAll(".circleTitle");
   var descriptions = document.querySelectorAll(".circleText p");
   var rows = document.querySelectorAll(".infoRow");
   var list = document.getElementById("mobileRows");
   for(var i = 0; i < titles.length; i++){
      var listEntry = createListEntry(false);
      listEntry.children[0].innerHTML = titles[i].innerHTML;
      listEntry.children[1].innerHTML = descriptions[i].innerHTML;
      list.appendChild(listEntry);

   }
}
function createListEntry(image){
   items = []
   var li = document.createElement("div");
   li.classList.add("contentListItem");
   var title = document.createElement("div");
   title.classList.add("contentListItemTitle");
   li.appendChild(title);
   var description = document.createElement("div");
   description.classList.add("contentListItemDescription");
   li.appendChild(description);
   if(image){
      var image = document.createElement("div");
      image.classList.add("contentListItemImage");
      li.appendChild(image);
   }

   return li;
}
fillMobileRows();
