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
  chrome.storage.local.get([storageName],(result)=>{
    if(result[storageName].length <= 0){
      chrome.storage.local.set({"storageName" : [].push(storageName)});
    }
  });
  if(obj && obj.length > 0){
    console.log(obj)
    chrome.storage.local.set({storageName : obj});
  }
}

function renderCard(){
  chrome.storage.local.get(["storageName"],(result)=>{
    let taskName;
    let estimate;
    let taskCnt;
    result["storageName"].forEach(function(item){
      chrome.storage.local.get([item],(result)=>{
        let lastChild = $("#card-list")[0].children[$("#card-list")[0].children.length-1]
        let newCard = generateCard(taskName, estimate, taskCnt);
        $("#card-list")[0].insertBefore(newCard,lastChild);
      })
    });
  });
}

function generateCard(taskName, estimate, taskCnt){
  let cardElemnet = document.createElement("div");
  cardElemnet.className  = "card border-dark";
  cardElemnet.style = "max-width: 9rem;max-height: 9rem;margin: 0.25rem;";
  
  let cardBody = document.createElement("div");
  cardBody.className = "card-body";
  cardBody.style = "padding: 0.25rem;";
  
  let cardFlex = document.createElement("div");
  cardFlex.style = "d-flex flex-column bd-highlight mb-3;";

  let taskNameDiv = document.createElement("div");
  taskNameDiv.className = "p-2 bd-highlight";
  taskNameDiv.innerText = taskName

  let estimateDiv = document.createElement("div");
  estimateDiv.className = "p-2 bd-highlight";
  estimateDiv.appendChild(`<img src="./res/baseline_access_time_black_18dp.png" class="img-thumbnail" style = "border: 0px;" >`);
  let estimateSpan = document.createElement("span");
  estimateSpan.className = "card-title";
  estimateSpan.innerText = estimate + "h";
  estimateDiv.appendChild(estimateSpan);
  
  let taskCntDiv = document.createElement("div");
  taskCntDiv.className = "p-2 bd-highlight";
  taskCntDiv.appendChild(`<img src="./res/baseline_list_black_18dp.png" class="img-thumbnail" style = "border: 0px;" >`);
  let taskCntSpan = document.createElement("span");
  taskCntSpan.className = "card-title";
  taskCntSpan.innerText = taskCnt;
  taskCntDiv.appendChild(taskCntSpan);

  //add task detail to flex
  cardFlex.appendChild(taskNameDiv);
  cardFlex.appendChild(estimateSpan);
  cardFlex.appendChild(taskCntDiv);
  cardBody.appendChild(cardFlex);
  cardElemnet.appendChild(cardBody);
  
  return cardElemnet;
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

