$(document).ready(function(){
    if($(`#viewer`).length === 0 && $(`#admin-viewer`).length === 0){ return; }
    let viewer;
    let options = {
      env: `AutodeskProduction`,
      getAccessToken: getForgeToken
    };
    
  
    let documentId = `urn:${getUrlParam(`urn`, window.location.href)}`;
    
    Autodesk.Viewing.Initializer(options, function onInitialized() {
      Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
  
    function onDocumentLoadSuccess(doc) {
      let viewable = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {
        'type': `geometry`,
        'role': `2d`
      }, true);
      if (viewable.length === 0) {
        return;
      }
  
      let initialViewable = viewable[0];
      let svfUrl = doc.getViewablePath(initialViewable);
      let modelOptions = {
        sharedPropertyDbPath: doc.getPropertyDbPath()
      };
      let viewerDiv
      if($(`#viewer`).length > 0){
         viewerDiv = document.getElementById(`viewer`);
      } else {
         viewerDiv = document.getElementById(`admin-viewer`);
      }

      viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv);
      console.log(`Success`)
      viewer.start(svfUrl, modelOptions, onLoadModelSuccess, onLoadModelError);
    }
  
  
    function onDocumentLoadFailure(err) {
        console.log(12345)
    }
  
    function onLoadModelSuccess() {
      if($(`#viewer`).length > 0){
        NOP_VIEWER.loadExtension(`MarkupsTool`);
      }
      // if($(`#admin-viewer`).length > 0){
      //   NOP_VIEWER.loadExtension(`AdminChangeRequest`); 
      // }
    }
  
    function onLoadModelError() {
        console.log(1234)
    }
  
    function getForgeToken(callback) {
      $.ajax({
        url: `/user/forge/token`,
        success: function (res) {
          callback(res.access_token, res.expires_in);
        }
      });
    }
  
});

function getUrlParam(name, url){
  let params = url.split(`/`);
  for(let i = 0; i < params.length; i++){
    if(params[i] === name){
      return params[i + 1];
    }
  }
  return -1;
}