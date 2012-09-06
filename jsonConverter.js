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


/**
*	constructor for DataConverter
*
*	@param 	{string} 	json 			well-formed JSON
*	@param 	{map} 		fieldMapping	map used to relate form fields to JSON data (optional)
*	@class 		DataConverter
**/
JSON_CONVERTER.DataConverter = function(json, fieldMapping){
	//	TODO	Consider storing this instance and using the Singleton pattern.
	//			I don't know if there will ever be a need for more than one instance.
	
	//	private variables
	var jsonObject,
		jsonValues = [],
		fieldMapping = fieldMapping || [
			{jsonField: 'fieldName', formFieldAttribute: 'param2'},
			{jsonField: 'tableName', formFieldAttribute: 'param1'}],
		matchableFormFields = [];


	/**
	*	Initialization function.
	**/
	(function(t){
		
		//	convert json to object
		jsonObject = $.parseJSON(json);

		//	cache all values to avoid crawling through huge JSON object repeatedly
		indexJSONValues();

		//	identify matchable fields (those with the attributes needed for mapping)
		matchableFormFields = getMatchableFields(fieldMapping);

		//	populate form fields
		populateFormFields(fieldMapping);

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

		var matchInJSON;

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
			switch(matchableFormFields[i].type){
				case 'textarea':
					matchableFormFields[i].innerHTML = matchInJSON[0].value;
					break;
				case 'text':
					matchableFormFields[i].value = matchInJSON[0].value;
					break;
				case 'input':
				case 'submit':
					//	don't try and change these
					break;
				default:
					//	This will catch select fields and anything else that was missed.
					$(matchableFormFields[i]).val(matchInJSON[0].value);
			};
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

	/*****************************/
	//	public API
	/*****************************/
	return {

		//	debugging tools

		getJSON: function(){
			return jsonObject;
		},
		getIndexedJSON: function(){
			return jsonValues;
		},
		getMatchableFields: function(){
			return getMatchableFields(fieldMapping);
		},
		showMatchableFields: function(){
			var fields = this.getMatchableFields();
			$(fields).css({'background-color': '#70FF00', 'border': '3px dotted blue'});
			return fields;
		},

		/**
		*
		*	@param	{object} 	formField 		DOM element to lookup match for
		*	@param 	{map} 		fieldMapping 	(optional) - current mapping is used if not provided
		**/
		getMatchFromIndexedJSON: function(formField, fieldMap){
			var fieldMap = fieldMap || fieldMapping;
			console.log('looking for match in indexed JSON for ', formField);
			console.log('using mapping ', fieldMap);
			/*
			var jsonCriteria = convertDataMapToJSONFieldCriteria(matchingCriteria, matchableFormFields[i]);
			matchInJSON = findMatchesInJSONValues(jsonCriteria);
			*/

			return;
		},

		//	permanent API

		save: function(){

		}	

	};
};



/*	testing implementation	*/
var data;

$(function(){
	data = new JSON_CONVERTER.DataConverter(json);
});