<?php

// Sidora Analysis API for CameraTrap
// file: SIANCT.inc
// author: Gert Schmeltz Pedersen gertsp45@gmail.com

class SIANCT {

  function SIANCT() {
  }

  function sianctGetProjectStructure($xslt) {
		global $user;
	 	$datestamp = date('Y-m-d H:i:s');
 		$logdatestamp = date('Y-m-d');
		$logfp = fopen('/tmp/sianct-' . $logdatestamp . '.log', 'a');
		fwrite($logfp, "\n\n[$datestamp] $user->name sianctGetProjectStructure: xslt=$xslt ");
    $solrUrl = variable_get('sianct_block_solr','noSolrUrl');
    $solrMax = variable_get('sianct_block_solr_max','1000');
    $solrXslt = $xslt;
    if ($xslt == '' || $xslt == 'default') {
    	$solrXslt = variable_get('sianct_block_solr_xslt_tree','none');
    }
    $xsltParams =  '';
    if ($solrXslt != 'none') {
    	$xsltParams = '&wt=xslt&tr=' . $solrXslt;
    }
    $q = 'PID:si*';
	$command = 'curl --silent "' . $solrUrl . '/gsearch_sianct/select?q=' . $q . '&sort=projectPID+asc,parkPID+asc,sitePID+asc,ctPID+asc,PID+asc&version=2.2&start=0&rows=' . $solrMax . '&indent=on' . $xsltParams . '" 2>&1';
		fwrite($logfp, "\n[$datestamp] command: $command");
	$curlResult = shell_exec($command);
	 	$datestamp = date('Y-m-d H:i:s');
	 	$logString = substr($curlResult,0,600) . '...';
		fwrite($logfp, "\n[$datestamp] $user->name curlResult: $logString");
		fclose($logfp);
	print $curlResult;
	module_invoke_all('exit');
	exit();
  }

  function sianctGetCsvWithProjectStructure($obstablePid) {
		global $user;
	 	$datestamp = date('Y-m-d H:i:s');
 		$logdatestamp = date('Y-m-d');
		$logfp = fopen('/tmp/sianct-' . $logdatestamp . '.log', 'a');
		fwrite($logfp, "\n\n[$datestamp] $user->name sianctGetCsvWithProjectStructure: obstablePid= $obstablePid");
    $solrUrl = variable_get('sianct_block_solr','noSolrUrl');
    $xsltParams =  '&wt=xslt&tr=sianctProjectStructureToCsv.xslt';
	$command = 'curl --silent "' . $solrUrl . '/gsearch_sianct/select?q=PID:%22' . $obstablePid . '%22&version=2.2' . $xsltParams . '" 2>&1';
		fwrite($logfp, "\n[$datestamp] command: $command");
	$solrResult = shell_exec($command);
	 	$datestamp = date('Y-m-d H:i:s');
		fwrite($logfp, "\n[$datestamp] $user->name solrResult: $solrResult");
    $fedoraUrl = variable_get('sianct_block_fedora', 'nofedoraurl');
    $fedoraUserPass = variable_get('sianct_block_fedora_userpass', 'nofedorauser:password');
	$command = 'curl --silent -u ' . $fedoraUserPass . ' "' . $fedoraUrl . '/objects/' . $obstablePid . '/datastreams/CSV/content" 2>&1';
		fwrite($logfp, "\n[$datestamp] $user->name command: $command");
	$csvResult = shell_exec($command);
		$datestamp = date('Y-m-d H:i:s');
//		fwrite($logfp, "\n[$datestamp] $user->name csvResult: \n$csvResult");
	$lines = explode("\n", $csvResult);
//		fwrite($logfp, "\n[$datestamp] $user->name lines: $lines");
	$countLines=count($lines);
		fwrite($logfp, "\n[$datestamp] $user->name csv countLines: $countLines");
	$csvWithProjectStructure = '';
	for($j=0;$j<=$countLines;$j++) {
		$line = trim($lines[$j]);
//			fwrite($logfp, "\n[$datestamp] $user->name line $j: $line");
		if ($line) {
			$csvWithProjectStructure = $csvWithProjectStructure . $solrResult . ',' . $line . '
';
		}
	}
	print $csvWithProjectStructure;
	module_invoke_all('exit');
	exit();
  }

