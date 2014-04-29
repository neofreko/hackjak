<?php
    require('vendor/autoload.php');

    use Everyman\Neo4j\Client,
    Everyman\Neo4j\Index\NodeIndex,
    Everyman\Neo4j\Relationship,
    Everyman\Neo4j\Node,
    Everyman\Neo4j\Traversal,
    Everyman\Neo4j\PathFinder,
    Everyman\Neo4j\Path;

    //$client = new Everyman\Neo4j\Client('localhost', 7474);
    // use these lines to connect to grpahenedb
    /*$client = new Everyman\Neo4j\Client('host',port);
    $client->getTransport()
      ->setAuth('dbname', 'key');*/

    print_r($client->getServerInfo());

    // use neo4j web console to locate the id for these sample node, or locate it using the neo4jphp api
    $startNode = $client->getNode(62); // terminal blok m
    $endNode = $client->getNode(76); // jl. supomo

    $path = $startNode->findPathsTo($endNode)
      //->setAlgorithm(PathFinder::AlgorithmDijkstra)
      ->setMaxDepth(10)
      ->setCostProperty('distance')
      ->setDefaultCost(2)
      //->getPaths()
      ->getSinglePath()
      ;

    // Loop through the nodes - the default
    $nodes = array();
    foreach ($path as $node) {
      $nodes[] = $node;
      //echo 'going thru ', $node->getProperty('name') . "\n";
    }


    //echo "The path is " . count($path) . " nodes long\n";

    // Loop through the relationships
    $usings = array();
    $path->setContext(Path::ContextRelationship);
    foreach ($path as $rel) {
      $usings[] = $rel;
      //echo 'using ', $rel->getProperty('using') . "\n";
    }

    // pretty print
    $i = 0;
    echo "From ";
    foreach($nodes as $node) {
      if ($i<count($nodes)-1) echo $node->getProperty('name');
      if (isset($nodes[$i+1])) {
        echo ' =( ', $usings[$i]->getProperty('using'),' )=> ', $nodes[$i+1]->getProperty('name');
      }
      $i++;
      echo "\n";
    }
