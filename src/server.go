package main

import (
   "encoding/json"
   "net/http"
   "log"
   "fmt"
   "io/ioutil"
   "crypto/sha256"
)

const PORT string = ":80";
const ADVENTURE_FILE string = "public/data/adventures.json";

type adventureJson struct {
   Title string `json:"title"`
   Description string `json:"description"`
   Image string `json:"image"`
   Tags string `json:"tags"`
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
      case http.MethodPost:
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
         var advlist []adventureJson;
         err = json.Unmarshal(b, &advlist);
         advlist = append(advlist, body.Adv);
         data, err := json.Marshal(advlist);
         check(err, 500, w);
         fmt.Println(string(data));
         err = ioutil.WriteFile(ADVENTURE_FILE, data, 0644);
         check(err, 500, w)
         break;
      default:
         sendError(404, w);
   }
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
