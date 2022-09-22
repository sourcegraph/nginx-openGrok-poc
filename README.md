# nginx-openGrok-poc
This is an example proof of concept for an nginx server using the rewrite directive to transform common openGrok query urls (repo, file, symbol) to Sourcegraph query urls.

This is not a full fledged Sourcegraph deployment and is meant primarily as a proof of concept for rewrite rules to be employed in an nginx service in front of a [docker-compose](www.github.com/sourcegraph/deploy-sourcegraph-docker) Sourcegraph deployment. *Note currently Caddy is our standard proxy service for docker-compose Sourcegraph*
