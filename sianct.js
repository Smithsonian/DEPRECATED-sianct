// Sidora Analysis API for Islandora
// file: sianis.js
// author: Gert Schmeltz Pedersen - gertsp45@gmail.com
/***************************************************************************************************/
		
function sianisOnload() {
	workflowName = ''; 
	speciesName = ' '; 
	obstablePids = '';
    $('#sianisStatusArea').html(sianisGetDateTime()+' Welcome!');
}

function sianisClear() {
	sianisClearMarkers();
	currentBBox.setMap(null);
	document.getElementById("sianisNorth").value = '';
	document.getElementById("sianisEast").value = '';
	document.getElementById("sianisSouth").value = '';
	document.getElementById("sianisWest").value = '';
	document.getElementById("sianisClearButton").disabled = "true";
	document.getElementById("sianisFindButton").disabled = "true";
	drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
	currentBBox = new google.maps.Rectangle(rectangleOptions);
	currentBBox.setMap(sianisMap);
	$('#sianisBottomArea').html('&#160;');
	$('#sianisStatusArea').html(sianisGetDateTime()+' clear');
	sianisSetRunWorkflowButton(document.getElementById("sianisWorkflow"));
}

function sianisFind() {
	var north = document.getElementById("sianisNorth").value;
	var east = document.getElementById("sianisEast").value;
	var south = document.getElementById("sianisSouth").value;
	var west = document.getElementById("sianisWest").value;
	var beginDate = document.getElementById("sianisBegin").value.replace(/\//g, '');
	var endDate = document.getElementById("sianisEnd").value.replace(/\//g, '');
    $('#sianisStatusArea').html(sianisGetDateTime()+' Finding observation tables ...');
	var url = '/sianis/find/'+south+'/'+west+'/'+north+'/'+east+'/'+beginDate+'/'+endDate;
	$('#sianisBottomArea').load(
			encodeURI(url)+' #sianisFindResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    $('#sianisStatusArea').html(sianisGetDateTime()+' Error: '+xhr.status+' '+xhr.statusText+sianisGetPreviousStatus());
				} else {
				    $('#sianisStatusArea').html(sianisGetDateTime()+' Found '+(document.getElementById("sianisFindCount")).textContent+' observation tables, see below'+sianisGetPreviousStatus());
					sianisSetMarkers();
				}
			}
	);
}

function sianisWorkflowSelected(selectWorkflowElement) {
	var i = selectWorkflowElement.selectedIndex;
	if (i == 0) {
		document.getElementById("sianisSelectObservationTables").style.display = "";
		document.getElementById("sianisSelectSpecies").style.display = "none";
		document.getElementById("sianisSpecies").selectedIndex = 0;
		speciesName = ' '; 
	}
	if (i == 1) {
		document.getElementById("sianisSelectObservationTables").style.display = "";
		document.getElementById("sianisSelectSpecies").style.display = "";
	}
	if (i>-1) {
		var selectedOptionElement = selectWorkflowElement.options[i];
		workflowName = selectedOptionElement.value;
	}
	sianisSetRunWorkflowButton(selectWorkflowElement);
}

function sianisSetRunWorkflowButton(selectWorkflowElement) {
	sianisGetObstables();
	if (selectWorkflowElement.selectedIndex == 0) {
		if (obstablePids=="") {
			document.getElementById("sianisRunWorkflowButton").disabled = "true";
		} else {
			document.getElementById("sianisRunWorkflowButton").disabled = "";
		}
	}
	if (selectWorkflowElement.selectedIndex == 1) {
		if (obstablePids=="" || speciesName==" ") {
			document.getElementById("sianisRunWorkflowButton").disabled = "true";
		} else {
			document.getElementById("sianisRunWorkflowButton").disabled = "";
		}
	}
}

function sianisSpeciesSelected(selectSpeciesElement) {
	var i = selectSpeciesElement.selectedIndex;
	if (i>-1) {
		var selectedOptionElement = selectSpeciesElement.options[i];
		speciesName = selectedOptionElement.value;
	}
	sianisSetRunWorkflowButton(document.getElementById("sianisWorkflow"));
}

function sianisGetObstables() {
	obstablePids = document.getElementById("sianisObstables").value;
}

function sianisGetDateTime() {
	return (new Date()).toLocaleString();
}

function sianisGetPreviousStatus() {
	return '<br/>'+$('#sianisStatusArea').html();
}

