'use strict';
var dataStr;
var storageTask;
var jiraHost = window.location.hostname;
var tipsOnFlg = false;
chrome.storage.local.set({ storageTask: {} });


//bind function
function click(e) {
  if (e.currentTarget.id == 'id_start') {
    $('#id_start').attr('disabled', '');
    // $('#alertInfo').html('Start processing...wait until all task import completely or click [card] to check processing status.');
    // $('#alertInfo').css('alert alert-info');
    //read from localstorage
    chrome.storage.local.get({ storageTask: {} }, (result) => {
      let taskNames = Object.keys(result.storageTask);
      let taskCnt;
      asyncForEach(taskNames,  async (taskname, idn, taskNames) => {
      taskCnt = Object.values(result.storageTask)[idn].length;
      //set processbar status
      await asyncProcess(taskname, idn, taskCnt);
      });
    });
  }


  if (e.currentTarget.id == 'id_add') {
    // add card 
    let taskName = $('#task-name').val();
    let taskText = $('#task-text').val();
    validateInput(taskName, taskText);
  }
  if (e.currentTarget.id == 'tips-toggle') {
    tipsOnFlg = e.currentTarget.id.checked?true:false;
    alert(tipsOnFlg)
  }
}

function mouseEnterHandler(e) {
  if(tipsOnFlg){
    if (e.currentTarget.id == 'id_add_img') {
        $('[data-toggle="popover-add"]').popover("show")
    }
    if (e.currentTarget.id == 'id_start') {
      $('[data-toggle="popover-process"]').popover("show")
    }
  }
}

function mouseLeaveHandler(e) {
  if(tipsOnFlg){
    if (e.currentTarget.id == 'id_add_img') {
      $('[data-toggle="popover-add"]').popover("hide")
    }
    if (e.currentTarget.id == 'id_start') {
      $('[data-toggle="popover-process"]').popover("hide")
    }
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

  function asyncProcess(taskname, idn, taskCnt) {
      let percentageCnt = 2*taskCnt+6;
      return new Promise((resolve1,reject)=>{
            chrome.tabs.update({ active: true, url: getTaskUrl(taskname) }, async () => {
                await timeout(2000);
                chrome.tabs.executeScript(null, { code: 'var config = "'.concat(idn).concat('"') }, () => {
                    chrome.tabs.executeScript(null, { file: '/js/inputLogic.js' }, () => {
                      let syncInput =  new Promise((resolve2)=>{
                          let intervalCnt = 1;
                          let interval = setInterval(()=>{
                          $('[role="progressbar"]')[idn].style.width = 100 * (intervalCnt) / (percentageCnt) + "%"
                          if(intervalCnt == percentageCnt){
                            clearInterval(interval);
                            resolve2();
                          }
                          ++intervalCnt;
                        },500)
                      });
                      syncInput.then(()=>{
                        resolve1();
                      })
                    });
                });
            });
      });
}

function gotoInstruction(e) {
  var action_url = 'https://github.com/hiroshikana/chrome-jira-automatic/tree/master';
  chrome.tabs.create({ url: action_url });
}

function getTaskUrl(taskName) {
  let tsName = taskName.replace('jira_support_data_', '');
  if ('string' == typeof (jiraHost)) {
    return jiraHost
      .concat('/browse')
      .concat('/').concat(tsName)
  }
}

function createPreView(tsName) {
  chrome.storage.local.get({ storageTask: {} }, (result) => {
    let taskName = arguments[0];
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
    dataStr = result.storageTask[taskName];
    dataStr.forEach((item) => {
      let newRow = body.insertRow();
      let inlineInfo1 = item['idn'];
      let inlineInfo2 = item['summary'];
      let inlineInfo3 = item['timetracking_originalestimate'];
      let inlineInfo4 = item['completed'];
      let indexheadCell = newRow.insertCell();
      let titleCell = newRow.insertCell();
      let timeCell = newRow.insertCell();
      let processCell = newRow.insertCell();
      indexheadCell.innerHTML = inlineInfo1 + 1;
      titleCell.innerHTML = inlineInfo2;
      timeCell.innerHTML = inlineInfo3;
      processCell.innerHTML = true == inlineInfo4 ?
        '<span id = process' + inlineInfo1 + ' complete>complete</span>' :
        '<span id = process' + inlineInfo1 + ' ready>processing</span>';
    });
    tableDiv.append(table);
  });
}

function validateInput(taskName, inputString) {
  if (inputString.length > 0) {
    //change to Object
    var inlineDatas = inputString.split('\n');
    var stName = 'jira_support_data_'.concat(taskName);
    setToLocalStorage(stName, trasferToKVStructure(inlineDatas));
    //active reflesh
    $('#id_start').removeAttr('disabled');
    // $('#alertInfo').removeAttr('hidden');
    // $('#alertInfo').html('Upload completely!Press `process` after confirming your input is right.');
  }
}



function trasferToKVStructure(datas) {
  var obj = []
  datas.forEach((item, idn) => {
    obj.push({
      'idn': idn,
      'summary': item.split('\t')[0],
      'timetracking_originalestimate': item.split('\t')[1]
    });
  });
  return obj;
}


function renderCard() {
  chrome.storage.local.get({ storageTask: {} }, (rst1) => {
    let children = $('#card-list')[0].children;
    let taskList = Object.values(rst1.storageTask);
    let nameList = Object.keys(rst1.storageTask);
    //remove besides add card
    let originLength = children.length
    for (let cnt = 0; cnt < originLength - 1; cnt++) {
      $('#card-list')[0].removeChild(children[0]);
    }
    taskList.forEach(function (item, idn) {
      let taskName;
      let taskCnt;
      let estimate = 0;
      let lastChild = children[children.length - 1];
      console.log(item);
      taskName = nameList[idn].replace('jira_support_data_', '');
      item.forEach((numItem, index) => {
        estimate += Number.parseFloat(numItem['timetracking_originalestimate'].replace('h', ''));
      });
      taskCnt = item.length;
      let newCard = generateCard(taskName, estimate.toString(), taskCnt);
      $('#card-list')[0].insertBefore(newCard, lastChild);
      //band card event(open & close)
      bindCardEvent();
    });
  });
}

function generateCard(taskName, estimate, taskCnt) {
  let cardElemnet = document.createElement('div');
  cardElemnet.className = 'card border-dark';
  cardElemnet.style = 'width: 9rem; max-width: 9rem;max-height: 9rem;margin: 0.25rem; box-shadow: 0 0 .25rem gray;border: 0px;';

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
  cardHover.className = 'card-hover'
  let cardHoverImg = document.createElement('img');
  cardHoverImg.className = 'img-thumbnail right-top';
  cardHoverImg.src = './res/baseline_close_white_18dp.png';
  cardHoverImg.style = 'border: 0px;';
  cardHover.appendChild(cardHoverImg);

  let cardHoverProgress = document.createElement('div');
  cardHoverProgress.className = 'progress';
  cardHoverProgress.style = 'position: absolute;bottom: 0;left: 0;width: 100%;height:.25rem;';
  let cardHoverProgressInside = document.createElement('div');
  cardHoverProgressInside.className = 'progress-bar progress-bar-striped progress-bar-animated';
  cardHoverProgressInside.setAttribute('role', 'progressbar');
  cardHoverProgressInside.setAttribute('aria-valuenow', '75');
  cardHoverProgressInside.setAttribute('aria-valuemin', '0');
  cardHoverProgressInside.setAttribute('aria-valuemax', '100');
  cardHoverProgressInside.style = 'width: 0%;height:100%';
  cardHoverProgress.appendChild(cardHoverProgressInside);
  cardHover.appendChild(cardHoverProgress);

  cardFlex.appendChild(taskNameDiv);
  cardFlex.appendChild(estimateDiv);
  cardFlex.appendChild(taskCntDiv);
  cardBody.appendChild(cardFlex);
  cardElemnet.appendChild(cardBody);
  cardElemnet.appendChild(cardHover);
  return cardElemnet;
}

document.addEventListener('DOMContentLoaded', (tab) => {
  var inputs = document.querySelectorAll('input');
  for (var i = 0; i < inputs.length; i++) {
      if ('button' == inputs[i].type) {
      //prevent enter key
      inputs[i].addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
          event.preventDefault();
        }
      });
      inputs[i].addEventListener('click', click);
  }
  }
  
  var aLabel = document.querySelectorAll('a');
  for (var i = 0; i < aLabel.length; i++) {
    if ('instruction' == aLabel[i].id) {
      aLabel[i].addEventListener('click', gotoInstruction);
    }
  }

  var cards = document.querySelectorAll('.card.border-dark');
  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener('click', openPreview);
  }

  var delBtn = document.querySelectorAll('.img-thumbnail.right-top');
  for (var i = 0; i < delBtn.length; i++) {
    delBtn[i].addEventListener('click', delCard);
  }
    
  bindTips();
});

