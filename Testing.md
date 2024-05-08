# Testing

1. Modify the environment variables in `docker-compose.yaml` to match your OpenGrok and Sourcegraph instances
2. Run `docker-compose up -d`
3. Modify the paths in the below OpenGrok curl commands to match code on your OpenGrok and Sourcegraph instances
4. Run the OpenGrok curl commands
5. Verify the output matches the expected Sourcegraph URL output
6. Open the link to verify the correct Sourcegraph page is shown


## NGINX rewrite for file/repo
```
curl -sS -i "localhost/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/" | grep -i location | sed 's/Location: //'
https://sourcegraph.com/github.com/sourcegraph/sourcegraph/-/blob/client/web/src/enterprise/code-monitoring/testing/
```

## NGINX rewrite for file/repo at revision
```
curl -sS -i "localhost/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/util.ts?r=b23a28ce" | grep -i location | sed 's/Location: //'
https://sourcegraph.com/github.com/sourcegraph/sourcegraph@b23a28ce/-/blob/client/web/src/enterprise/code-monitoring/testing/util.ts
```

## Test nginx.conf variable mapping OpenGrok projects to Sourcegraph repos
```
curl -sS -i "localhost/source/xref/gitlab" | grep -i location | sed 's/Location: //'
https://sourcegraph.com/gitlab.com/gitlab-org/gitlab
```

## OpenGrok "defs" search
```
curl -sS -i "localhost/source/search?full=&defs=OverwriteSettings&refs=&path=&hist=&type=&xrd=&nn=2&si=full&searchall=true&si=full" | grep -i location | sed 's/Location: //'
https://sourcegraph.com/search?q=type%3Asymbol%20OverwriteSettings
```

## OpenGrok "full" search
```
curl -sS -i "localhost/source/search?full=OverwriteSettings&refs=&path=&hist=&type=&xrd=&nn=2&si=full&searchall=true&si=full" | grep -i location | sed 's/Location: //'
https://sourcegraph.com/search?q=OverwriteSettings
```

## OpenGrok "full" search with project
```
curl -sS -i "localhost/source/search?project=sourcegraph&full=OverwriteSettings" | grep -i location | sed 's/Location: //'
https://sourcegraph.com/search?q=repo%3A%5Egithub.com%2Fsourcegraph%2Fsourcegraph%24%20OverwriteSettings
```
