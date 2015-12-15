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
            var promise = srs._.validate(this.response, armored_pubkey);
            promise.then(function(data) {
                // Consider the entire response invalid if any of the signatures are not valid.
                var valid = data.signatures.filter(sig => sig.valid).length < data.signatures.length;
                if (!valid) {
                    var message = 'The file at "' + url + '" does not have a valid signature.';
                    message += ' Refusing to load that file!';
                    throw message;
                }
                srs._.attach_script(data.text);
            });

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
         * Return the openpgp promise to verify the message.
         */
        validate(content, armored_pubkey) {
            var signedCleartext = openpgp.cleartext.readArmored(content);
            var pubkey = openpgp.key.readArmored(armored_pubkey).keys;
            var promise = openpgp.verifyClearSignedMessage(pubkey, signedCleartext);
            return promise;
        }
    }
};
