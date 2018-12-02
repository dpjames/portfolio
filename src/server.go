package main

import (
   "encoding/json"
   "net/http"
   "log"
   "fmt"
   "io/ioutil"
   "crypto/sha256"
   "strconv"
   "time"
)

const PORT string = ":80";
const ADVENTURE_FILE string = "public/data/adventures.json";

type adventureJson struct {
   Title string `json:"title"`
   Description string `json:"description"`
   Image string `json:"image"`
   Tags string `json:"tags"`
   Lon string `json:"lon"`
   Lat string `json:"lat"`
   Uid int64 `json:"uid"`
}
type geometry struct {
   Coordinates [2]float64 `json:"coordinates"`
   Type string `json:"type"`
}
type feature struct {
   Geometry geometry `json:"geometry"`
   Properties adventureJson `json:"properties"`
   Type string `json:"type"`
}
type adventureGeoJson struct {
   Features []feature `json:"features"`
   Type string `json:"type"`
}
type editAdventureRequest struct {
   Adv adventureJson `json:"adventure"`
   Uname string `json:"uname"`
   Pwd string `json:"pwd"`
}

var hasWritten = false;
func sendError(code int, w http.ResponseWriter){
   if(!hasWritten){
      w.WriteHeader(code);
      fmt.Fprint(w, "I am sad to inform you something went wrong");
      hasWritten = true;
   }
   return;
}

//I am aware this is not exactly secure.
//the data here is not sensitive and I did not want to use external
//libraries for this project
//however, storing passwords in plain text is dumb so this adds some
//level of (bad) security.
//Also note there is only one user (me) and this endpoint is just to make
//my life easier when adding data.
func checkPwd(uname string, pwd string) bool{
   b, err := ioutil.ReadFile(uname)
   if(err != nil){
      return false;
   }
   thisHash := sha256.Sum256([]byte(pwd));
   return (string(thisHash[:]) == string(b));
}
func check(e error, code int, w http.ResponseWriter){
   if(e != nil) {
      sendError(code, w);
   }
}
func unpackAdventure(w http.ResponseWriter, r *http.Request) (bool, editAdventureRequest){
   rawBody, err := ioutil.ReadAll(r.Body);
   check(err, 500, w);
   var body editAdventureRequest;
   err = json.Unmarshal(rawBody, &body);
   check(err, 400, w);
   if(!checkPwd(body.Uname, body.Pwd)){
      sendError(403, w);
      return false, body
   }
   return true, body;
}
func readAdventureGeoJson(w http.ResponseWriter) adventureGeoJson{
   b, err := ioutil.ReadFile(ADVENTURE_FILE)
   check(err, 500, w);
   var advGeoJson adventureGeoJson;
   err = json.Unmarshal(b, &advGeoJson);
   check(err, 500, w);
   return advGeoJson;
}
func writeAdventureGeoJson(w http.ResponseWriter, geojson adventureGeoJson){
   data, err := json.Marshal(geojson);
   check(err, 500, w);
   err = ioutil.WriteFile(ADVENTURE_FILE, data, 0644);
   check(err, 500, w);
}
func adventurePOST(w http.ResponseWriter, r *http.Request){
   perm, body := unpackAdventure(w, r);
   if(!perm) {
      return;
   }
   advGeoJson := readAdventureGeoJson(w);
   newFeature := featureFromAdvReq(body.Adv, w);
   advGeoJson.Features = append(advGeoJson.Features, newFeature);
   writeAdventureGeoJson(w, advGeoJson);
}
func adventureDELETE(w http.ResponseWriter, r *http.Request){
   perm, body := unpackAdventure(w,r);
   if(!perm){
      return;
   }
   advGeoJson := readAdventureGeoJson(w);
   features := advGeoJson.Features
   var newFeatures []feature;
   for _, f := range features {
      if(f.Properties.Uid != body.Adv.Uid){
         newFeatures = append(newFeatures, f);
      }
   }
   advGeoJson.Features = newFeatures;
   writeAdventureGeoJson(w, advGeoJson);
}
func adventure(w http.ResponseWriter, r *http.Request){
   switch r.Method {
      case "POST":
         adventurePOST(w,r);
         break;
      case "DELETE":
         adventureDELETE(w,r);
         break;
      default:
         sendError(404, w);
   }
}
func featureFromAdvReq(req adventureJson, w http.ResponseWriter) feature{
   req.Uid = time.Now().UnixNano()/1000;
   var geo  geometry;
   geo.Type = "Point";
   lon, err := strconv.ParseFloat(req.Lon,64);
   check(err, 400, w);
   lat, err := strconv.ParseFloat(req.Lat,64);
   check(err, 400, w);
   geo.Coordinates = [2]float64{lon, lat};
   var feat feature;
   feat.Type = "Feature"
   feat.Geometry = geo;
   feat.Properties = req;
   return feat;
}
func main() {
   fs := http.FileServer(http.Dir("public"))
   http.HandleFunc("/adventure", adventure);
   http.Handle("/", fs)
   fmt.Println("Listening...");
   err := http.ListenAndServe(PORT, nil)
   if(err != nil){
      log.Println(err);
   }
}
