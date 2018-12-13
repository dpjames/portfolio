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
   const oldEl = dest.children[0]
   const newEl = document.getElementById(whereTo);
   oldEl.classList.toggle("hide");
   newEl.classList.toggle("hide");
   document.getElementsByTagName("body")[0].append(oldEl); 
   dest.append(newEl);
}
function populateCallout(feature, callout){
   const editOn = document.getElementById("edit").classList.contains("enabled");
   callout.element.innerHTML = 
   `
   <div class="popup">
      <div class="title">${feature.get("title")}</div>
      <div class="description">${feature.get("description")}</div>
      <div class="tags">${feature.get("tags")}</div>
      <div class="editAdventureGUI delete button ${editOn ? '' : 'hide'}" 
              onclick="deleteAdventure(${feature.get("uid")})">delete</div>
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
   mapel.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
      populateCallout(feature, mapel.callout);  
      mapel.callout.setPosition(evt.coordinate);
      showCallout = true;
   });
   if(!showCallout){
      mapel.callout.setPosition(undefined);
   }
}
function highlightFeature(caller,uid){
   const map = document.getElementById("map").map;
   const layer = getLayerByName(map, "adventures");
   const src = layer.getSource();
   let feature = null;
   src.forEachFeature(function(f){
      if(f.get("uid") == uid){
         feature = f;
      }
   });
   feature.set("highlight", true);
}
function unhighlightFeature(caller,uid){
   const map = document.getElementById("map").map;
   const layer = getLayerByName(map, "adventures");
   const src = layer.getSource();
   let feature = null;
   src.forEachFeature(function(f){
      if(f.get("uid") == uid){
         feature = f;
      }
   });
   feature.set("highlight", false);
}
function generateAdvList(id){
   const map = document.getElementById("map").map;
   const advlayer = getLayerByName(document.getElementById("map").map, "adventures");
   const src = advlayer.getSource();
   if(id == undefined){
      id = "advList"
   }
   const container = document.getElementById(id);
   container.innerHTML = "";
   const editOn = document.getElementById("edit").classList.contains("enabled");
   src.forEachFeature((feature) => {
      const thisHTML = `
      <div onmouseenter="highlightFeature(this,${feature.get('uid')});" 
          onmouseleave="unhighlightFeature(this,${feature.get('uid')});"
           class="advListItem">
         <div class="title">${feature.get("title")}</div>
         <div class="description">${feature.get("description")}</div>
         <div class="tags">${feature.get("tags")}</div>
         <div class="button editAdventureGUI delete ${editOn ? '' : 'hide'}" 
         onclick="deleteAdventure(${feature.get("uid")})">delete</div>
      </div>
      `;
      container.innerHTML+=thisHTML; 
   });
}
function adventureStyle(f) {
   if(f.get("highlight")){
      return new ol.style.Style({
         image: new ol.style.RegularShape({
            stoke : new ol.style.Stroke({color : '#00F', width:2}),
            fill  : new ol.style.Fill({color : "green"}),
            points : 8,
            radius : 20
         })
      });
   } else {
      return new ol.style.Style({
         image: new ol.style.RegularShape({
            stroke : new ol.style.Stroke({color : '#0F0', width:2}),
            fill : new ol.style.Fill({color : "red"}),
            points : 4,
            radius: 10
         })
      });
   }
}
function createAdvLayer(){
   const src = new ol.source.Vector({
      url:"./data/adventures.json",
      format: new ol.format.GeoJSON(),
   });
   //maybe cluster
   const advlayer = new ol.layer.Vector({
      title:"adventures",
      source:src,
      style : adventureStyle
   });
   //advlayer.on("change", () => generateAdvList());
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
   const mapel = document.getElementById("map");
   const advLayer = createAdvLayer();
   mapel.innerHTML = "";
   const layers = [
      createTopoLayer(),
      advLayer
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
   mapel.callout = callout;
   mapel.filters = [];
   setTimeout(() => {
      mapel.masterFeatureList = advLayer.getSource().getFeatures();
      map.updateSize();
      generateAdvList();
   }, 500);
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
   addToFilterList("search", term, lname);
}
function addToFilterList(type, by, lname){
   const flist = document.getElementById("filterList");
   const index = flist.children.length;
   const thisEntry = 
      `<div data-index="${index}" class="contentListItem filterListItem">
         ${type} -> ${by}
         <div class="delete button" onclick="removeFilter(${index}, this, '${lname}')">X</div>
      </div>`;
   flist.innerHTML+=thisEntry;
}
function removeFilter(index, rmButton, lname){
   const mapel = document.getElementById("map");
   const src = getLayerByName(mapel.map, lname).getSource();
   const listEntry = rmButton.parentNode;
   listEntry.innerHTML = "";
   listEntry.classList = [];
   mapel.filters[index] = undefined;  
   updateFilters(mapel.filters, src, mapel.masterFeatureList);
}
function clearFeatures(src){
   src.forEachFeature((f) => src.removeFeature(f));
}
function updateFilters(filters, src, master){
   clearFeatures(src)
   master.forEach((feature) => {
      let pass = true;
      for(let i = 0; i < filters.length; i++){ //TODO change this to handle logic functions other than 'and'
         const filt = filters[i];
         if(filt === undefined){
            continue;
         }
         if(!filt(feature)){
            pass = false;
            break;
         }
      }
      if(pass){
         src.addFeature(feature)
      }
   });
   generateAdvList("filterListResults");
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
   const src = layer.getSource();
   mapel.filters.push(fun);
   updateFilters(mapel.filters, src, mapel.masterFeatureList);
}
function resetFilters(lname){
   const mapel = document.getElementById("map");
   const flist = document.getElementById("filterList");
   const flistres = document.getElementById("filterListResults");
   const layer = getLayerByName(mapel.map, lname);
   const src = layer.getSource();
   clearFeatures(src);
   src.addFeatures(mapel.masterFeatureList);
   mapel.removedFeatures = [];
   mapel.filters = [];
   flist.innerHTML = "";
   flistres.innerHTML = "";
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
   document.querySelectorAll(".editAdventureGUI")
      .forEach((e) => e.classList.toggle("hide"));
   document.getElementById("edit").classList.toggle("enabled");
}
