# Overview

## Proof of Concept - This is not a supported Sourcegraph product
For customers migrating to Sourcegraph from another code search tool, ex. OpenGrok, one of the organizational change management hurdles is finding all of the links to the old tool and updating them with links to the same content in Sourcegraph. This repository is a proof of concept written for a migration from OpenGrok, which you can use as a starting point to build a URL redirection service, when deprecating your old code search tool, to redirect old links to the same content in your new Sourcegraph instance.

## Examples
| Search Type | OpenGrok URL      | Sourcegraph URL     |
|-------------------|-------------------|-------------------|
| View a file or directory | `/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/` | `/github.com/sourcegraph/sourcegraph/-/blob/client/web/src/enterprise/code-monitoring/testing/` |
| View File at specific hash | `/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/util.ts?r=b23a28ce` | `/github.com/sourcegraph/sourcegraph@b23a28ce/-/blob/client/web/src/enterprise/code-monitoring/testing/util.ts` |
| Search for `TODO` in Go files in path `cmd/` | `/source/search?project=sourcegraph&full=TODO&defs=&refs=&path=cmd%2F&hist=&type=golang&xrd=&nn=1` | `/search?q=lang%3Agolang file%3Acmd%2F repo%3A^github.com%2Fsourcegraph%2Fsourcegraph%24 TODO` |


# Deployment
- This can be deployed on a separate host and load balancer, or the same host and load balancer as your Sourcegraph instance if you configure the listening and forwarding port numbers accordingly
- Update the DNS record for your old code search tool to point to the host or load balancer where this container is running

## Docker Compose
1. List all of your OpenGrok projects and their corresponding repo names on your Sourcegraph instance, in the `map $opengrok_project $sourcegraph_repo { }` block the `nginx.conf` file
2. Modify the environment variables in `docker-compose.yaml` to match your OpenGrok and Sourcegraph instances
3. Run `docker-compose up -d`
4. Configure your network

## Installing on your own NGINX server
1. Ensure [`ngx_http_js_module`](https://nginx.org/en/docs/http/ngx_http_js_module.html#js_import) is installed on your NGINX server
2. Modify your `nginx.conf` configuration using the contents of `nginx.conf` and `docker-compose.yaml` in this repo as a reference


# Helpful Documentation
* [njs reference](https://nginx.org/en/docs/njs/reference.html)
* [njs examples](https://github.com/nginx/njs-examples)
* [source code for `ngx_http_js_module`](https://github.com/nginx/njs/blob/0.4.4/nginx/ngx_http_js_module.c)
