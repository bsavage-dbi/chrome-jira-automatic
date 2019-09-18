var modalflg = true;
var taskIdnParam = config;
var createSub = $("#create-subtask")[0];
var openStqcShowPromise = 
new Promise((resolve, reject)=>{
        if(undefined!=createSub > 0 && undefined==$("#summary")[0]){
          createSub.click();
          var intervalWait = setInterval(()=>{
            createAnother = $("#qf-create-another")[0];
            if(undefined != $("#qf-create-another")[0]){
              if(!$("#qf-create-another")[0].checked){
                $("#qf-create-another")[0].click();
                clearInterval(intervalWait);
                resolve();
              }
            }
          },500);
        }
    });

    (()=>{
            chrome.storage.local.get({storageTask : {}},(result)=>{
            let taskLists = Object.values(result.storageTask);
            let taskNames = Object.keys(result.storageTask);
            //every task list process here
            console.log(taskLists)
            var datas = trasferToKVStructureFromStorage(taskLists[taskIdnParam]);
            var name = taskNames[taskIdnParam];
            asyncForEach(datas,async (data,index,datas)=>{
              if(modalflg){
                //click stqc_show when its 
                openStqcShowPromise.then(()=>{
                  if(datas.length == 1){
                    //close create another
                    $("#qf-create-another")[0].click();
                  }else if(datas.length == index+1){
                    modalflg = false;
                    $("#qf-create-another")[0].click();
                  }
                $("#summary")[0].value = data["summary"];
                $("#timetracking_originalestimate")[0].value = data["timetracking_originalestimate"];
                }).finally(()=>{
                  if("" != $("#summary")[0].value  && "" != $("#timetracking_originalestimate")[0].value){
                    $("#create-issue-submit")[0].click();
                    console.log("created")
                    console.log($("#summary")[0].value)
                  }
                  datas[index]["completed"] = true;
                  resetToLocalStorage(name,datas,result);
                });
              await timeout(1000);
              }
            });
        });
    })();

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
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

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }


    function resetToLocalStorage(stName, obj,result) {
          if (undefined != result.storageTask[stName]) {
            if (obj && obj.length > 0) {
              result.storageTask[stName] = obj
              chrome.storage.local.set({ storageTask: result.storageTask });
            }
          }
      }
    