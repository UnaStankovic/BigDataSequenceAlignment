#!/bin/bash
DATABASE=$1
FILE=$2
ADDRESS=$(ifconfig | grep -Eo 192.168.[0-9]+.[0-9]+ | head -n1)
export COUCH_URL="http://admin:admin@$ADDRESS:5984"
export COUCH_DATABASE=$DATABASE
export COUCH_DELIMITER="," 
cat $FILE | couchimport