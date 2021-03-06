/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const test = require('../base.js');

const ecdsaKey = require('fabric-shim-crypto/lib/ecdsa-key.js');

const jsrsa = require('jsrsasign');
const KEYUTIL = jsrsa.KEYUTIL;

test('ECDSA Key Impl tests', function (t) {
	t.throws(
		function () {
			new ecdsaKey();
		},
		/^Error: The key parameter is required by this key class implementation, whether this instance is for the public key or private key/,
		'ECDSA Impl test: catch missing key param'
	);

	t.throws(
		function () {
			new ecdsaKey('dummy private key');
		},
		/^Error: This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "type" property of value "EC"/,
		'ECDSA Impl test: catch missing key type of "EC"'
	);

	t.throws(
		function () {
			new ecdsaKey({type: 'RSA'});
		},
		/^Error: This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "type" property of value "EC"/,
		'ECDSA Impl test: catch invalid key type'
	);

	t.throws(
		function () {
			new ecdsaKey({type: 'EC', pubKeyHex: 'some random value'});
		},
		/^Error: This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "prvKeyHex" property/,
		'ECDSA Impl test: catch missing "prvKeyHex"'
	);

	t.throws(
		function () {
			new ecdsaKey({type: 'EC', prvKeyHex: null});
		},
		/^Error: This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "pubKeyHex" property/,
		'ECDSA Impl test: catch missing "pubKeyHex" property'
	);

	t.throws(
		function () {
			new ecdsaKey({type: 'EC', prvKeyHex: null, pubKeyHex: null});
		},
		/^Error: This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "pubKeyHex" property/,
		'ECDSA Impl test: catch "pubKeyHex" with null value'
	);


	t.doesNotThrow(
		function () {
			new ecdsaKey({type: 'EC', prvKeyHex: null, pubKeyHex: 'some random value'});
		},
		null,
		'ECDSA Impl test: test a valid key'
	);

	// test private keys
	let pair1 = KEYUTIL.generateKeypair('EC', 'secp256r1');
	let key1 = new ecdsaKey(pair1.prvKeyObj);

	t.doesNotThrow(
		function () {
			key1.toBytes();
		},
		null,
		'Checking that a private key instance allows toBytes()'
	);

	var pair2 = KEYUTIL.generateKeypair('EC', 'secp384r1');
	var key2 = new ecdsaKey(pair2.prvKeyObj);
	t.equal(key1.isPrivate() && key2.isPrivate(), true, 'Checking if key is private');

	t.equal(key1.getPublicKey().isPrivate(), false, 'Checking isPrivate() logic');
	t.equal(key1.getPublicKey().toBytes().length, 182, 'Checking toBytes() output');

	// test public keys
	var key3 = new ecdsaKey(pair1.pubKeyObj);

	t.doesNotThrow(
		function() {
			key3.toBytes();
		},
		null,
		'Checking to dump a public ECDSAKey object to bytes'
	);

	var key4 = new ecdsaKey(pair2.pubKeyObj);

	t.doesNotThrow(
		function() {
			key4.toBytes();
		},
		null,
		'Checking to dump a public ECDSAKey object to bytes'
	);

	t.equal(!key3.isPrivate() && !key4.isPrivate(), true, 'Checking if both keys are public');
	t.equal(key3.getPublicKey().isPrivate(), false, 'Checking getPublicKey() logic');
	t.equal(key4.getPublicKey().toBytes().length, 220, 'Checking toBytes() output');

	t.end();
});
