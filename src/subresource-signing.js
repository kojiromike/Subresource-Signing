/**
 * Currently depends on openpgpjs.
 * http://openpgpjs.org
 */

var srs = {
    /**
     * Load a signed resource at the given url
     * signed in such a way that it can be validated
     * with the given public key.
     *
     * IMPORTANT: This only accepts JavaScript files in *.js.asc cleartext signed message format. It does not load the
     * actual JavaScript file, only clear contents within the *.js.asc file itself if it validates.
     *
     * @param armored_pubkey
     * @param url
     * @returns {Promise}
     */
    load: function(armored_pubkey, url) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', url);
            request.onreadystatechange = function() {
                if (this.readyState !== 4) return;
                if (this.status !== 200) {
                    reject(srs._.http_error(this.status));
                } else {
                    var promise = srs._.validate(this.response, armored_pubkey);
                    promise.then(function(data) {
                        // Consider the entire response invalid if any of the signatures are not valid.
                        var valid = data.signatures.filter(sig => sig.valid).length == data.signatures.length;
                        if (!valid) {
                            var message = 'The file at "' + url + '" does not have a valid signature.';
                            message += ' Refusing to load that file!';
                            reject(message);
                        } else {
                            srs._.attach_script(data.text);
                            resolve({
                                url,
                                gpg: data
                            });
                        }
                    });
                }
            };
            request.send();
        });
    },

    /**
     * Private-ish properties and methods
     */
    _: {
        /**
         * Assume the contents is valid, and attach the script
         * to the document so it runs.
         *
         * @param contents
         */
        attach_script: function(contents) {
            var script_element = document.createElement('script');
            var script_text = document.createTextNode(contents);
            script_element.appendChild(script_text);
            document.head.appendChild(script_element);
        },

        /**
         * Return an error describing failure to load resource.
         *
         * @param status
         * @param url
         * @returns {string}
         */
        http_error: function(status, url) {
            var message = '';
            message += 'Subresource Signature JavaScript Loader failed to load';
            message += ' the resource at url "' + url + '". That server returned';
            message += ' a status of "' + status + '".';
            return message;
        },

        /**
         * Return the openpgp promise to verify the message.
         *
         * @param content
         * @param armored_pubkey
         * @returns {Promise}
         */
        validate(content, armored_pubkey) {
            var signedCleartext = openpgp.cleartext.readArmored(content);
            var pubkey = openpgp.key.readArmored(armored_pubkey).keys;
            return openpgp.verifyClearSignedMessage(pubkey, signedCleartext);
        }
    }
};
