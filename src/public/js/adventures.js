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
function populateCallout(feature, callout){
   callout.element.innerHTML = 
   `
   <div class="popup">
      <div class="title">${feature.get("title")}</div>
      <div class="description">${feature.get("description")}</div>
      <div class="tags">${feature.get("tags")}</div>
   </div> 
   `;
}
function mapClick(evt){
   let lonlat = ol.proj.toLonLat(evt.coordinate);
   let showCallout = false
   const mapel = document.getElementById("map");
   document.getElementById("latin").value = lonlat[1]; 
   document.getElementById("lonin").value = lonlat[0]; 
   mapel.map.forEachFeatureAtPixel(evt.pixel, function(feature){
      populateCallout(feature, mapel.callout);  
      mapel.callout.setPosition(evt.coordinate);
      showCallout = true;
   });
   if(!showCallout){
      mapel.callout.setPosition(undefined);
   }
}
function createAdvLayer(){
   const src = new ol.source.Vector({
      url:"./data/adventures.json",
      format: new ol.format.GeoJSON()
   });
   //maybe cluster
   return new ol.layer.Vector({
      title:"adventures",
      source:src
   });
}
function initMap(){
   const layers = [
      new ol.layer.Tile({source: new ol.source.OSM({crossOrigin : null})}),
      createAdvLayer()
   ];
   const callout = new ol.Overlay({
      element: document.getElementById("popup")
   });
   const view = new ol.View({
      center : ol.proj.fromLonLat([-122.44, 40.25]),
      zoom: 5
   });
   let map = new ol.Map({
      target:"map",
      layers:layers,
      view:view,
   });
   map.addOverlay(callout);
   map.on("click", mapClick);
   var mapel = document.getElementById("map");
   mapel.map = map;
   mapel.callout = callout;
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
