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
   dest.innerHTML = document.querySelector(whereTo).innerHTML;
}
function populateCallout(feature, callout){
   const deleteButton = `<button>delete</button>`
   callout.element.innerHTML = 
   `
   <div class="popup">
      <div class="title">${feature.get("title")}</div>
      <div class="description">${feature.get("description")}</div>
      <div class="tags">${feature.get("tags")}</div>
      <button class="hide editAdventureGUI" 
              onclick="deleteAdventure(${feature.get("uid")})">delete
      </button>
   </div> 
   `;
}
function getDelBod(uid){
   return JSON.stringify({
      uname : document.getElementById("uname").value,
      pwd : document.getElementById("pwd").value,
      adventure: {
         uid:uid
      }
   });
}
function deleteAdventure(uid){
   fetch("/adventure", {method:"DELETE", body:getDelBod(uid)})
      .then((res) => res.status == 200 ? initMap() : alert(res.status))
      .catch((err) => alert(err));
}
function mapClick(evt){
   let lonlat = ol.proj.toLonLat(evt.coordinate);
   let showCallout = false
   document.getElementById("latin").value = lonlat[1]; 
   document.getElementById("lonin").value = lonlat[0]; 
   const mapel = document.getElementById("map");
   mapel.map.forEachFeatureAtPixel(evt.pixel, function(feature){
      populateCallout(feature, mapel.callout);  
      mapel.callout.setPosition(evt.coordinate);
      showCallout = true;
   });
   if(!showCallout){
      mapel.callout.setPosition(undefined);
   }
}
function generateAdvList(){
   const map = document.getElementById("map").map;
   const advlayer = getLayerByName(document.getElementById("map").map, "adventures");
   const src = advlayer.getSource();
   const container = document.querySelector(".advList");
   container.innerHTML = "";
   src.forEachFeature((feature) => {
      var thisHTML = 
      `
      <div class="contentListItem">
         <div>${feature.get("title")}</div>
         <div>${feature.get("description")}</div>
         <div>${feature.get("tags")}</div>
      </div>
      `;
      container.innerHTML+=thisHTML; 
   });
}
function createAdvLayer(){
   const src = new ol.source.Vector({
      url:"./data/adventures.json",
      format: new ol.format.GeoJSON()
   });
   //maybe cluster
   const advlayer = new ol.layer.Vector({
      title:"adventures",
      source:src
   });
   advlayer.on("change", generateAdvList);
   return advlayer;
}
function createTopoLayer(){
   return new ol.layer.Tile({
       title: 'OSM',
       type: 'base',
       visible: true,
       source: new ol.source.XYZ({
           url: '//{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
           //url: '//{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
           //url: 'http://c.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png'
           //url: 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg'
           //url: 'http://tile.thunderforest.com/landscape/{z}/{x}/{y}.png'
       })
   });   
}
function initMap(){
   var mapel = document.getElementById("map");
   mapel.innerHTML = "";
   const layers = [
      createTopoLayer(),
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
   mapel.map = map;
   mapel.removedFeatures = [];
   mapel.callout = callout;
   setTimeout(()=>map.updateSize(), 200);
}
function searchFilter(lname, sboxquery){
   const term = document.querySelector(sboxquery).value;
   const filterFunction = function(f){
      const props = f.getProperties()
      let contains = false;
      for(let p in props){
         if(typeof props[p] === "string" && props[p].toLowerCase().indexOf(term.toLowerCase()) > -1){
            return true;
         }
      }
      return false;
   }
   filter(filterFunction, lname);
}
function getLayerByName(map, lname){
   let layer;
   map.getLayers().forEach((l) => {
      if(l.get("title") === lname){
         layer = l;
      }
   });
   return layer;
}
function filter(fun, lname){
   const mapel = document.getElementById("map");
   const layer = getLayerByName(mapel.map, lname);
   //essentially array.filter, but that function is not implemented :(
   const src = layer.getSource();
   src.forEachFeature(function(feature){
      if(!fun(feature)){
         mapel.removedFeatures.push(feature);
         src.removeFeature(feature);
      }
   }); 
}
function resetFilters(lname){
   const mapel = document.getElementById("map");
   const layer = getLayerByName(mapel.map, lname);
   const src = layer.getSource();
   mapel.removedFeatures.forEach(function(feature){
      src.addFeature(feature); 
   });
   mapel.removedFeatures = [];
}
function createNewAdventure(){
   const data = document.getElementById("newAdvTable").querySelectorAll("td .advInput");
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
   .then(resp => resp.status == 200 ? initMap() : alert(resp.status))
   .catch(err => alert(err));
}
initMap();
document.getElementById("titleLeft").onclick = function(){
   document.querySelectorAll(".editAdventureGUI").forEach(function(e){
      e.classList.toggle("hide");
   });
}
changeMapControls(document.getElementById("defaultSubNav"));
