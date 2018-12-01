| Ressource     | Verb          | Beschreibung | Fehlercode   | Beschreibung Fehlercode | Content Type |
|:--------------|:--------------|:-------------|:-------------|:-------------|:-------------|
| /kunde        | POST          |Erstellt einen neuen Kunden und liefert einen Location Header zurück, der den neuen Kunden miteiner URI spezifiziert| 201 | Created | JSON |
|  | GET | Ein Request auf den aktuellen Kunden mit der jeweiligen kundenID | 200 | Ok | JSON |
|  |  |  | 404 | Not Found |  |
|  |  |  | 500 | Internal Error |  |
|  | PUT | Ein Update auf den aktuellen Kunden mit neuen Informationen | 200 | Ok | JSON |
|  |  |  | 204 | No Content |  |
|  | DELETE | Ein Remove auf den aktuellen Kunden, der mittels einer URI ansprechbar ist|  |  |
|  |  |  | 204 | No Content |  |
|  |  |  | 404 | Not Found |  |
|  |  |  | 405 | Not allowed |  |
|  |  |  | 503 | Service Unavailable |  |
