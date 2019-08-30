


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