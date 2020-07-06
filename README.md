# BigDataSequenceAlignment

This project is a part of my PhD studies at Faculty of Mathematics, University of Belgrade. The project is big data sequence alignment cluster using CouchDB.

Firstly, setup CouchDB to work on 2-3 nodes and create database. Very important step is to setup addresses of nodes in vm.args in couchdbx-core folder! Check addresses with ifconfig in the terminal.

Create a non-partitioning database within CouchDB UI.

Database import is done with module: https://github.com/glynnbird/couchimport

sudo npm install -g couchimport export COUCH_URL="http://admin:admin@192.168.0.13:5984"

export COUCH_DATABASE="sequences_data" export COUCH_DELIMITER="," cat records_file.csv | couchimport

Secondly, setup npm with:

nano
restify
uuid
