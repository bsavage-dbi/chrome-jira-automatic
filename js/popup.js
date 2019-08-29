'use strict';
var dataStr;
var storageTask;
chrome.storage.local.set({storageTask : {}});
//bind function
function click(e) {
  if(e.target.id == 'id_start'){
    $('#id_start').attr('disabled','');
    $('#alertInfo').html('Start processing...wait until all task import completely or press `resfresh` to check processing status.');
    // $('#alertInfo').css('alert alert-info');

    //click + button
     chrome.tabs.executeScript(null,{file:'/js/jquery.min.js'}, function () {
           chrome.tabs.executeScript(null,{file:'/js/inputLogic.js'});
    });
  }

  if(e.target.id == 'id_refresh'){
    //createPreView();
  }

  if(e.target.id == 'id_add'){
    // add card 
    let taskName = $('#task-name').val();
    let taskText = $('#task-text').val();
    validateInput(taskName,taskText);
  }
}


function fade(e){
    let targetElement = e.currentTarget;
}

function gotoInstruction(e) {
  var action_url = 'https://github.com/hiroshikana/chrome-jira-automatic/tree/master';
  chrome.tabs.create({url: action_url});
}

//bind function 
function fileUpload(e) {
  if(e.target.id == 'id_file'){
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
      reader.readAsText(file, 'utf-8');
    }
  }
}

function createPreView(){
  var taskName = '';
  chrome.storage.local.get({storageTask : {}},(result)=>{
    result.storageTask.forEach((stname)=>{
      //--------------------
    });
    taskName = result.storageTask[0];
    chrome.storage.local.get([taskName],(rst1,taskName)=>{
      let tableDiv = document.getElementById('preView');
      tableDiv.innerHTML = '';
      let table = document.createElement('table');
      let header = table.createTHead();
      let body = table.createTBody();
      let hRow = header.insertRow(0); 
      let indexheadCell = document.createElement('TH');
      let titleheadCell = document.createElement('TH');
      let timeheadCell = document.createElement('TH');
      let processheadCell = document.createElement('TH');
      indexheadCell.innerHTML = 'TID';
      titleheadCell.innerHTML = 'SUBTASK';
      timeheadCell.innerHTML = 'ESTIMATE';
      processheadCell.innerHTML = 'STATUS';
      hRow.appendChild(indexheadCell);
      hRow.appendChild(titleheadCell);
      hRow.appendChild(timeheadCell);
      hRow.appendChild(processheadCell);
      dataStr = rst1[taskName];
      dataStr.forEach((item)=>{
        let newRow = body.insertRow();
        let inlineInfo1 = item['idn'];
        let inlineInfo2 = item['summary'];
        let inlineInfo3 = item['timetracking_originalestimate'];
        let inlineInfo4 = item['completed'];
        let indexheadCell = newRow.insertCell();
        let titleCell = newRow.insertCell();
        let timeCell = newRow.insertCell();
        let processCell = newRow.insertCell();
        indexheadCell.innerHTML = inlineInfo1+1;
        titleCell.innerHTML = inlineInfo2;
        timeCell.innerHTML = inlineInfo3;
        processCell.innerHTML = true==inlineInfo4?
                                '<span id = process'+ inlineInfo1 + ' complete>complete</span>':
                                '<span id = process'+ inlineInfo1 + ' ready>processing</span>';
      });
      tableDiv.append(table);
    });
  });
 
}

function validateInput(taskName,inputString){
  if(inputString.length > 0){
    //change to Object
    var inlineDatas = inputString.split('\n');
    var stName = 'jira_support_data_'.concat(taskName);
    setToLocalStorage(stName,trasferToKVStructure(inlineDatas));
    //active reflesh
    $('#id_start').removeAttr('disabled');
    $('#alertInfo').removeAttr('hidden');
    $('#alertInfo').html('Upload completely!Press `process` after confirming your input is right.');

  }
}

function trasferToKVStructure(datas){
  var obj = []
  datas.forEach((item,idn)=>{
    obj.push({
      'idn': idn,
      'summary': item.split('\t')[0],
      'timetracking_originalestimate': item.split('\t')[1]
    });
  });
  return obj;
}

function setToLocalStorage(stName,obj){
  chrome.storage.local.get({storageTask : {}},(result)=>{
    if(undefined == result.storageTask.stName){
        if(obj && obj.length > 0){
          result.storageTask[arguments[0]] = obj
          chrome.storage.local.set({storageTask : result.storageTask});
          renderCard();
    }
  }
  });
}

