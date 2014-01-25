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
<<<<<<< HEAD
	//alert("minTime: " + minTime);
	apexX = maxHoriV * minTime;
	apexY = -g/mu*minTime + 1/mu*(maxVertV + g/mu)*(1-Math.exp(-mu*minTime));
	xIntercept = 1.2*apexX;
	//alert("apexX: " + apexX + "\n apexY: " + apexY);
=======
	alert("minTime: " + minTime);
	apexX = maxHoriV * minTime;
	apexY = -g/mu*minTime + 1/mu*(maxVertV + g/mu)*(1-Math.exp(-mu*minTime));
	xIntercept = 1.2*apexX;
	alert("apexX: " + apexX + "\n apexY: " + apexY);
>>>>>>> 1cf00daeacffc2e1560a89c3e5a85bfe61390cae
	
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
<<<<<<< HEAD
				//alert(i + "->" + j);
=======
				alert(i + "->" + j);
>>>>>>> 1cf00daeacffc2e1560a89c3e5a85bfe61390cae
				platformGraph[i].pushEdge(j);
				platformGraphReverse[j].pushEdge(i);
			}
		}
	}
	
	// Reverse DFS
	// Trivial Case: If DFS did not reach all nodes
<<<<<<< HEAD
	var visitSeq = [];
	
	for (var i = networkSize - 1; i >= 0; i--)
	{
		if (platformGraph[i].check == true)
		{
			continue;
		}
		else
		{
			depthFirstSearch(platformGraph, i, visitSeq);
		}
	}
	//console.log(visitSeq);
	if (networkSize != visitSeq.length)
	{
		console.log("Something went wrong when creating visitSeq array!");
	}
	var sccArray = [];
	for (var i = networkSize - 1; i >= 0; i--)
	{
		if (platformGraphReverse[i].check == true)
		{
			continue;
		}
		else
		{
			var singleScc = [];
			depthFirstSearch(platformGraphReverse, i, singleScc);
			//console.log(singleScc);
			sccArray.push(singleScc);
			//console.log(sccArray);
		}
	}
	
	
	// Portal Selection for non-SCC graph
	if (sccArray[0].length != networkSize)
	{
		var indexArray = [];
		for (var i = 0, n = sccArray.length; i < n; i++){
			//console.log(sccArray[i].length);
			var index1 = sccArray[i][Math.floor(Math.random() * sccArray[i].length)];
			var index2 = sccArray[i][Math.floor(Math.random() * sccArray[i].length)];
			while (index2 == index1 && sccArray[i].length != 1)
			{
				index2 = sccArray[i][Math.floor(Math.random() * sccArray[i].length)];
			}
			indexArray[i] = [index1, index2]; 
			// sets one direction portals from index1 (this scc) to index 2 (previous scc) 
			if (i != 0)
			{
				var previousIndex = indexArray[i-1][1];
				platformNetwork[index1].addPortal(platformNetwork[previousIndex]);
				//console.log(platformNetwork[index1], platformNetwork[previousIndex]);		
			}
		}
		// adds portal between first and last scc
		var currentIndex = indexArray[0][0];
		var previousIndex = indexArray[indexArray.length-1][1];
		platformNetwork[currentIndex].addPortal(platformNetwork[previousIndex]);
		//console.log(platformNetwork[currentIndex], platformNetwork[previousIndex]);		
		return false;
	}
	// only one scc, create 2 portals for fun
	else
	{
		for (var i = 0; i < platformNetwork.length * Constants.PORTAL_DENSITY; i++) {
			var indexArray = [];
			var index1 = sccArray[0][Math.floor(Math.random() * sccArray[0].length)];
			var index2 = sccArray[0][Math.floor(Math.random() * sccArray[0].length)];
			while (index2 == index1 && sccArray[0].length != 1)
			{
				index2 = sccArray[0][Math.floor(Math.random() * sccArray[0].length)];
			}
			indexArray[0] = [index1, index2]; 
			platformNetwork[index1].addPortal(platformNetwork[index2]);
		}
		return true;
	}
=======
	var visitCount = []; visitCount.push(0);

	depthFirstSearch(platformGraphReverse, networkSize - 1, visitCount);
	if (networkSize > visitCount[0]) return false;	

	visitCount[0] = 0;
	depthFirstSearch(platformGraph, networkSize - 1, visitCount);
	if (networkSize > visitCount[0]) return false;
>>>>>>> 1cf00daeacffc2e1560a89c3e5a85bfe61390cae
	
}

function depthFirstSearch(platformGraph, i, visitSeq){

	platformGraph[i].check = true;
	//console.log(i);
	var index;
	for (var j=0; j<platformGraph[i].edgeArray.length; j++) {

		index = platformGraph[i].edgeArray[j];
		if (platformGraph[index].check == false) {
			depthFirstSearch(platformGraph, index, visitSeq);
		}
	}

	visitSeq.push(i);

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
<<<<<<< HEAD
	//alert(horizontalDist  + " , " + verticalDist);
=======
	alert(horizontalDist  + " , " + verticalDist);
>>>>>>> 1cf00daeacffc2e1560a89c3e5a85bfe61390cae


	/* === Checking if endPlatform is reachable with a jump === */

	// Trivial Case: (1) endPlatform below startPlatform  (2) endPlatform too high
	if (horizontalDist == 0 && verticalDist < 0) return true;
	if (verticalDist * 0.7 > apexY) return false;

	// Trajectory Calculation
	// If the maxY reached after maxTime is higher than verticalDist, true.
	var time = horizontalDist/maxHoriV;
	var height = -g/mu*time + 1/mu*(maxVertV + g/mu)*(1-Math.exp(-mu*time));
<<<<<<< HEAD
	//alert(height + "\n" + verticalDist);
=======
	alert(height + "\n" + verticalDist);
>>>>>>> 1cf00daeacffc2e1560a89c3e5a85bfe61390cae
	if (apexX >= horizontalDist) return true;
	else if (height*0.7 > verticalDist + 100) return true;
	else return false;

}