function bindTips(){
  var aButton = document.querySelectorAll('button');
  for (var i = 0; i < aButton.length; i++) {
    if ('button' == aButton[i].type) {
      aButton[i].removeEventListener('click', click);
      aButton[i].removeEventListener("mousedown", mouseEnterHandler, true);
      aButton[i].removeEventListener("mousedown", mouseLeaveHandler, true);
      aButton[i].addEventListener('click', click);
      aButton[i].addEventListener('mouseenter', mouseEnterHandler);
      aButton[i].addEventListener('mouseleave', mouseLeaveHandler);
    }
  }
}

function bindCardEvent() {
  var cards = document.querySelectorAll('.card.border-dark');
  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener('click', openPreview);
  }

  var delBtn = document.querySelectorAll('.img-thumbnail.right-top');
  for (var i = 0; i < delBtn.length; i++) {
    delBtn[i].addEventListener('click', delCard);
  }
  bindTips();
}





function delCard(e) {
  e.stopPropagation();
  //delete page element
  let currentCardNode = e.currentTarget.parentNode.parentNode;
  document.getElementById('card-list').removeChild(currentCardNode);
  //delete data from storage
  let taskName = currentCardNode.getElementsByClassName('p-2 bd-highlight')[0].innerHTML;
  var stName = 'jira_support_data_'.concat(taskName);
  removeFromLocalStorage(stName);
}

function openPreview(e) {
  let currentCardNode = e.currentTarget.parentNode.parentNode;
  let taskName = currentCardNode.getElementsByClassName('p-2 bd-highlight')[0].innerHTML;
  var stName = 'jira_support_data_'.concat(taskName);
  createPreView(stName);
  $('#prelist-tab').click();
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

function removeFromLocalStorage(stName) {
  chrome.storage.local.get({ storageTask: {} }, (result) => {
    let stName = arguments[0];
    if (undefined != result.storageTask[stName]) {
      delete result.storageTask[stName];
    }
    chrome.storage.local.set({ storageTask: result.storageTask })
  })
}

 async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
  }
}


$(function() {
  $('#tips-toggle').change(function(e) {
    tipsOnFlg = e.currentTarget.checked?true:false;
  })

})

