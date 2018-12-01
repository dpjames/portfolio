package main

import (
   "encoding/json"
   "net/http"
   "log"
   "fmt"
   "io/ioutil"
   "crypto/sha256"
   "strconv"
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
type newAdventureRequest struct {
   Adv adventureJson `json:"adventure"`
   Uname string `json:"uname"`
   Pwd string `json:"pwd"`
}
func sendError(code int, w http.ResponseWriter){
   w.WriteHeader(code);
   fmt.Fprint(w, "I am sad to inform you something went wrong");
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
      panic(e);
   }
}
func adventure(w http.ResponseWriter, r *http.Request){
   switch r.Method {
      case "POST":
         rawBody, err := ioutil.ReadAll(r.Body);
         check(err, 500, w);
         var body newAdventureRequest;
         err = json.Unmarshal(rawBody, &body);
         check(err, 500, w);
         if(!checkPwd(body.Uname, body.Pwd)){
            sendError(403, w);
            return;
         }
         b, err := ioutil.ReadFile(ADVENTURE_FILE)
         check(err, 500, w);
         var advGeoJson adventureGeoJson;
         err = json.Unmarshal(b, &advGeoJson);
         newFeature := featureFromAdvReq(body.Adv, w);
         advGeoJson.Features = append(advGeoJson.Features, newFeature);
         data, err := json.Marshal(advGeoJson);
         check(err, 500, w);
         err = ioutil.WriteFile(ADVENTURE_FILE, data, 0644);
         check(err, 500, w)
         break;
      default:
         sendError(404, w);
   }
}
func featureFromAdvReq(req adventureJson, w http.ResponseWriter) feature{
   var geo  geometry;
   geo.Type = "Point";
   lon, err := strconv.ParseFloat(req.Lon,64);
   check(err, 400, w);
   lat, err := strconv.ParseFloat(req.Lat,64);
   check(err, 400, w);
   geo.Coordinates = [2]float64{lon, lat};
   var prop adventureJson;
   prop = req
   var feat feature;
   feat.Type = "Feature"
   feat.Geometry = geo;
   feat.Properties = prop;
   return feat;
}
func main() {
   fs := http.FileServer(http.Dir("public"))
   http.Handle("/", fs)
   http.HandleFunc("/adventure", adventure);
   fmt.Println("Listening...");
   err := http.ListenAndServe(PORT, nil)
   if(err != nil){
      log.Println(err);
   }
}
