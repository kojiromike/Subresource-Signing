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
    load: function srs_load(armored_pubkey, url) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onreadystatechange = function() {
            if (this.readyState !== 4) return;
            if (this.status !== 200) {
                throw srs._.http_error(this.status);
            }
            srs._.validate(this.response, armored_pubkey); // Throws error if invalid
            srs._.attach_script(this.response);
        };
        request.send();
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
            var dearmored_contents = openpgp.cleartext.readArmored(contents).text;
            var script_element = document.createElement('script');
            var script_text = document.createTextNode(dearmored_contents);
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
        validate(content, armored_pubkey) {
            var signedCleartext = openpgp.cleartext.readArmored(content);
            var pubkey = openpgp.key.readArmored(armored_pubkey).keys;
            var promise = openpgp.verifyClearSignedMessage(pubkey, signedCleartext);
            console.log(promise);
        }
    }
};
