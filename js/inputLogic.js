var modalflg = true;
(()=>{
	//read from localstorage
	chrome.storage.local.get(["jira_support_data_subtask"],(result)=>{
		var datas = trasferToKVStructureFromStorage(result["jira_support_data_subtask"]);
		asyncForEach(datas,async (data,index,datas)=>{
			if(modalflg){
				//click stqc_show when its 
				openStqcShowPromise.then(()=>{
					$('#summary').val(data["summary"]);
					$('#timetracking_originalestimate').val(data["timetracking_originalestimate"]);
				}).finally(()=>{
					if("" != $('#summary').val()  && "" != $('#timetracking_originalestimate').val()){
						$('#create-issue-submit').click();
						console.log("created")
						console.log($('#summary').val())
					}
					if(datas.length == index+1){
						modalflg = false;
						$('#qf-create-another').click();
					}
					//TODO:set popup status
					datas[index]["completed"] = true;
					setToLocalStorage(datas);
				});
			await timeout(2000);
			}
		});
	
	});
})();

function trasferToKVStructureFromStorage(datas){
  var obj = []
  datas.forEach((item)=>{
    obj.push({
      "idn": item["idn"],
      "summary": item["summary"],
      "timetracking_originalestimate": item["timetracking_originalestimate"],
      "completed": item["completed"]
    });
  });
  return obj;
}

var openStqcShowPromise = 
new Promise((resolve, reject)=>{
	if($("#create-subtask").children().length > 0 && $('#summary').length==0){
		$("#create-subtask").children()[0].click();
	}
	setTimeout(()=>{
		if(!$('#qf-create-another').is(':checked')){
			$('#qf-create-another').click();
		}
		resolve();
	},1000)
});

function setToLocalStorage(obj){
  if(obj && obj.length > 0){
    chrome.storage.local.set({"jira_support_data_subtask":obj});
  }
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}