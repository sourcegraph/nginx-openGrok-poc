# Overview
This repository contains configuration for nginx that will transform common OpenGrok URLL patterns to Sourcegraph URLs.


## Examples

| Search Type | OpenGrok URL      | Sourcegraph URL     |
|-------------------|-------------------|-------------------|
| View a file or directory | `/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/` | `/github.com/sourcegraph/sourcegraph/-/blob/client/web/src/enterprise/code-monitoring/testing/` |
| View File at specific hash` | `/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/util.ts?r=b23a28ce` | `/github.com/sourcegraph/sourcegraph@b23a28ce/-/blob/client/web/src/enterprise/code-monitoring/testing/util.ts` |
| Search for `TODO` in Go files in path `cmd/` | `/source/search?project=sourcegraph&full=TODO&defs=&refs=&path=cmd%2F&hist=&type=golang&xrd=&nn=1` | `/search?q=lang%3Agolang file%3Acmd%2F repo%3A^github.com%2Fsourcegraph%2Fsourcegraph%24 TODO` |


# Installation

## Prerequisites

Your nginx installation must have [`ngx_http_js_module`](https://nginx.org/en/docs/http/ngx_http_js_module.html#js_import) installed.  The code assumes you have [v0.4.4](https://nginx.org/en/docs/njs/changes.html#njs0.4.4).

## Steps

(If these files are not placed in the same locaiton as `nginx.conf` be sure to adjust the path to the `js_import`.)

1. Open `opengrokrewrite.conf` and update the `map $og_project $sg_repo` with the projects in your OpenGrok deployment.
2. Add `opengrok_rewrite_handler.js` to your nginx configuration directory.
3. Add `opengrokrewrite.conf` to your nginx configuration directory.

# Configuration

This nginx configuration requires some configuration be provided.

## nginx.conf

In your `nginx.conf` configuration, add :

```
...
load_module modules/ngx_http_js_module.so;
...
http {
  ...
    # create a top level variable for SOURCEGRAPH_URL (update to match your environment)
    map "" $SOURCEGRAPH_URL {
        default "http://sourcegraph.mikemclaughlin.org:7080";
    }
    # map OpenGrok projects to Sourcegraph repos
    # volatile is required to match multiple projects in URL
    map $og_project $sg_repo {
        volatile;
        sourcegraph "github.com/sourcegraph/sourcegraph";
    }

    js_import opengrok_rewrite_handler.js;
   ...
}
```

In the `server` configuration for the host that will be receiving the OpenGrok requests add:

```
server {
...
    include "opengrok_rewrite.conf";
...
}

```

# Helpful Documentation

* [njs reference](https://nginx.org/en/docs/njs/reference.html)
* [source code for `ngx_http_js_module`](https://github.com/nginx/njs/blob/0.4.4/nginx/ngx_http_js_module.c)
* [njs examples](https://github.com/nginx/njs-examples)

http://localhost:8090/source/search?project=sourcegraph&full=test&defs=&refs=&path=dev&hist=&type=typescript&xrd=&nn=1
