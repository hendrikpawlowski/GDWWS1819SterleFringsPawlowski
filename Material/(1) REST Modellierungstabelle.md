| Ressource     | Verb          | Beschreibung | Statuscode   | Beschreibung Statuscode | Content Type |
|:--------------|:--------------|:-------------|:-------------|:-------------|:-------------|
| /kunde        | POST          |Erstellt einen neuen Kunden und liefert einen Location Header zurück, der den neuen Kunden mit einer URI spezifiziert| 201 | Created | JSON |
|  |  |  | 400 | Bad Request |  |
|  |  |  | 500 | Internal Error |  |
| /kunde/{kundeID} | GET | Ein Request auf den aktuellen Kunden mit der jeweiligen kunden ID | 200 | Ok | JSON |
|  |  |  | 404 | Not Found |  |
|  |  |  | 500 | Internal Error |  |
| /kunde/{kundeID} | PUT | Ein Update auf den aktuellen Kunden mit neuen Informationen | 200 | Ok | JSON |
|  |  |  | 404 | Not Found |  |
|  |  |  | 409 | Conflict |  |
|  |  |  | 500 | Internal Error |  |
| /kunde/{kundeID} | DELETE | Ein Remove auf den aktuellen Kunden, der mittels einer URI ansprechbar ist| 204 | No Content |  |
|  |  |  | 404 | Not Found |  |
|  |  |  | 405 | Not allowed |  |
|  |  |  | 503 | Service Unavailable |  |
| /einkaufsliste | POST | Erstellt eine neue Einkaufsliste und spezifiziert diese mit einer URI | 201 | Created | JSON |
|  |  |  | 400 | Bad Request |  |
|  |  |  | 500 | Internal Error |  |
| /einkaufsliste/{einkaufslisteID} | GET | Ein Request auf die aktuelle Einkaufsliste mit der jeweiligen Einkaufslisten ID | 200 | Ok | JSON |
|  |  |  | 404 | Not Found |  |
|  |  |  | 500 | Internal Error |  |
| /einkaufsliste/{einkaufslisteID} | PUT | Ein Update auf die aktuelle Einkaufsliste, der mittels einer URI ansprechbar ist | 200 | Ok |  |
|  |  |  | 404 | Not Found |  |
|  |  |  | 409 | Conflict |  |
|  |  |  | 500 | Internal Error |  |
| /einkaufsliste/{einkaufslisteID} | DELETE | Ein Remove auf die aktuelle Einkaufsliste, der mittels einer URI ansprechbar ist | 204 | No Content |  |
|  |  |  | 404 | Not Found |  |
|  |  |  | 405 | Not allowed |  |
|  |  |  | 503 | Service Unavailable |  |
| /produkt/{produktID} | GET | Ein Request auf das aktuelle Produkt mit der jeweiligen Produkt ID | 200 | Ok | JSON |
|  |  |  | 404 | Not Found |  |
|  |  |  | 500 | Internal Error |  |
| /discounter | POST | Erstellt einen neuen Discounter und spezifiziert diesen mit einer URI | 201 | Created | JSON |
|  |  |  | 400 | Bad Request |  |
|  |  |  | 500 | Internal Error |  |
| /discounter/{discounterID} | GET | Ein Request auf den aktuelle Discounter mit der jeweiligen Discounter ID | 200 | Ok | JSON |
|  |  |  | 404 | Not Found |  |
|  |  |  | 500 | Internal Error |  |
| /discounter/{discounterID} | PUT | Ein Update auf den aktuellen Discounter, der mittels einer URI ansprechbar ist | 200 | Ok |  |
|  |  |  | 404 | Not Found |  |
|  |  |  | 409 | Conflict |  |
|  |  |  | 500 | Internal Error |  |
| /discounter/{discounterID} | DELETE | Ein Remove auf den aktuellen Discounter, der mittels einer URI ansprechbar ist | 204 | No Content |  |
|  |  |  | 404 | Not Found |  |
|  |  |  | 405 | Not allowed |  |
|  |  |  | 503 | Service Unavailable |  |
