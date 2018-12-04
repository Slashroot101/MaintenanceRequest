let changeRequests = [];
let currentChangeReqID;
$(document).ready(function(){
    if (!document.querySelector(`#admin-viewer`)) { return; }

    let socket = io.connect(document.location.protocol + '//' + document.location.host.substr(0, document.location.host.indexOf(`:`)) + ':8080');

    socket.on('connect', function(data){
      socket.emit('join', getUrlParam(`floor`, window.location.href));

      socket.on('newChangeRequest', function(data){
        if(data.floor === getUrlParam(`floor`, window.location.href)){
          let markupsTool = NOP_VIEWER.getExtension(`Autodesk.Viewing.MarkupsCore`);
          markupsTool.loadMarkups(data.markups, String(data._id));
          addChangeRequestToTable(data);
          changeRequests.push(data);
          $(`td, td`).off(`click`);
          $(`th, td`).click(function(){
            showToolbar(`CompleteToolbar`)
            $(this).parent().parent().find(`tr`).css(`background-color`, ``);
            $(this).parent().css(`background-color`, `#87cefa`);
            let changeReqID = $(this).siblings(`th`).attr(`id`);
            currentChangeReqID = changeReqID;
            disableAllMarkupsExceptLayer(changeReqID, changeRequests)
          })
        }
      });

      socket.on(`completedChangeRequest`, function(data){
        console.log(data)
        if(data.floor === getUrlParam(`floor`, window.location.href)){
          let markupsTool = NOP_VIEWER.getExtension(`Autodesk.Viewing.MarkupsCore`);
          markupsTool.hideMarkups(String(data.id));
          $(`#${data.id}`).parent().empty();
        }
      });

    })

    function AdminChangeRequest(viewer){
      Autodesk.Viewing.Extension.call(this, viewer);
    }
  
    AdminChangeRequest.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    AdminChangeRequest.prototype.constructor = AdminChangeRequest;
  
    AdminChangeRequest.prototype.load = function(){
      let completeToolbar = new Autodesk.Viewing.UI.ControlGroup('CompleteToolbar');
      completeToolbar.addControl(createCompleteButton());
      NOP_VIEWER.toolbar.addControl(completeToolbar);
      disableDefaultToolbar();
      loadAllChangeRequests();
      return true;
    };

    Autodesk.Viewing.theExtensionManager.registerExtension(`AdminChangeRequest`, AdminChangeRequest);
});

function loadAllChangeRequests(){
    NOP_VIEWER.loadExtension(`Autodesk.Viewing.MarkupsCore`)
    .then(function(markupsTool){
      let floor = getUrlParam(`floor`, window.location.href);
      markupsTool.show();
      getChangeRequestMarkups(floor, function(data){
        createChangeRequestPanel();
        changeRequests = data.markups;
        let colors = generateRandomColors(data.markups.length);
        for(let i = 0; i < data.markups.length; i++){
          if(data.markups[i].markups){
            markupsTool.loadMarkups(data.markups[i].markups.replace(`#ff0000`, colors[i]), String(data.markups[i]._id));
            addChangeRequestToTable(data.markups[i]);
          }
        }
        $(`th, td`).click(function(){
          showToolbar(`CompleteToolbar`)
          $(this).parent().parent().find(`tr`).css(`background-color`, ``);
          $(this).parent().css(`background-color`, `#87cefa`);
          let changeReqID = $(this).siblings(`th`).attr(`id`);
          currentChangeReqID = changeReqID;
          disableAllMarkupsExceptLayer(changeReqID, changeRequests)
        })
      });
    });
}

function showToolbar(selector){
  $(`#${selector}`).css(`display`,`inline-block`);
  $(`#${selector}`).css(`position`,`relative`);
  $(`#${selector}`).addClass(`adsk-viewing-viewer notouch dark-theme quality-text`);
}

function createCompleteButton(){
  let completeButton = new Autodesk.Viewing.UI.Button(`complete-button`);
  completeButton.addClass(`far`);
  completeButton.setToolTip(`Complete Request`);
  completeButton.setIcon(`fa-check-circle`);
  completeButton.addClass(`inactive`);
  completeButton.onClick = function(){
    $.ajax({
      url: `/change-request/${currentChangeReqID}/complete`,
      method: `PUT`,
      dataType: `json`,
      contentType: `application/json`
    });
  };
  return completeButton;
}

function disableAllMarkupsExceptLayer(layerID, changeRequests){
  let markupTool = NOP_VIEWER.getExtension('Autodesk.Viewing.MarkupsCore');
  for(let i = 0; i < changeRequests.length; i++){
    if(changeRequests[i]._id !== layerID){
      markupTool.hideMarkups(changeRequests[i]._id);
    } else {
      markupTool.showMarkups(changeRequests[i]._id);
    }
  }
}

function generateRandomColors(numColors){
  let ret = [];
  for(let i = 0; i < numColors; i++){
    let randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    if(ret.indexOf(randomColor) === -1){
      ret.push(randomColor);
    } else {
      i--;
    }
  }
  return ret;
}

function findChangeRequest(id, changeRequest){
  for(let i = 0; i < changeRequest.length; i++){
    if(changeRequest[i]._id === id){
      return changeRequest[i];
    }
  }
  return -1;
}

function createChangeRequestPanel(){
  let AdminChangeRequest = new Autodesk.Viewing.UI.DockingPanel(NOP_VIEWER.container, `AdminChangeRequest`, `Change Requests`);
  AdminChangeRequest.container.classList.add(`docking-panel-container-solid-color-a`);
  AdminChangeRequest.container.style.top = `200px`;
  AdminChangeRequest.container.style.left = `10px`;
  AdminChangeRequest.container.style.height = `385px`;
  AdminChangeRequest.container.style.resize = `none`;
  AdminChangeRequest.container.style.width = `350px`;
  AdminChangeRequest.content = document.createElement(`div`);
  $(AdminChangeRequest.container).append(AdminChangeRequestHTML);
  AdminChangeRequest.setVisible(true);
}


function getUrlParam(name, url){
  let params = url.split(`/`);
  for(let i = 0; i < params.length; i++){
    if(params[i] === name){
      return params[i + 1];
    }
  }
  return -1;
}

function getChangeRequestMarkups(floor, cb){
  $.get(`/change-request/markups/floor/${floor}/all`, cb);
}

function disableDefaultToolbar(){
  $(`#settingsTools`).css(`display`, `none`);
  $(`#measureTools`).css(`display`, `none`);
  $(`#navTools`).css(`display`, `none`);
  $(`#modelTools`).css(`display`, `none`);
}

function addChangeRequestToTable(changeRequest){
  $(`#changeRequests`).append(`
  <tr>
    <th scope="row" id="${changeRequest._id}">${changeRequest._id.substr(changeRequest._id.length - 4, changeRequest._id.length)}</th>
    <td>${changeRequest.createdBy}</td>
    <td>${moment(changeRequest.createdOn).format('MMM Do YYYY')}</td>
    <td>${changeRequest.notes}</td>
  </tr>`)
}
let AdminChangeRequestHTML = `
  <div style = "overflow: auto; max-height: 350px;">
      <table class="table table-dark">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">User</th>
          <th scope="col">Date</th>
          <th scope="col">Request</th>
        </tr>
      </thead>
      <tbody id = "changeRequests">
    </table>
  </div>
  `;
