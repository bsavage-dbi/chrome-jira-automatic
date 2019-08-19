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
           chrome.tabs.executeScript(null,{file:"/js/inputLogic.js"});
    });
  }

  if(e.target.id == "id_refresh"){
    createPreView();
  }

  if(e.target.id == "id_add"){
    // add card 
    let taskName = $("#task-name").val();
    let taskText = $("#task-text").val();
    validateInput(taskName,taskText);
    renderCard();
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

function validateInput(taskName,inputString){
  if(inputString.length > 0){
    //change to Object
    console.log(inputString)
    var inlineDatas = inputString.split("\n");
    console.log(inlineDatas)
    setToLocalStorage(taskName,trasferToKVStructure(inlineDatas));
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

function setToLocalStorage(name,obj){
  let storageName = "jira_support_data".concat(name);
  chrome.storage.local.get(["jira_support_tasks"],(result)=>{
    if(result["jira_support_tasks"].length>0){
      chrome.storage.local.set({"storageName" : result["jira_support_tasks"].push(name)});
    }else{
      chrome.storage.local.set({"storageName" : [].push(name)});
    }
  });
  if(obj && obj.length > 0){
    console.log(obj)
    chrome.storage.local.set({storageName : obj});
  }
}

function renderCard(){
  console.log()
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

  var aButton = document.querySelectorAll('button');
  for (var i = 0; i < aButton.length; i++) {
    if("button" == aButton[i].type){
      aButton[i].addEventListener('click', click);
    }   
  }

});


$('#newTaskModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget)
  var recipient = button.data('whatever')
  var modal = $(this)
  modal.find('.modal-title').text('New message to ' + recipient)
  modal.find('.modal-body input').val(recipient)
})

