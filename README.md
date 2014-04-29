hackjak
=======

imports trayek data into neo4j database and figuring out shortest path between point of interest

There is no fancy technique here. We are only going to use neo4j as a graph database to solve routing problem.

You can import the data using import.js, or use included neo4j data dump in data/. After that, we can play with shortest-route.php.

Setup
====
$ npm install
$ composer install
