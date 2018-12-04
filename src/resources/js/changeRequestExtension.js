$(document).ready(function(){
    if (!document.querySelector(`#viewer`)) { return; }

    function ChangeRequest(viewer){
      Autodesk.Viewing.Extension.call(this, viewer);
    }
  
    ChangeRequest.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    ChangeRequest.prototype.constructor = ChangeRequest;
  
    ChangeRequest.prototype.load = function(){
      disableDefaultToolbar();
      createMarkupButtons();
      enterEditMode(`RECTANGLE`);
      return true;
    };

    Autodesk.Viewing.theExtensionManager.registerExtension(`ChangeRequest`, ChangeRequest);
  });

function disableDefaultToolbar(){
  $(`#settingsTools`).css(`display`, `none`);
  $(`#measureTools`).css(`display`, `none`);
  $(`#navTools`).css(`display`, `none`);
  $(`#modelTools`).css(`display`, `none`);
}

function enterEditMode(shape){
  NOP_VIEWER.loadExtension(`Autodesk.Viewing.MarkupsCore`)
  .then(function(markupTool){
    let mode = getMarkupMode(markupTool, shape);
    markupTool.enterEditMode();
    markupTool.changeEditMode(mode);
    showToolbar(`MarkupToolBar`);
    let isNavEnabled = false;
    $(document).keydown(function(e){
      if(e.which === 17 && isNavEnabled === false){
        markupTool.allowNavigation(true);
        isNavEnabled = true;
      } else if(e.which === 17) {
        markupTool.allowNavigation(false);
        isNavEnabled = false;
      }
    });

    $(document).mouseup(function(e){
      if(e.target.tagName === `svg`
        || e.target.tagName === `path`){
        showToolbar(`CompleteToolbar`);
      }
    });

    $(`#complete-button`).click(function(){
      let changeRequestID = getUrlParam(`change-request`, window.location.href);
      let markupsTool = NOP_VIEWER.getExtension(`Autodesk.Viewing.MarkupsCore`);
      $.ajax({
        method: `PUT`,
        dataType: `json`,
        contentType: `application/json`,
        url: `/change-request/${changeRequestID}/markups`,
        data: JSON.stringify({markups: markupsTool.generateData()}),
        success: function(data){
          window.location.href = `/confirmation/${changeRequestID}`;
        }
      })
    });
  });
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



function createMarkupButtons(){
  /**
   * Arrow
   * Circle
   * Cloud
   * Rectangle
   * Text
   */
  let buttons = [
     createArrowButton(),
     createCircleButton(),
     createCloudButton(),
     createRectangleButton() ];
  let subToolbar = new Autodesk.Viewing.UI.ControlGroup('MarkupToolBar');
  let completeToolbar = new Autodesk.Viewing.UI.ControlGroup('CompleteToolbar');
  completeToolbar.addControl(createCompleteButton());
  for(let i = 0; i < buttons.length; i++){
    subToolbar.addControl(buttons[i]);
  }
  NOP_VIEWER.toolbar.addControl(subToolbar);
  NOP_VIEWER.toolbar.addControl(completeToolbar);
};

function showToolbar(selector){
  $(`#${selector}`).css(`display`,`inline-block`);
  $(`#${selector}`).css(`position`,`relative`);
  $(`#${selector}`).addClass(`adsk-viewing-viewer notouch dark-theme quality-text`);
}

function createCompleteButton(){
  let completeButton = new Autodesk.Viewing.UI.Button(`complete-button`);
  completeButton.addClass(`far`);
  completeButton.setToolTip(`Submit Request`);
  completeButton.setIcon(`fa-check-circle`);
  completeButton.addClass(`inactive`);
  return completeButton;
}

function createArrowButton(){
  let arrowButton = new Autodesk.Viewing.UI.Button(`arrow-markup`);
  arrowButton.addClass(`fas`);
  arrowButton.setIcon(`fa-arrow-up`);
  arrowButton.addClass(`inactive`);
  arrowButton.onClick = function(){
    let markupTool = NOP_VIEWER.getExtension(`Autodesk.Viewing.MarkupsCore`)
    let mode = getMarkupMode(markupTool, `ARROW`);
    markupTool.changeEditMode(mode)
  }
  return arrowButton;
}

function createCloudButton(){
  let cloudButton = new Autodesk.Viewing.UI.Button(`arrow-cloud`);
  cloudButton.addClass(`fas`);
  cloudButton.setIcon(`fa-cloud`);
  cloudButton.addClass(`inactive`);
  cloudButton.onClick = function(){
    let markupTool = NOP_VIEWER.getExtension(`Autodesk.Viewing.MarkupsCore`)
    let mode = getMarkupMode(markupTool, `CLOUD`);
    markupTool.changeEditMode(mode)
  }
  return cloudButton;
}

function createCircleButton(){
  let circleButton = new Autodesk.Viewing.UI.Button(`circle-markup`);
  circleButton.addClass(`far`);
  circleButton.setIcon(`fa-circle`);
  circleButton.addClass(`inactive`);
  circleButton.onClick = function(){
    let markupTool = NOP_VIEWER.getExtension(`Autodesk.Viewing.MarkupsCore`)
    let mode = getMarkupMode(markupTool, `CIRCLE`);
    markupTool.changeEditMode(mode)
  }
  return circleButton;
}

function createRectangleButton(){
  let squareButton = new Autodesk.Viewing.UI.Button(`rectangle-markup`);
  squareButton.addClass(`far`);
  squareButton.setIcon(`fa-square`);
  squareButton.addClass(`inactive`);
  squareButton.onClick = function(){
    let markupTool = NOP_VIEWER.getExtension(`Autodesk.Viewing.MarkupsCore`)
    let mode = getMarkupMode(markupTool, `RECTANGLE`);
    markupTool.changeEditMode(mode)
  }
  return squareButton;
}

function createTextButton(){
  let textButton = new Autodesk.Viewing.UI.Button(`text-markup`);
  textButton.addClass(`fas`);
  textButton.setIcon(`fa-text-width`);
  textButton.addClass(`inactive`);
  textButton.onClick = function(){
    let markupTool = NOP_VIEWER.getExtension(`Autodesk.Viewing.MarkupsCore`)
    let mode = getMarkupMode(markupTool, `TEXT`);
    markupTool.changeEditMode(mode)
  }
  return textButton;
}

function getMarkupMode(markupTool, shape){
  let ret;
  switch(shape){
    case `ARROW`:
      ret = new Autodesk.Viewing.Extensions.Markups.Core.EditModeArrow(markupTool);
      break;
    case `CIRCLE`:
      ret = new Autodesk.Viewing.Extensions.Markups.Core.EditModeCircle(markupTool);
      break;
    case `CLOUD`:
      ret = new Autodesk.Viewing.Extensions.Markups.Core.EditModeCloud(markupTool);
      break;
    case `RECTANGLE`:
      ret = new Autodesk.Viewing.Extensions.Markups.Core.EditModeRectangle(markupTool);
      break;
    case `TEXT`:
      ret = new Autodesk.Viewing.Extensions.Markups.Core.EditModeText(markupTool);
      break;
  }
  return ret;
};