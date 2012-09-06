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
		var matches = [];

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
JSON_CONVERTER.DataConverter = function(json, fieldmatChingcriteria){
	
	//	private variables
	var jsonObject,
		jsonValues = []
		formFields = []
		fieldmatChingcriteria = fieldmatChingcriteria || [
			{jsonField: 'fieldName', formFieldAttribute: 'param2'},
			{jsonField: 'tableName', formFieldAttribute: 'param1'}];

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
		populateFormFields(fieldmatChingcriteria);

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
	*	@param		{Array}		matchingCriteria	map of elements to match on
	*							matchingCriteria = [{jsonField: 'fieldName', formFieldAttribute: 'param1'},
	*												{jsonField: 'tableName', formFieldAttribute: 'param2'}];
	*	@return 	{Number}	form fields updated
	**/
	function populateFormFields(matchingCriteria){
		console.log('populateFormFields');

		var matchableFormFields = getMatchableFields(matchingCriteria),
			matchInJSON;

		//	loop through fields to see if we have a coinciding value in the JSON
		for(var i in matchableFormFields){
			var jsonCriteria = convertDataMapToJSONFieldCriteria(matchingCriteria, matchableFormFields[i]);
			matchInJSON = findMatchesInJSONValues(jsonCriteria);
			
			if(matchInJSON.length === 0){
				continue;
			};

			//	TODO	Ask Sunill about how this should be handled.
			//			Should we compare the rows?
			if(matchInJSON.length > 1){
				//console.log('Warning: more than one matching dataRow found - using', matchInJSON[0]);
			};

			//	populate the data already
			matchableFormFields[i].value = matchInJSON[0].value;
			$(matchableFormFields[i]).css('background-color', 'red');

		};



	};

	/**
	*	Find all form fields that have the attributes required for data matching.
	*
	*	@method		getMatchableFields
	*	@param 		{map}		matchingCriteria	array of objects to match on
	*	@return		{Array}		form field elements
	**/
	function getMatchableFields(matchingCriteria){
		var matchable = [];

		//	identify all form fields
		$('input, textarea, select').each(function(index, element){
			//	identify fields that are matchable
			for(var m in matchingCriteria){
				var attr = $(element).attr(matchingCriteria[m].formFieldAttribute);
				if(attr === undefined || attr === ''){
					return;	//	jQuery method of "continue" within .each()
				};
			};
			matchable.push(element);
		});

		console.log('matchable field count: ' + matchable.length)
		return matchable;
	};

	/**
	*	Convert data map (forms & JSON) to array used in findMatchesInJSONValues.
	*
	*	@param 		{map}			map 		array of object mapping forms & JSON
	*	@param 		{DOMElement} 	formField 	HTML Element to pull attribute values from
	*	@return 	{Array}			suitable for passing into findMatchesInJSONValues
	*								[['tableName', 'TBCUSTOMERS'],['fieldName', 'PREV_ADDR1']]
	**/
	function convertDataMapToJSONFieldCriteria(map, formField){
		var JSONMap = [];
		for(var i in map){
			JSONMap.push([
						map[i].jsonField, 
						$(formField).attr(map[i].formFieldAttribute)
					]);
		};
		return JSONMap;
	};

	/**
	*	Find all matches in jsonValues using flexible criteria.
	*
	*	@method				findMatchesInJSONValues
	*	@param	{Array}		criteria	[0] = key, [1] = value (both as strings)
	*	@return	{Array}		matches found in jsonValues
	*						[['tableName', 'TBCUSTOMERS'],['fieldName', 'PREV_ADDR1']]
	**/
	function findMatchesInJSONValues(criteria){
		var matches = [],
			possibleMatches = jsonValues;
		for(var i = 0; i < criteria.length; i++){
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


	//	generate some fields
/*
cellInfoListIndex: "4"
dataRowIndex: "1"
fieldName: "machine_id"
tableIndex: "5"
tableName: "TBRECEIPTLIST"
value: "100"

cellInfoListIndex: "28"
dataRowIndex: "1"
fieldName: "first_name"
tableIndex: "4"
tableName: "TBRECLINELIST"
value: "JASON"
*/
/*
	var tag = ['input', 'textarea', 'select'],
		type = ['text', 'submit'],
		param1 = ['TBRECEIPTLIST', 'TBRECLINELIST', 'TBCUSTOMERS', ''],
		param2 = ['first_name', 'machine_id', 'PREV_ADDR1', ''],
		ofEachType = 4,
		i = 0;

	for(; i < ofEachType; i++){
		for(var j in tag){
			for(var k in type){
				for(var m in param1){
					for(var n in param2){
						var field = document.createElement(tag[j]);
						field.name = 'field_' + type[k] + '_' + i;
						field.type = type[k];
						document.body.appendChild(field);
						$(field)
							.attr('param1', param1[m])
							.attr('param2', param2[n]);
					};
				};
			};
		};
	};
*/

});