  function sianctGetSpecies($obstablePids) {
		global $user;
	 	$datestamp = date('Y-m-d H:i:s');
 		$logdatestamp = date('Y-m-d');
		$logfp = fopen('/tmp/sianct-' . $logdatestamp . '.log', 'a');
		fwrite($logfp, "\n\n[$datestamp] $user->name sianctGetSpecies: obstablePids= $obstablePids");
	if (!$obstablePids) {
    	$solrUrl = variable_get('sianct_block_solr','noSolrUrl');
    	$xsltParams =  '&wt=xslt&tr=sianctGetObstablePids.xslt';
		$command = 'curl --silent "' . $solrUrl . '/gsearch_sianct/select?q=PID:si*&rows=1000&version=2.2' . $xsltParams . '" 2>&1';
			fwrite($logfp, "\n[$datestamp] command: $command");
		$obstablePids = shell_exec($command);
	}
    $fedoraUrl = variable_get('sianct_block_fedora', 'nofedoraurl');
    $fedoraUserPass = variable_get('sianct_block_fedora_userpass', 'nofedorauser:password');
	$speciesnames = array();
	$obstablePidArray = explode(",", $obstablePids);
	$countPids=count($obstablePidArray);
	$countObsLines = 0;
	for($i=0;$i<$countPids;$i++) {
	 	$datestamp = date('Y-m-d H:i:s');
		$obstablePid = trim($obstablePidArray[$i]);
		$command = 'curl --silent -u ' . $fedoraUserPass . ' "' . $fedoraUrl . '/objects/' . $obstablePid . '/datastreams/CSV/content" 2>&1';
			fwrite($logfp, "\n[$datestamp] $user->name command: $command");
		$curlResult = shell_exec($command);
//			fwrite($logfp, "\n[$datestamp] $user->name curlResult: $curlResult");
		$lines = explode("\n", $curlResult);
//			fwrite($logfp, "\n[$datestamp] $user->name lines: $lines");
		$countLines=count($lines);
			fwrite($logfp, "\n[$datestamp] $user->name countLines: $countLines");
		for($j=1;$j<=$countLines;$j++) {
			$line = $lines[$j];
			fwrite($logfp, "\n[$datestamp] $user->name line $j: $line");
			$columns = explode(",", $line);
			$begintime = trim($columns[3]);
			$speciesname = trim($columns[5]);
			$speciesname = trim($speciesname, '"');
			if ($speciesname and $begintime) {
				$commonname = trim($columns[6]);
				$commonname = trim($commonname, '"');
				if ( array_key_exists($speciesname, $speciesnames) ) {
					$countObs = $speciesnames[$speciesname][1];
					$speciesnames[$speciesname] = array($commonname, $countObs + 1);
				} else {
					$speciesnames[$speciesname] = array($commonname, 1);
				}
				$countObsLines++;
				$count = $speciesnames[$speciesname][1];
//					fwrite($logfp, "\n[$datestamp] $user->name $speciesname: $commonname ( $count )");
			}
		}
	}
	$countSpeciesNames = count($speciesnames);
	 	$datestamp = date('Y-m-d H:i:s');
		fwrite($logfp, "\n[$datestamp] $user->name countSpeciesNames: $countSpeciesNames species names");
	ksort($speciesnames);
	$result = '
		<option value=" ">' . $countSpeciesNames . ' names from ' . $countObsLines . ' observations</option>';
	foreach ($speciesnames as $key => $value) {
		$result = $result . '
		<option value="' . $key . '">' . $key . ' (' . $value[0] . ') (' . $value[1] . ')</option>';
	}
		fwrite($logfp, "\n[$datestamp] $user->name result: $result");
		fclose($logfp);
	print '
	<div id="sianctGetSpeciesResult">';
	print $result;
	print '
	</div>
	
	';
	module_invoke_all('exit');
	exit();
  }

  function sianctSelectObstables($query, $xslt) {
		global $user;
	 	$datestamp = date('Y-m-d H:i:s');
 		$logdatestamp = date('Y-m-d');
		$logfp = fopen('/tmp/sianct-' . $logdatestamp . '.log', 'a');
		fwrite($logfp, "\n\n[$datestamp] $user->name sianctSelectObstables: $query , $xslt");
    $solrUrl = variable_get('sianct_block_solr','noSolrUrl');
    $solrMax = variable_get('sianct_block_solr_max','1000');
    $solrXslt = $xslt;
    if ($xslt == '' || $xslt == 'default') {
    	$solrXslt = variable_get('sianct_block_solr_xslt_filtered','none');
    }
    $xsltParams =  '';
    if ($solrXslt != 'none') {
    	$xsltParams = '&wt=xslt&tr=' . $solrXslt;
    }
    $command = 'curl --silent "' . $solrUrl . '/gsearch_sianct/select?q=' . urlencode($query) . '&sort=PID+asc&version=2.2&start=0&rows=' . $solrMax . '&indent=on' . $xsltParams . '" 2>&1';
		fwrite($logfp, "\n[$datestamp] command: $command");
	$curlResult = shell_exec($command);
	 	$datestamp = date('Y-m-d H:i:s');
	 	$logString = substr($curlResult,0,1000) . '...';
		fwrite($logfp, "\n[$datestamp] $user->name curlResult: $logString");
		fclose($logfp);
	print $curlResult;
	module_invoke_all('exit');
	exit();
    }
}

?>
