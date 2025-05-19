## LISTES DES OPTIONS POSSIBLE A L'APPEL DE Fastify();
 
- **`example d'utilisation`**
    import fastify from 'fastify';

    const app = fastify({
        logger: true,
        trustProxy: true,
    });


## 🌐 Options liées au protocole HTTP

- **`http`** : `true`  
  Active le serveur HTTP standard.

- **`http2`** : `false`  
  Désactive HTTP/2.

- **`https`** : `null`  
  Désactive HTTPS.

- **`connectionTimeout`** : `0` (aucun délai d'attente)  
  Définit le délai d'attente pour établir une connexion.

- **`keepAliveTimeout`** : `72000 ms` (72 secondes)  
  Définit le délai d'attente pour les connexions persistantes.

- **`forceCloseConnections`** : `"idle"`  
  Ferme les connexions inactives lors de l'arrêt du serveur.

- **`maxRequestsPerSocket`** : `0` (aucune limite)  
  Définit le nombre maximal de requêtes qu'une connexion peut gérer avant de la fermer.

- **`requestTimeout`** : `0` (aucune limite)  
  Définit le délai d'attente pour recevoir une requête complète du client.

## 🔧 Options de routage et de sécurité

- **`ignoreTrailingSlash`** : `false`  
  Prend en compte les barres obliques finales dans les routes.

- **`ignoreDuplicateSlashes`** : `false`  
  Ne supprime pas les barres obliques redondantes dans les chemins.

- **`maxParamLength`** : `100`  
  Limite la longueur des paramètres dans les routes paramétrées.

- **`bodyLimit`** : `1048576` (1 MiB)  
  Limite la taille du corps de la requête.

- **`onProtoPoisoning`** : `'error'`  
  Définit l'action à entreprendre lors de la détection d'une tentative de poisoning du prototype.

- **`onConstructorPoisoning`** : `'error'`  
  Définit l'action à entreprendre lors de la détection d'une tentative de poisoning du constructeur.

## 📦 Options liées au serveur et au logger

- **`logger`** : `false`  
  Désactive le logger interne.

- **`loggerInstance`** : `null`  
  N'utilise pas d'instance de logger personnalisée.

- **`disableRequestLogging`** : `false`  
  Active l'enregistrement des requêtes.

- **`serverFactory`** : `null`  
  Utilise le serveur HTTP standard de Node.js.

- **`caseSensitive`** : `true`  
  Les routes sont sensibles à la casse.

- **`allowUnsafeRegex`** : `false`  
  Désactive l'utilisation de regex non sécurisées dans les routes.

## 🆔 Options liées à l'identifiant de requête

- **`requestIdHeader`** : `'request-id'`  
  Nom de l'en-tête utilisé pour l'identifiant de la requête.

- **`requestIdLogLabel`** : `'reqId'`  
  Étiquette utilisée dans les logs pour l'identifiant de la requête.

- **`genReqId`** : `function(req) { return req.headers['request-id'] || generateUniqueId(); }`  
  Fonction générant un identifiant unique pour chaque requête.

## 🛡️ Options liées au proxy et à la sécurité

- **`trustProxy`** : `false`  
  Ne fait pas confiance aux en-têtes `X-Forwarded-*` envoyés par les proxies.

- **`pluginTimeout`** : `10000 ms` (10 secondes)  
  Délai maximal pour le chargement d'un plugin.

## 🔍 Options liées au parsing et à la sérialisation

- **`querystringParser`** : `'simple'`  
  Utilise un parseur de chaîne de requête simple.

- **`exposeHeadRoutes`** : `true`  
  Crée automatiquement une route `HEAD` pour chaque route `GET` définie.

- **`constraints`** : `null`  
  Aucune contrainte supplémentaire n'est appliquée aux routes.

- **`return503OnClosing`** : `true`  
  Retourne une erreur 503 après avoir appelé la méthode `close` du serveur.

- **`ajv`** : `{ customOptions: { removeAdditional: true, useDefaults: true, coerceTypes: true, allErrors: true, nullable: true }, plugins: [] }`  
  Configure l'instance d'Ajv utilisée pour la validation des schémas.

## 🧾 serializerOpts

- **Valeur par défaut** : `{}` (objet vide)

- **À quoi ça sert** :  
  Cette option permet de passer des paramètres de configuration au **sérialiseur JSON** utilisé par Fastify pour envoyer les réponses.  
  Par défaut, Fastify utilise un sérialiseur très rapide basé sur [`fast-json-stringify`](https://github.com/fastify/fast-json-stringify).  
  Tu peux par exemple y personnaliser :
  - le support des types personnalisés,
  - des formats JSON spécifiques,
  - ou encore l’utilisation de fonctions de sérialisation alternatives.

