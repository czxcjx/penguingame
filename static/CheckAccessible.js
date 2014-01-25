PlatformGraphNode = Class.extend({
	
	// Initialize variables
	init: function (platform){
		this.platform = platform;
		this.edgeArray = [];
		this.check = false;
	},
	
	// Push platformTo to the end of the array
	pushEdge: function (platformTo){
		this.edgeArray.push(platformTo);
	}
});

function checkAccessible(platformNetwork, maxHoriV, maxVertV, g, mu) {
	
	/* === Key Variables === */
	var maxY = (maxVertV*maxVertV)/(2*g);
	var networkSize = platformNetwork.length;

	var apexX, apexY, minTime, xIntercept;
	minTime = 1/mu * Math.log(mu/g*maxVertV +1);
	alert("minTime: " + minTime);
	apexX = maxHoriV * minTime;
	apexY = -g/mu*minTime + 1/mu*(maxVertV + g/mu)*(1-Math.exp(-mu*minTime));
	xIntercept = 1.2*apexX;
	alert("apexX: " + apexX + "\n apexY: " + apexY);
	
	/* === Build Graph === */
	
	// Initializing variables
	var currentHeight;
	var platformGraph = [];
	var platformGraphReverse = [];
	for (var i=networkSize-1; i>=0; i--){
		platformGraph.push(new PlatformGraphNode(platformNetwork[i]));
		platformGraphReverse.push(new PlatformGraphNode(platformNetwork[i]));
	}

	// Building edges
	for (var i=networkSize-1; i>=0; i--){
		currentHeight = platformNetwork[i].y;
		// Scanning all platforms up to currentHeight + maxY
		// Note: Account for self-check
		for (var j=networkSize-1; j>=0; j--){
			if (currentHeight - apexY > platformNetwork[j].y) break;
			if (j == i) continue;

			if (isReachable( platformNetwork[i], platformNetwork[j], apexX, apexY, xIntercept, maxHoriV, maxVertV, g, mu)){
				alert(i + "->" + j);
				platformGraph[i].pushEdge(j);
				platformGraphReverse[j].pushEdge(i);
			}
		}
	}
	
	// Reverse DFS
	// Trivial Case: If DFS did not reach all nodes
	var visitCount = []; visitCount.push(0);

	depthFirstSearch(platformGraphReverse, networkSize - 1, visitCount);
	if (networkSize > visitCount[0]) return false;	

	visitCount[0] = 0;
	depthFirstSearch(platformGraph, networkSize - 1, visitCount);
	if (networkSize > visitCount[0]) return false;
	
	return true;
}

function depthFirstSearch(platformGraph, i, visitCount){

	platformGraph[i].check = true;
	console.log(i);
	var index;
	for (var j=0; j<platformGraph[i].edgeArray.length; j++) {

		index = platformGraph[i].edgeArray[j];
		if (platformGraph[index].check == false) {
			depthFirstSearch(platformGraph, index, visitCount);
		}
	}

	visitCount[0]++;

}

function getY(vY, g, t){
	return (vY*t - 0.5*g*t*t);
}

function isReachable(startPlatform, endPlatform, apexX, apexY, xIntercept, maxHoriV, maxVertV, g, mu){
	
	/* === Key Variables === */
	
	var leftX1, rightX1, leftX2, rightX2, y1, y2;
	var horizontalDist, verticalDist;


	/* === Calculating Jump Distance - No Margin === */

	// Calling variables startPlatform: .leftX .rightX
	leftX1 = startPlatform.x;
	rightX1 = leftX1 + startPlatform.width;
	leftX2 = endPlatform.x;
	rightX2 = leftX2 + endPlatform.width;
	y1 = startPlatform.y;
	y2 = endPlatform.y;

	// startPlatform Distances to endPlatform	
	if (rightX1 <= leftX2) horizontalDist = leftX2 - rightX1;
	else if (leftX1 >= rightX2) horizontalDist = leftX1 - rightX2;
	else horizontalDist = 0;
	verticalDist = y1 - y2;
	alert(horizontalDist  + " , " + verticalDist);


	/* === Checking if endPlatform is reachable with a jump === */

	// Trivial Case: (1) endPlatform below startPlatform  (2) endPlatform too high
	if (horizontalDist == 0 && verticalDist < 0) return true;
	if (verticalDist * 0.7 > apexY) return false;

	// Trajectory Calculation
	// If the maxY reached after maxTime is higher than verticalDist, true.
	var time = horizontalDist/maxHoriV;
	var height = -g/mu*time + 1/mu*(maxVertV + g/mu)*(1-Math.exp(-mu*time));
	alert(height + "\n" + verticalDist);
	if (apexX >= horizontalDist) return true;
	else if (height*0.7 > verticalDist + 100) return true;
	else return false;

}
