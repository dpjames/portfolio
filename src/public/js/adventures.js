function fillAdventureList(){
   console.log("hello world");
   var cont = document.getElementById("adventures");
   getAdventureData()
      .then( advs => {
         advs.forEach(createAdventureEntry(cont));
      }).catch( err => alert(err));
}
function getAdventureData(){
   return fetch("/adventures").then(resp => resp.json());
}
function createAdventureEntry(container){
   return function(adv){
      var title = adv.title;
      var description = adv.description;
      var image = adv.image;
      var entry = createListEntry(true);
      entry.children[0].innerHTML = title;
      entry.children[1].innerHTML = description;
      entry.children[2].innerHTML = image;
      container.appendChild(container);
   };
}
fillAdventureList();
