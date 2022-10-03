/*
 * This is an nginx handler for the ngx_http_js_module module.
 * It handles rewriting OpenGrok search URLs to Sourcegraph query. 
 *    # OpenGrok search
 *    /<root>/search
 *         ?project=sourcegraph
 *         &full=test
 *         &defs=
 *         &refs=run
 *         &path=
 *         &hist=
 *         &type=golang
 *         &xrd=
 *         &nn=1
 *         &si=refs
 *         &si=refs
 */
var qs = require('querystring');
var OpenGrok2Sourcegraph = {

    /**
     * converts the opengrok /search URL to a Sourcegraph query
     * Arguments:
     *    r - the request object
     * returns:
     *   the Sourcegraph query
     */
    sg_query_from_opengrok_search: function (r) {
        var query = '';
        var full_query = '';
        var type_set = false;
        var args = qs.parse(r.variables.args);

        if ('full' in args && args['full']) {
            full_query = args['full'];
        }
        if ('type' in args && args['type']) {
            query += (query ? ' ' : '') + 'lang:' + args['type'];
        }
        if ('path' in args && args['path']) {
            query += (query ? ' ' : '') + 'file:' + args['path'];
        }
        if ('project' in args && args['project']) {
            r.variables.og_project = args['project'];
            query += (query ? ' ' : '') + 'repo:^' + r.variables.sg_repo + '$';
        }
        // in both opengrok and sourcegraph "commit"/"history" searches take
        // presidence over "symbol"/"refs" searches
        if ('hist' in args && args['hist']) {
            query += (query ? ' ' : '') + 'type:commit ' + args['hist'];
            type_set = true;
        }
        if ('refs' in args && args['refs']) {
            if (type_set) {
                // we have both a commit search and symbol so assume both refer to commit
                query += (query ? ' ' : '') + args['refs'];
            } else {
                query += (query ? ' ' : '') + 'type:symbol ' + args['refs'];
            }
        }

        // defs in opengrok will search for a symbol's definition and take you there
        // i'm not sure how to replicate that here just yet.  leaving as TODO

        // type:symbol should be guarded by an AND operation
        if (full_query) {
            if (type_set) {
                query = '(' + query + ') AND ' + full_query;
            } else {
                query += (query ? ' ' : '') + full_query;
            }
        }
        return query;
    },
    
    /**
     * ngx_http_js_module handler
     * add:
     *    js_content opengrok_rewrite_handler.OpenGrok2Sourcegraph.HandleSearch;
     * to your location section
     * TODO: add more details
     */
    HandleSearch: function(r) {
        var sgq = OpenGrok2Sourcegraph.sg_query_from_opengrok_search(r);

        r.return(301, r.variables.SOURCEGRAPH_URL + '?' + qs.stringify({'q': sgq}));

        return 0;
    }
}


export default {OpenGrok2Sourcegraph};
