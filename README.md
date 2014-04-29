hackjak
=======

imports trayek data into neo4j database and figuring out shortest path between point of interest

There is no fancy technique here. We are only going to use neo4j as a graph database to solve routing problem.

You can import the data using import.js, or use included neo4j data dump in data/. After that, we can play with shortest-route.php.

![imported data](https://api.monosnap.com/image/download?id=bGXREGXHmsTDJ48n3wxXiHl5xdM15A)

Setup
====
$ npm install
$ composer install

Sample output
====
````
$ php shortest-route.php
From Term. Blok M =( C137A )=> Jl. Patimura
Jl. Patimura =( AC21 )=> Jl. Sudirman
Jl. Sudirman =( P45 )=> Jl. Gatot Subroto
Jl. Gatot Subroto =( P116 )=> Jl. Supomo
````
