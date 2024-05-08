var query_string = require('querystring');

var opengrok = {
    /*
    This is an nginx handler for the ngx_http_js_module module.
    It handles rewriting OpenGrok search URLs to Sourcegraph query.
    # OpenGrok search
    /<root>/search
            ?project=sourcegraph
            &full=test
            &defs=
            &refs=run
            &path=
            &hist=
            &type=golang
            &xrd=
            &nn=1
            &si=refs
    */

    get_sourcegraph_repo_query_from_opengrok_project_nginx_mapping: function (request, opengrok_project) {

        /*
            Returns the sourcegraph repo: query for the given OG project
            Arguments:
                request - the JavaScript request object
                opengrok_project - the project name, to look up the mapping of opengrok_project to sourcegraph_repos in the nginx.conf.template file
            Returns:
                The mapped sourcegraph repo name in the format:
                repo:^<mapped value>$
                or empty string when no repo found in the mapping
            Side Effects:
                Logs warning if no mapped repo is found.
        */

        // This seems to be the input to the mapping?
        request.variables.opengrok_project = opengrok_project;

        // This seems to be the output from the mapping?
        if (request.variables.sourcegraph_repo) {

            return 'repo:^' + request.variables.sourcegraph_repo + '$';

        } else {

            request.warn('No sourcegraph_repo found in nginx.conf.template for opengrok_project "' + request.variables.opengrok_project + '"');
            return '';

        }

    },

    get_sourcegraph_query_from_opengrok_search: function (request) {

        /*
            Converts the opengrok /search URL to a Sourcegraph query
            Arguments:
                request - the JavaScript request object
            Returns:
                The equivalent Sourcegraph query
        */

        var query = '';
        var full_query = '';
        var type_set = false;
        var args = query_string.parse(request.variables.args);

        // OpenGrok type -> Sourcegraph lang:?
        if ('type' in args && args['type']) {

            // (query ? ' ' : '') checks if the query string has content; if yes, then add a space between; if no, then don't add a space
            query += (query ? ' ' : '') + 'lang:' + args['type'];
        }

        // OpenGrok path -> Sourcegraph file:
        if ('path' in args && args['path']) {
            query += (query ? ' ' : '') + 'file:' + args['path'];
        }

        // OpenGrok project -> Sourcegraph repo:
        if ('project' in args && args['project']) {

            // If the search is only for a single project
            if (!Array.isArray(args['project'])) {

                var q = opengrok.get_sourcegraph_repo_query_from_opengrok_project_nginx_mapping(request, args['project']);
                if (q) query += (query ? ' ' : '') + q;

            } else {

                // If the search is for multiple projects

                var repos = [];

                for (var p in args['project']) {
                    var q = opengrok.get_sourcegraph_repo_query_from_opengrok_project_nginx_mapping(request, args['project'][p]);
                    if (q) repos.push(q);
                }

                if (repos.length == 1) {
                    query += (query ? ' ' : '') + repos;

                } else if (repos.length > 1) {
                    // should be (repo:x OR repo:y ...)
                    query += (query ? ' ' : '') + '(' + repos.join(' OR ') + ')';
                }
            }
        }

        // OpenGrok hist -> Sourcegraph type:commit
        if ('hist' in args && args['hist']) {
            query += (query ? ' ' : '') + 'type:commit ' + args['hist'];
            type_set = true;
        }

        // OpenGrok refs -> Sourcegraph type:symbol
        // In both OpenGrok and (Sourcegraph), history (commit) searches take precedence over refs (symbol) searches
        if ('refs' in args && args['refs']) {

            if ('hist' in args && args['hist']) {

                // We already have a commit search, and now a symbol search, so keep type:commit
                query += (query ? ' ' : '') + args['refs'];

            } else {
                query += (query ? ' ' : '') + 'type:symbol ' + args['refs'];
                type_set = true;
            }
        }

        // 'defs' in OpenGrok will search for a symbol's definition and take you there; just search for the symbol for now
        // OpenGrok defs -> Sourcegraph type:symbol
        if ('defs' in args && args['defs']) {

            query += (query ? ' ' : '') + 'type:symbol ' + args['defs'];
            type_set = true;

        }

        /*
            Not sure what this means:
            // type:symbol should be guarded by an AND operation
            The code previously set type_set = true for both type:symbol and type:commit
        */
        // If the OpenGrok user used the "Full query" field, use their input as the Sourcegraph search query
        if ('full' in args && args['full']) {

            full_query = args['full'];

            // If we're specifying a search type: parameter in this query
            if (type_set) {

                // Put the whole existing query into brackets, then AND it with the full query
                query = '(' + query + ') AND ' + full_query;

            } else {

                // Otherwise, just append the full query content
                query += (query ? ' ' : '') + full_query;

            }

        }

        return query;

    },

    search: function (request) {

        /*
            ngx_http_js_module handler
        */

        // Convert the OpenGrok path to a Sourcegraph path
        var sourcegraph_query = opengrok.get_sourcegraph_query_from_opengrok_search(request);

        // Redirect the user to the Sourcegraph server with this search query
        request.return(301, request.variables.sourcegraph_url + '/search?' + query_string.stringify({ 'q': sourcegraph_query }));

        // Return 0 to indicate OK
        return 0;

    }

}

export default { opengrok };
