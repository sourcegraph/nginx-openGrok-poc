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
     * very simple helper function that
     * appends the given value to the string with a delimiter between if 
     * something already exists
     */
    append_to_query: function(query, value) {
        if (query) {
            query = query + ' ';
        }
        return query + value;
    },

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
        if ('full' in r.args && r.args['full']) {
            full_query = r.args['full'];
        }
        if ('type' in r.args && r.args['type']) {
            query = OpenGrok2Sourcegraph.append_to_query(query, 'lang:' + r.args['type']);
        }
        if ('path' in r.args && r.args['path']) {
            query = OpenGrok2Sourcegraph.append_to_query(query, 'file:' + r.args['path']);
        }
        if ('project' in r.args && r.args['project']) {
            r.variables.og_project = r.args['project'];
            query = OpenGrok2Sourcegraph.append_to_query(query, 'repo:^' + r.variables.sg_repo) + '$';
        }
        // in both opengrok and sourcegraph "commit"/"history" searches take
        // presidence over "symbol"/"refs" searches
        if ('hist' in r.args && r.args['hist']) {
            query = OpenGrok2Sourcegraph.append_to_query(query, 'type:commit ' + r.args['hist']);
            type_set = true;
        }
        if ('refs' in r.args && r.args['refs']) {
            if (type_set) {
                // we have both a commit search and symbol so assume both refer to commit
                query = OpenGrok2Sourcegraph.append_to_query(query, r.args['refs']);
            } else {
                query = OpenGrok2Sourcegraph.append_to_query(query, 'type:symbol ' + r.args['refs']);
            }
        }

        // defs in opengrok will search for a symbol's definition and take you there
        // i'm not sure how to replicate that here just yet.  leaving as TODO

        // type:symbol should be guarded by an AND operation
        if (full_query) {
            if (type_set) {
                query = '(' + query + ') AND ' + full_query;
            } else {
                query = OpenGrok2Sourcegraph.append_to_query(query, full_query);
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

        r.return(301, r.variables.SOURCEGRAPH_URL + '?q=' + qs.escape(sgq));

        return 0;
    }
}


export default {OpenGrok2Sourcegraph};