function sianisRun() {
	var workflowSelect = document.getElementById("sianisWorkflow");
	var workflowSelectedOption = workflowSelect.options[workflowSelect.selectedIndex];
	var workflowInit = sianisGetDateTime()+' Initializing Workflow: '+workflowSelectedOption.text+' ('+workflowSelectedOption.value+')';
	sianisGetObstables();
    $('#sianisStatusArea').html(workflowInit);
	document.getElementById("sianisStatusDiv").style.display = "";
	UUID = "";
	var url = '/gflow/gflowRun/'+workflowName;
	$('#sianisAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    $('#sianisStatusArea').html(sianisGetDateTime()+' Error: '+xhr.status+' '+xhr.statusText+sianisGetPreviousStatus());
				} else {
					if ($('#sianisAjaxArea').text().indexOf('GFLOW ERROR')>-1) {
					    $('#sianisStatusArea').html(sianisGetDateTime()+' '+$('#sianisAjaxArea').text()+sianisGetPreviousStatus());
					} else {
						UUID = $('#sianisAjaxArea').text();
					    $('#sianisStatusArea').html(sianisGetDateTime()+' Initialized : UUID='+UUID+sianisGetPreviousStatus());
					    inputs = new Array('pids_of_observation_tables', obstablePids);
					    if (speciesName != " ") {
					    	inputs.push('species_name');
					    	inputs.push(speciesName);
					    }
					    sianisSetInputs(UUID, inputs);
					}
				}
			}
	);
}

function sianisSetInputs(UUID, inputs) {
	var url = '/gflow/gflowSetInput/'+UUID+'/'+inputs.shift()+'/'+inputs.shift();
	$('#sianisAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    $('#sianisStatusArea').html(sianisGetDateTime()+' Error: '+xhr.status+' '+xhr.statusText+sianisGetPreviousStatus());
				} else {
					tavernaStatus = $('#sianisAjaxArea').text();
				    $('#sianisStatusArea').html(sianisGetDateTime()+' '+tavernaStatus+sianisGetPreviousStatus());
				    if (inputs.length > 0) {
					    sianisSetInputs(UUID, inputs);
				    } else {
				    	sianisSetStatus(UUID, 'Operating');
				    }
				}
			}
	);
}

function sianisSetStatus(UUID, newStatus) {
	var url = '/gflow/gflowSetStatus/'+UUID+'/'+newStatus;
	$('#sianisAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    $('#sianisStatusArea').html(sianisGetDateTime()+' Error: '+xhr.status+' '+xhr.statusText+sianisGetPreviousStatus());
				} else {
					tavernaStatus = $('#sianisAjaxArea').text();
				    $('#sianisStatusArea').html(sianisGetDateTime()+' '+tavernaStatus+sianisGetPreviousStatus());
				    if (tavernaStatus == 'Operating') {
				    	window.setTimeout("sianisWaitFinish(UUID)",3000);
				    } else {
					    if (tavernaStatus == 'Finished') {
					    	sianisWaitFinish(UUID);
					    } else {
						    $('#sianisStatusArea').html(sianisGetDateTime()+' Error:<BR/>'+$('#sianisAjaxArea').text()+sianisGetPreviousStatus());
					    }
				    }
				}
			}
	);
}

function sianisWaitFinish(UUID) {
	var url = '/gflow/gflowWaitFinish/'+UUID;
	$('#sianisAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    $('#sianisStatusArea').html(sianisGetDateTime()+' Error: '+xhr.status+' '+xhr.statusText+sianisGetPreviousStatus());
				} else {
					tavernaStatus = $('#sianisAjaxArea').text();
				    $('#sianisStatusArea').html(sianisGetDateTime()+' '+tavernaStatus+sianisGetPreviousStatus());
				    if (tavernaStatus == 'Operating') {
				    	window.setTimeout("sianisWaitFinish(UUID)",3000);
				    } else {
					    if (tavernaStatus == 'Finished') {
					    	sianisGetResult(UUID);
					    } else {
						    $('#sianisStatusArea').html(sianisGetDateTime()+' Error:<BR/>'+$('#sianisAjaxArea').text()+sianisGetPreviousStatus());
					    }
				    }
				}
			}
	);
}

function sianisGetResult(UUID) {
	var url = '/gflow/gflowGetResult/'+UUID;
	$('#sianisAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    $('#sianisStatusArea').html(sianisGetDateTime()+' Error: '+xhr.status+' '+xhr.statusText+sianisGetPreviousStatus());
				} else {
					if ($('#sianisAjaxArea').text().indexOf('GFLOW ERROR')>-1) {
					    $('#sianisStatusArea').html(sianisGetDateTime()+' '+$('#sianisAjaxArea').text()+sianisGetPreviousStatus());
					} else {
					    $('#sianisStatusArea').html('<a id="sianisResultButton" target="'+UUID+'" href="http://10.6.17.78:8080/taverna/rest/runs/'+UUID+'/wd/out/RESULT/1">Retrieve the Result</a><br/>'+sianisGetPreviousStatus());
					}
				}
			}
	);
}
