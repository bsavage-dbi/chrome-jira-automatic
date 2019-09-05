var modalflg = true;
var taskIdnParam = config;
var createSub = document.querySelectorAll("#create-subtask")[0]
var summary;
var createAnother;
var timetracking_originalestimate;
var createSubmit;
var openStqcShowPromise = 
new Promise((resolve, reject)=>{
        if(undefined!=createSub > 0 && undefined==summary){
          createSub.click();
          var intervalWait = setInterval(()=>{
            createAnother = document.querySelectorAll("#qf-create-another")[0]
            createSubmit = document.querySelectorAll("#create-issue-submit")[0];
            timetracking_originalestimate = document.querySelectorAll("#timetracking_originalestimate")[0];
            summary = document.querySelectorAll("#summary")[0]
            if(undefined != createAnother){
              if(!createAnother.checked){
                createAnother.click();
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
            //every task list process here
            console.log(taskLists)
            var datas = trasferToKVStructureFromStorage(taskLists[taskIdnParam]);
            asyncForEach(datas,async (data,index,datas)=>{
              if(modalflg){
                //click stqc_show when its 
                openStqcShowPromise.then(()=>{
                  summary.value = data["summary"];
                  timetracking_originalestimate.value = data["timetracking_originalestimate"];
                }).finally(()=>{
                  if("" != summary.value  && "" != timetracking_originalestimate.value){
                    // createSubmit.click();
                    console.log("created")
                    console.log(summary.value)
                  }
                  if(datas.length == index+2){
                    modalflg = false;
                    createAnother.click();
                  }
                  //TODO:set popup status
                  datas[index]["completed"] = true;
                  setToLocalStorage(datas);
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


    function setToLocalStorage(stName, obj) {
        chrome.storage.local.get({ storageTask: {} }, (result) => {
          let stName = arguments[0];
          if (undefined == result.storageTask[stName]) {
            if (obj && obj.length > 0) {
              result.storageTask[stName] = obj
              chrome.storage.local.set({ storageTask: result.storageTask });
              renderCard();
            }
          }
        });
      }
    