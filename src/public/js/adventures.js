console.log("hello world");
function getAdventureData(){
   return fetch("/data/adventures.json").then(resp => resp.json());
}
function changeMapControls(caller){
   const whereTo = caller.getAttribute("data-page");
   if(caller.classList.contains("active")){
      return; 
   } else {
      document.querySelector(".active")
              .classList.remove("active");
      caller.classList.add("active");
   }
   const dest = document.getElementById("mapControlsContent"); 
   dest.innerHTML = document.getElementById(whereTo).innerHTML;
}
function mapClick(evt){
   let lonlat = ol.proj.toLonLat(evt.coordinate);
   document.getElementById("latin").value = lonlat[1]; 
   document.getElementById("lonin").value = lonlat[0]; 
}
function initMap(){
   const layers = [
      new ol.layer.Tile({source: new ol.source.OSM({crossOrigin : null})})
   ];
   const view = new ol.View({
      center : ol.proj.fromLonLat([-122.44, 40.25]),
      zoom: 5
   });
   let map = new ol.Map({
      target:"map",
      layers:layers,
      view:view,
   });
   map.on("click", mapClick);
   setTimeout(()=>map.updateSize(), 200);
}
function createNewAdventure(){
   const data = document.getElementById("newAdvTable").querySelectorAll("td input");
   let body = {adventure :{}};
   data.forEach((e) => {
      const key = e.getAttribute("data-key")
      if(key === "pwd" || key === "uname"){
         body[key] = e.value;
         return;
      }
      body["adventure"][key] = e.value; 
   });
   fetch("/adventure", {method:"POST", body:JSON.stringify(body)})
   .then(resp => resp.status == 200 ? Promise.resolve() : alert(resp.status))
   .catch(err => alert(err));
}
initMap();
document.getElementById("titleLeft").onclick = function(){
   document.querySelectorAll(".addAdventureGUI").forEach(function(e){
      e.classList.toggle("hide");
   });
}
changeMapControls(document.getElementById("defaultSubNav"));
