'use strict';

var dataStr;
//bind function
function click(e) {
  if(e.target.id == "id_start"){
    $("#id_start").attr("disabled","");
    $("#alertInfo").html("Start processing...wait until all task import completely or press `resfresh` to check processing status.");
    // $("#alertInfo").css("alert alert-info");

    //click + button
     chrome.tabs.executeScript(null,{file:"/js/jquery.min.js"}, function () {
           chrome.tabs.executeScript(null,{file:"/jsinputLogic.js"});
    });
  }

  if(e.target.id == "id_refresh"){
    createPreView();
  }
}

function gotoInstruction(e) {
  var action_url = "https://github.com/hiroshikana/chrome-jira-automatic/tree/master";
  chrome.tabs.create({url: action_url});
}

//bind function 
function fileUpload(e) {
  if(e.target.id == "id_file"){
    var files = e.target.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var reader = new FileReader();
      reader.onload = function(evt) {
          validateInput(evt.target.result);
      };  
      reader.onerror = function(evt) {
        console.log(evt.target.error.name);
      };
      reader.readAsText(file, "utf-8");
    }
  }
}

function createPreView(){
  chrome.storage.local.get(["jira_support_data_subtask"],(result)=>{
    let tableDiv = document.getElementById("preView");
    tableDiv.innerHTML = "";
    let table = document.createElement("table");
    let header = table.createTHead();
    let body = table.createTBody();
    let hRow = header.insertRow(0); 
    let indexheadCell = document.createElement("TH");
    let titleheadCell = document.createElement("TH");
    let timeheadCell = document.createElement("TH");
    let processheadCell = document.createElement("TH");
    indexheadCell.innerHTML = "TID";
    titleheadCell.innerHTML = "SUBTASK";
    timeheadCell.innerHTML = "ESTIMATE";
    processheadCell.innerHTML = "STATUS";
    hRow.appendChild(indexheadCell);
    hRow.appendChild(titleheadCell);
    hRow.appendChild(timeheadCell);
    hRow.appendChild(processheadCell);
    dataStr = result["jira_support_data_subtask"];
    dataStr.forEach((item)=>{
      let newRow = body.insertRow();
      let inlineInfo1 = item["idn"];
      let inlineInfo2 = item["summary"];
      let inlineInfo3 = item["timetracking_originalestimate"];
      let inlineInfo4 = item["completed"];
      let indexheadCell = newRow.insertCell();
      let titleCell = newRow.insertCell();
      let timeCell = newRow.insertCell();
      let processCell = newRow.insertCell();
      indexheadCell.innerHTML = inlineInfo1+1;
      titleCell.innerHTML = inlineInfo2;
      timeCell.innerHTML = inlineInfo3;
      processCell.innerHTML = true==inlineInfo4?
                              "<span id = process"+ inlineInfo1 + " complete>complete</span>":
                              "<span id = process"+ inlineInfo1 + " ready>processing</span>";
    });
    tableDiv.append(table);
  });
}

function validateInput(inputString){
  if(inputString.length > 0){
    //change to Object
    var inlineDatas = inputString.split("\r\n");
    console.log(inlineDatas)
    setToLocalStorage(trasferToKVStructure(inlineDatas));
    //active reflesh
    $("#id_start").removeAttr("disabled");
    $("#alertInfo").removeAttr("hidden");
    $("#alertInfo").html("Upload completely!Press `process` after confirming your input is right.");
    createPreView();
  }
}

function trasferToKVStructure(datas){
  var obj = []
  datas.forEach((item,idn)=>{
    obj.push({
      "idn": idn,
      "summary": item.split("\t")[0],
      "timetracking_originalestimate": item.split("\t")[1]
    });
  });
  return obj;
}

function setToLocalStorage(obj){
  if(obj && obj.length > 0){
    console.log(obj)
    chrome.storage.local.set({"jira_support_data_subtask":obj});
  }
}

document.addEventListener('DOMContentLoaded', (tab)=>{
  var inputs = document.querySelectorAll('input');
  for (var i = 0; i < inputs.length; i++) {
    if("button" == inputs[i].type){
          inputs[i].addEventListener('click', click);
    }   

    if("file" == inputs[i].type){
          inputs[i].addEventListener("change", fileUpload);
    }
  }

  var aLabel = document.querySelectorAll('a');
  for (var i = 0; i < aLabel.length; i++) {
    if("instruction" == aLabel[i].id){
          aLabel[i].addEventListener('click', gotoInstruction);
    }   
  }
});


