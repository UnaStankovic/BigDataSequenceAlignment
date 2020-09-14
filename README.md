# BigDataSequenceAlignment

This project is a part of my PhD studies in the field of Bioinformatics at Faculty of Mathematics, University of Belgrade. The project is big data sequence alignment cluster using CouchDB.

Firstly, get couchDB, node, react.
Secondly, setup npm with:

- nano
- restify
- uuid


To run the program:
1. in src folder run: 
`node app.js (set the name of the database in the proper place and also the node address)`
2. in front folder run: `npm start`
3. run couchDB and make a cluster - setup CouchDB to work on 2-3 nodes and create database. Very important step is to setup addresses of nodes in vm.args in couchdbx-core folder! Also, put the same address in CouchDB app in settings/bind_address. These should be done in all nodes in the network. Check the addresses with ifconfig in the terminal. This step may fail couple of times due to CouchDB, but make sure you changed vm.args and you are logged in properly.
  Create a non-partitioning database within CouchDB UI.

  Database import is done with module: https://github.com/glynnbird/couchimport
```
sudo npm install -g couchimport 
export COUCH_URL="http://admin:admin@192.168.0.13:5984" (<- your node address)
export COUCH_DATABASE="sequences_data" (<- name of the database you already created! Also setup this database name in src/app.js)
export COUCH_DELIMITER="," 
cat records_file.csv | couchimport
```
4. insert the sequence into the field in the app and click on the send button the output should appear in the bottom.


