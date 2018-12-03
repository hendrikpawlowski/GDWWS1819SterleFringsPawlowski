| Ressource     | Verb          | Beschreibung | Statuscode   | Beschreibung Statuscode | Content Type |
|:--------------|:--------------|:-------------|:-------------|:-------------|:-------------|
| /kunde        | POST          |Erstellt einen neuen Kunden und liefert einen Location Header zurück, der den neuen Kunden mit einer URI spezifiziert| 201 | Created | JSON |
|  |  |  | 400 | Bad Request |  |
|  |  |  | 500 | Internal Error |  |
| /kunde/{kundeID} | GET | Ein Request auf den aktuellen Kunden mit der jeweiligen kundenID | 200 | Ok | JSON |
|  |  |  | 404 | Not Found |  |
|  |  |  | 500 | Internal Error |  |
| /kunde/{kundeID} | PUT | Ein Update auf den aktuellen Kunden mit neuen Informationen | 200 | Ok | JSON |
|  |  |  | 204 | No Content |  |
| /kunde/{kundeID} | DELETE | Ein Remove auf den aktuellen Kunden, der mittels einer URI ansprechbar ist|  |  |
|  |  |  | 204 | No Content |  |
|  |  |  | 404 | Not Found |  |
|  |  |  | 405 | Not allowed |  |
|  |  |  | 503 | Service Unavailable |  |
