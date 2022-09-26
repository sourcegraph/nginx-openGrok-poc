# nginx-openGrok-poc
This is an example proof of concept for an nginx server using the rewrite directive to transform common openGrok query urls repo and file (with hash), and symbol searches to Sourcegraph query urls.

> *Make sure to check out the [redirect-to-search branch](https://github.com/sourcegraph/nginx-openGrok-poc/tree/redirect-to-search) for alternate behavior*

For Example:

### **File**
**OpenGrok URL**
```
http://192.168.64.6:8080/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/
```
**Sourcegraph URL**
```
http://192.168.64.6/github.com/sourcegraph/sourcegraph/-/blob/client/web/src/enterprise/code-monitoring/testing/
```

### **File with Hash**
**OpenGrok URL**
```
http://192.168.64.6:8080/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/util.ts?r=b23a28ce
```
**Sourcegraph URL**
```
http://192.168.64.6/github.com/sourcegraph/sourcegraph@b23a28ce/-/blob/client/web/src/enterprise/code-monitoring/testing/util.ts
```
### **Symbol Search**
**OpenGrok URL**
```
http://192.168.64.6:8080/source/search?full=&defs=OverwriteSettings&refs=&path=&hist=&type=&xrd=&nn=2&si=full&searchall=true&si=full
```  
**Sourcegraph URL**
```
http://192.168.64.6/search?q=context:global+repo:%5Egithub%5C.com/sourcegraph/sourcegraph%24+type:symbol+OverwriteSettings&patternType=lucky
```

The rewrite rules contained in `openGrokRewrite.conf.template` are applied when a Sourcegraph instance recieves requests redirected from an openGrok domain to a sourcegraph instance domain, while maintaining the openGrok url subdirectory scheme. Nginx rewrite rules are applied to urls with subdirectories starting in `/source/xref` or `/source/search/`.

This is not a full fledged Sourcegraph deployment and is meant primarily as a proof of concept for rewrite rules to be employed in an nginx service in front of a [docker-compose](www.github.com/sourcegraph/deploy-sourcegraph-docker) Sourcegraph deployment. *Note currently Caddy is our standard proxy service for docker-compose Sourcegraph*

# Limitations

This nginx configuration can only redirect OpenGrok Urls to Sourcegraph Urls from a specified codehost.

Nginx rewrite rules do not support conditional redirects based on http response (this service is available via [openResty](https://github.com/openresty/lua-nginx-module#readme), or the [Nginx Plus](https://www.nginx.com/products/nginx/modules/lua/) paid service).

This presents a major limitation, in that OpenGrok's url schema contains no information about the codehost associated with a repo to extract and use to construct a Sourcegraph url, which does include a codehost. A try block allowing requests to each possible codehost url with a redirect to the first 200 http response would accomplish this, but currently this is unsupported by nginx.

> **An alternative strategy is to redirect open grok repo and file specific nav to general Sourcegraph search results, i.e. an openGrok file url, will direct you to a sourcegraph search for any codehost containing a repo with the same top level directory and filepath -- for this redirect strategy see the [redirect-to-search](https://github.com/sourcegraph/nginx-openGrok-poc/tree/redirect-to-search) branch of this repo.**

That said, a configuration using the openresty image, or a middleware built into Sourcegraph's frontend are still possabilities being investigated. 

