package main

import (
   "net/http"

   "log"
)
const PORT string = ":80"
func main() {
   fs := http.FileServer(http.Dir("public"))
   http.Handle("/", fs)
   err := http.ListenAndServe(PORT, nil)
   if(err != nil){
      log.Println(err);
   } else {
      log.Println("Listening...")
   }
}