function renderCard(){
  chrome.storage.local.get({storageTask : {}},(rst1)=>{
    let children = $('#card-list')[0].children; 
    let taskList = Object.values(rst1.storageTask);
    let nameList = Object.keys(rst1.storageTask);
    //remove besides add card
    for(let cnt = 0;cnt < children.length-1;cnt++){
      $('#card-list')[0].removeChild(children[cnt]);
    }
    taskList.forEach(function(item,idn){
      let taskName;
      let taskCnt;
      let estimate = 0;
      let lastChild = children[children.length-1];
      console.log(item);
        taskName = nameList[idn].replace('jira_support_data_','');
        item.forEach((numItem,index)=>{
          estimate += Number.parseFloat(numItem['timetracking_originalestimate'].replace('h',''));
        });
        taskCnt = item.length;
        let newCard = generateCard(taskName, estimate.toString(), taskCnt);
        $('#card-list')[0].insertBefore(newCard,lastChild);
    });
  });
}

function generateCard(taskName, estimate, taskCnt){
  let cardElemnet = document.createElement('div');
  cardElemnet.className  = 'card border-dark';
  cardElemnet.style = 'width: 9rem; max-width: 9rem;max-height: 9rem;margin: 0.25rem;';
  
  let cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  cardBody.style = 'padding: 0.25rem;';
  
  let cardFlex = document.createElement('div');
  cardFlex.className = 'flex-column bd-highlight mb-3';

  let taskNameDiv = document.createElement('div');
  taskNameDiv.className = 'p-2 bd-highlight';
  taskNameDiv.innerText = taskName

  let estimateDiv = document.createElement('div');
  estimateDiv.className = 'p-2 bd-highlight';
  
  let estimateImg = document.createElement('img');
  estimateImg.className = 'img-thumbnail';
  estimateImg.style = 'border: 0px;'
  estimateImg.src = './res/baseline_access_time_black_18dp.png';
  estimateDiv.appendChild(estimateImg);

  let estimateSpan = document.createElement('span');
  estimateSpan.className = 'card-title';
  estimateSpan.innerText = estimate + 'h';
  estimateDiv.appendChild(estimateSpan);
  
  let taskCntDiv = document.createElement('div');
  taskCntDiv.className = 'p-2 bd-highlight';
  
  let taskCntImg = document.createElement('img');
  taskCntImg.className = 'img-thumbnail';
  taskCntImg.style = 'border: 0px;'
  taskCntImg.src = './res/baseline_list_black_18dp.png';
  taskCntDiv.appendChild(taskCntImg);

  let taskCntSpan = document.createElement('span');
  taskCntSpan.className = 'card-title';
  taskCntSpan.innerText = taskCnt;
  taskCntDiv.appendChild(taskCntSpan);
  
  let cardHover = document.createElement('div');
  cardHover.className = "card-hover"

  //add task detail to flex
  cardFlex.appendChild(taskNameDiv);
  cardFlex.appendChild(estimateDiv);
  cardFlex.appendChild(taskCntDiv);
  cardBody.appendChild(cardFlex);
  cardElemnet.appendChild(cardBody);
  cardElemnet.appendChild(cardHover);
  return cardElemnet;
}

document.addEventListener('DOMContentLoaded', (tab)=>{
  var inputs = document.querySelectorAll('input');
  for (var i = 0; i < inputs.length; i++) {
    if('button' == inputs[i].type){
          inputs[i].addEventListener('click', click);
    }   

    if('file' == inputs[i].type){
          inputs[i].addEventListener('change', fileUpload);
    }
  }

  var aLabel = document.querySelectorAll('a');
  for (var i = 0; i < aLabel.length; i++) {
    if('instruction' == aLabel[i].id){
          aLabel[i].addEventListener('click', gotoInstruction);
    }   
  }

  var aButton = document.querySelectorAll('button');
  for (var i = 0; i < aButton.length; i++) {
    if('button' == aButton[i].type){
      aButton[i].addEventListener('click', click);
    }   
  }
  var cards = document.querySelectorAll('.card');
  console.log(cards)
  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener('mouseover',fade);
  }
});

$('#newTaskModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget)
  var recipient = button.data('whatever')
  var modal = $(this)
  modal.find('.modal-title').text('New message to ' + recipient)
  modal.find('.modal-body input').val(recipient)
})
