/**
*	jsonConverter library
*	requires jQuery
**/

//	namespace
var JSON_CONVERTER = JSON_CONVERTER || {};

JSON_CONVERTER.util = {
	/**
	*	Finds matching objects in an array who match a key->value pair.
	*
	*	@method			getMatchingObjects
	*	@param {Array}	array 	objects to search through
	*	@param {String}	key		object property to search for
	*	@param {String}	value 	object property value to match
	*	@return {array}			matching objects
	*/
	getMatchingObjects: function(array, key, value){
		console.log('getMatchingObjects: ', array, key, value);
		var matches = [];

		console.log(typeof key);

		for(var i in array){
			if(array[i].hasOwnProperty(key)){
				if(array[i][key] == value){
					matches.push(array[i]);
				};
			};
		};
		
		return matches;
	}
};

//	constructor for DataConverter object
JSON_CONVERTER.DataConverter = function(json){
	
	//	private variables
	var jsonObject,
		jsonValues = [];

	/**
	*	Initialization function.
	**/
	(function(t){
		console.log('init DataConverter');
		
		//	convert json to object
		jsonObject = $.parseJSON(json);

		//	cache all values to avoid crawling through huge JSON object repeatedly
		indexJSONValues();
		console.log(jsonValues);

		//	populate form fields
		populateFormFields();

	//		populate forms
	//			find all form fields
	//			pair fields with values
	})(this);

	/**
	*	Index the values and their location in the json object.
	*	
	*	@return {number}	values located and indexed
		{tableIndex: x, 
		tableName: x, 
		dataRowIndex: x, 
		cellInfoListIndex: x,
		fieldName: x,
		value: x}
	**/
	function indexJSONValues(){
		//	tables
		for(var tableindex in jsonObject){
			//console.log('> table: ' + tableindex + ', name: ' + jsonObject[tableindex].tableName);
			
			//	any dataRows?
			if(jsonObject[tableindex].dataRow.length > 0){
				//console.log('>> dataRows found: ' + jsonObject[tableindex].dataRow.length);
				
				//	loop through rows
				for(var dataRowIndex in jsonObject[tableindex].dataRow){
					//console.log('>>> dataRowIndex: ' + dataRowIndex);

					//	each dataRow should have a cellInfoList value
					//console.log('>>> cellInfoList found: ' + jsonObject[tableindex].dataRow[dataRowIndex].cellInfoList.length);
					
					//	cells
					for(var cellInfoListIndex in jsonObject[tableindex].dataRow[dataRowIndex].cellInfoList){
						var cell = jsonObject[tableindex].dataRow[dataRowIndex].cellInfoList[cellInfoListIndex];
						//console.log('>>>> cell: ' + jsonObject[tableindex].dataRow[dataRowIndex].cellInfoList[cellInfoListIndex].fieldName);

						//	data located, add to jsonValues
						jsonValues.push({
							tableIndex: tableindex, 
							tableName: jsonObject[tableindex].tableName, 
							dataRowIndex: dataRowIndex, 
							cellInfoListIndex: cellInfoListIndex,
							fieldName: cell.fieldName,
							value: cell.value
						});
					};
				};
			};
		};

		return jsonValues.length;
	};
	

	/**
	*	Populate all form fields with matching jsonObject data that match criteria.
	*
	*	@method		populateFormFields
	*	@param		{Array}		criteria	map of elements to match on
	*	@return 	{Number}	form fields updated
	**/
	function populateFormFields(){
		//	TODO	make the matching criteria flexible
		console.log('populateFormFields');
	};

	/**
	*	Find all matches in jsonValues using flexible criteria.
	*
	*	@method				findMatchesInJSONValues
	*	@param	{Array}		criteria	[0] = key, [1] = value (both as strings)
	*	@return	{Array}		matches found in jsonValues
	*	@example			[['tableName', 'TBCUSTOMERS'],['fieldName', 'PREV_ADDR1']]
	**/
	function findMatchesInJSONValues(criteria){
		console.log('findMatchesInJSONValues', criteria);
		var matches = [],
			possibleMatches = jsonValues;
		for(var i = 0; i < criteria.length; i++){
			console.log(criteria[i]);
			matches = JSON_CONVERTER.util.getMatchingObjects(possibleMatches, criteria[i][0], criteria[i][1]);
			possibleMatches = matches;
		};
		return matches;
	};

};



/*	testing	*/
var data;

$(function(){
	data = new JSON_CONVERTER.DataConverter(json);
});