# Subresource Signing

You go to a website and the browser downloads an html page. That page requests other resources, _subresources_. Subresources can come from other servers, and we trust them implicitly, but they're a significant weak point. After reading about [Subresource Integrity](http://www.w3.org/TR/SRI/), I think I understand the problem, but think the solution can be improved. This repo is intended to become a prototype of an alternate solution.

## The Problem

We trust third party resources implicitly. A subverted host or CDN can be used to provide malicious JavaScript or images that can damage multiple web sites simultaneously. For example, an attacker with control of the JavaScript responsible for client-side encrypting credit card numbers could easily access the payment information for many customers without the main site ever knowing.

## The Official Proposal

The gist of the existing subresource integrity spec is to extend html elements with an `integrity` attribute that would contain a cryptographic hash of the representation of the resource to be fetched. The problem with that solution is that it requires you to calculate the hash explicitly for each resource, and to store it on the link for each resource. I expect that this will become cumbersome, particularly in agile environments that expect to be able to change their resources frequently.

## Signing Instead

Instead, I propose that developers cryptographically sign the resources they intend to use. A signed resource can be validated by a public key that can be made available to the client browser. The browser can validate the signature before agreeing to process that resource.

### Advantages

1. One private key can be used to sign multiple documents. It's the producer's signature, not the "file"'s.
2. One pair of keys can be used many times. You can re-sign when you legitimately change the resource.
3. You can disavow your public key if you need to rapidly prevent customers from using your signed resources.

### Prototype

The prototype consists of two signed JavaScript files. One has been modified after it was signed. Only the signed file should execute in the browser. The prototype uses [OpenPGPJs](http://openpgpjs.org), and requires a modern browser. Just view tests/index.html and view the browser console.

#### Browser
Chrome 11, Safari 3.1, Firefox 21 or newer should do nicely.

#### Vagrant

There's a Vagrantfile to make it easy: Just run `vagrant up` and then browse to http://localhost:8080. [Read more about Vagrant](https://docs.vagrantup.com/v2/) if you get stuck.
