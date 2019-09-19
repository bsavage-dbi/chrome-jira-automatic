chrome-jira-automatic
==================

A chrome extension for creating jira subtask automatically.

> VERSION 0.2 
>
> *Support Jira Version <= 7.X

## Now Provide
・Create subtask automatically
・Support multiple task

## Guidance

### installation
add app to your chrome extensions via link below:

https://chrome.google.com/webstore/detail/jira-support/eegjegfmcomminnmhlkcplholjlmnpgm?hl=en-US

### Usage
- first you need to prepare the input subtask data with format like this:
~~~txt
taskA   1h
taskB   2h
taskB   3h
~~~
※ between task summary and estimate time we separate them with symbol **\t** .

- confirm your browser tab is currentlly on your jira page and make sure extension standby 

- click icon to get a popup menu

- add your data then start transaction

- confirm transction status whenever you want

### TODO
- ~~Make button group fixed on bottom~~ (abandon)
- Apply for multiple task importing (done)
- Card mode (done)
- Preview tab (done)
- Support adding multi task (done)
- Abend loading file to read data (done)
- beautify UI (done)
- update tutorial (design)
- Add Tips (done)
- optimize data input to a more friendly way (design)