
## Generic rewrite for file/repo and file/repo at revision
OpenGrok URL
curl -sS -i localhost/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/ | grep -i location

Sourcegraph URL
https://sourcegraph.com/github.com/sourcegraph/sourcegraph/-/blob/client/web/src/enterprise/code-monitoring/testing/

### Revision
OpenGrok URL
localhost/source/xref/sourcegraph/client/web/src/enterprise/code-monitoring/testing/util.ts?r=b23a28ce | grep -i location

Sourcegraph URL
https://sourcegraph.com/github.com/sourcegraph/sourcegraph@04cf0cb07327c01141fad5eb9707600c7eb806c2/-/blob/client/web/src/enterprise/code-monitoring/testing/util.ts

## Map test
OpenGrok URL
curl -sS -i localhost/source/xref/gitlab | grep -i location

Sourcegraph URL
https://www.sourcegraph.com/gitlab.com/gitlab-org/gitlab

## Generic search test case
OpenGrok URL
curl -sS -i localhost/source/search?full=&defs=OverwriteSettings&refs=&path=&hist=&type=&xrd=&nn=2&si=full&searchall=true&si=full | grep -i location

Sourcegraph URL
https://sourcegraph.com/search?q=context:global+repo:%5Egithub%5C.com/sourcegraph/sourcegraph%24+type:symbol+OverwriteSettings&patternType=lucky