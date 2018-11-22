function fillAdventureList(){
   console.log("hello world");
   var cont = document.getElementById("adventures");
   getAdventureData()
      .then( advs => {
         advs.forEach(createAdventureEntry(cont));
      }).catch( err => alert(err));
}
function getAdventureData(){
   return fetch("/data/adventures.json").then(resp => resp.json());
}
function createAdventureEntry(container){
   return function(adv){
      var title = adv.title;
      var description = adv.description;
      var image = adv.image;
      var entry = createListEntry(true);
      entry.children[0].innerHTML = image;
      entry.children[1].innerHTML = title;
      entry.children[2].innerHTML = description;
      container.appendChild(entry);
   };
}
function showAdventureForm(){
   document.getElementById("newAdventureForm").classList.toggle("hide");
}
function createNewAdventure(){
   var info = document.getElementById("newPostData").querySelectorAll("input");
   var keys = document.getElementById("newPostData").querySelectorAll("label");
   var dataJson = {}
   for(var i = 0; i < info.length; i++){
      dataJson[keys[i].innerHTML] = info[i].value;
   }
   console.log(JSON.stringify(dataJson));
}
var count = 5;
function newPostCount(){
   count--;
   if(count < 0){
      document.getElementById("newAdventureForm").classList.remove("hide");
   }
}
fillAdventureList();
