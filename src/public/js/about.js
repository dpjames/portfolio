function circleHover(who){
   var content = who.querySelector(".circleText");
   var title   = who.querySelector(".circleTitle");
   title.classList.toggle("hide");
   content.classList.toggle("hide");
}
