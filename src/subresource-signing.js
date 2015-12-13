/**
 * Currently depends on openpgpjs.
 * http://openpgpjs.org
 */

var srs = {
    /**
     * Load a signed resource at the given url
     * signed in such a way that it can be validated
     * with the given public key.
     */
    load: function srs_load(pubkey, url) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onreadystatechange = function() {
            if (request.readyState !== 4) return;
            if (request.status !== 200) {
                throw this._.http_error(request.status);
            }
            console.log('Received response of type "' + request.responseType + '"');
            this._.validate(request.response, pubkey); // Throws error if invalid
            this._.attach_script(request.response);
        }
    },
    /**
     * Private-ish properties and methods
     */
    _: {
        /**
         * Assume the contents is valid, and attach the script
         * to the document so it runs.
         */
        attach_script: function srs_attach_script(contents) {
            var script_element = document.createElement('script');
            var script_text = document.createTextNode(contents);
            script_element.appendChild(script_text);
            document.head.appendChild(script_element);
        },

        /**
         * Return an error describing failure to load resource.
         */
        http_error: function srs_http_error(status, url) {
            var message = '';
            message += 'Subresource Signature JavaScript Loader failed to load';
            message += ' the resource at url "' + url + '". That server returned';
            message += ' a status of "' + status + '".';
            return message;
        },

        /**
         * Throw an error if the given signed content is invalid.
         */
        validate(content, pubkey) {
            var promise = openpgp.verifyClearSignedMessage(pubkey, content);
            console.log(promise);
        }
    }
};
