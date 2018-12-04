$(document).ready(function(){

    function MarkupsTool(viewer, options){

    }

    let isCreating = false;
    let isEditing = false;
    let selection = null;
    let count = 0;
    MarkupsTool.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    MarkupsTool.prototype.constructor = MarkupsTool;

    MarkupsTool.prototype.load = function(){
        //add canvas
        $(`#viewer`).prepend(SVG_CANV).attr(`height`, window.innerHeight).attr(`width`, window.innerWidth);
        $(document).mouseup(function(e1){
            if(!isCreating && !isEditing && !selection){
                d3
                    .select(`svg`)
                    .append(`line`)
                    .attr(`x1`, positionFromClientToMarkups(e1.pageX, 0, 0).x).attr(`y1`,  positionFromClientToMarkups(0, e1.pageY, 0).y)
                    .attr(`style`, `stroke:rgb(255,0,0); stroke-width:1;`)
                    .on(`mouseover`, function(){
                        selection = d3.select(this);
                        d3.select(this).style(`stroke`, `rgb(0,0,255)`);
                    })
                    .on(`mouseout`, function(){
                        if(!isEditing){
                            selection = null;
                            d3.select(this).style(`stroke`, `rgb(255, 0, 0)`);
                        }
                    })
                    .on(`mousedown`, function(){
                        console.log(`true`);
                        isEditing = true;
                        selection = d3.select(this);
                        let x1 = Number(selection.attr(`x1`));
                        let x2 = Number(selection.attr(`x2`));
                        let y1 = Number(selection.attr(`y1`));
                        let y2 = Number(selection.attr(`y2`));
                        let mousePos = positionFromClientToMarkups(event.clientX, event.clientY);
                        let offsetY1 = y1 - mousePos.y;
                        let offsetY2 = y2 - mousePos.y;
                        let offsetX1 = x1 - mousePos.x;
                        let offsetX2 = x2 - mousePos.x;
                        $(document).mousemove(function(e){
                            let currentMousePos = positionFromClientToMarkups(event.clientX, event.clientY);
                            let x3 = currentMousePos.x + offsetX1;
                            let x4 = currentMousePos.x + offsetX2;
                            let y3 = currentMousePos.y - offsetY1;
                            let y4 = currentMousePos.y + offsetY2;
                            selection
                                .attr(`x1`, x3)
                                .attr(`y1`,y3)
                                .attr(`x2`, x4)
                                .attr(`y2`, y4);
                        });
                    });

                /*
                * You need to be able to drag from anywhere on the line
                * So, you need to find the distance from the current mouse position to either endpoint of the line
                * Save that value as an offset to use
                * Initial Line = (X1, Y1) (X2, Y2)
                * Transformed Line = (Q1 > X1 ? Q1 + X1 : X1-Q1, W1 > Y1 ? W1 + Y1  - OFFSET: Y1 - W1 - OFFSET) (Q2 > X2 ? Q2 + X2 : X2-Q2, W2 > Y2 ? W2 + Y2  - OFFSET: Y2 - W2 - OFFSET)
                * */
                $(document).mousemove(function(event){
                    d3.selectAll(`line`).filter(function(d, i){ return i === count;}).attr(`x2`,  positionFromClientToMarkups(event.pageX,0,0).x).attr(`y2`,  positionFromClientToMarkups(0,event.pageY,0).y);
                });
                isCreating = true;
            } else if (isCreating === true && !isEditing && !selection) {
                d3.selectAll(`line`).filter(function(d, i){ return i === count;}).attr(`x2`,  positionFromClientToMarkups(e1.pageX,0,0).x).attr(`y2`,  positionFromClientToMarkups(0,e1.pageY,0).y);
                isCreating = false;
                count++;
                $(document).off(`mousemove`);
            }

            if(isEditing){
                isEditing = false;
                $(document).off(`mousemove`);
            }
        });

        let width = 0;
        let height = 0;

        document.addEventListener(`resize`, function(){
            $(`#viewer`).attr(`height`, window.innerHeight).attr(`width`, window.innerWidth);
        });

        NOP_VIEWER.addEventListener(Autodesk.Viewing.VIEWER_RESIZE_EVENT, function(e){
            width = e.width;
            height = e.height;
        });

        NOP_VIEWER.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, function(e){
            d3.select(`svg`).attr(`viewBox`, getSvgViewBox(width, height));
        });

        return true;
    };

    Autodesk.Viewing.theExtensionManager.registerExtension(`svgTool`, MarkupsTool);

    let SVG_CANV = `<svg id ="svgCanv"height="971" width="1680" fill ="transparent" stroke="none" pointer-events="painted" style="position: absolute; left: 0px; top:0px; z-index: 12; transform:scale(1,-1); -ms-transform:scale(1,-1); -webkit-transform:scale(1,-1); -moz-transform:scale(1,-1); -o-transform:scale(1,-1); transformOrigin:0, 0; -ms-transformOrigin:0, 0; -webkit-transformOrigin:0, 0; -moz-transformOrigin:0, 0; -o-transformOrigin:0, 0; "></svg>`;

    function getSvgViewBox(clientWidth, clientHeight) {
        // Get pan offset.
        var lt = clientToMarkups(0, 0);
        var rb = clientToMarkups(clientWidth, clientHeight);

        var l = Math.min(lt.x, rb.x);
        var t = Math.min(lt.y, rb.y);
        var r = Math.max(lt.x, rb.x);
        var b = Math.max(lt.y, rb.y);

        return [ l , t, r-l, b-t ].join(` `);
    }

    function clientToMarkups(x, y) {

        var camera = NOP_VIEWER.impl.camera;
        var point = new THREE.Vector3(x, y, 0);

        if (camera.isPerspective) {

            var bb = NOP_VIEWER.impl.getCanvasBoundingClientRect();

            // Multiply by PERSPECTIVE_MODE_SCALE because Firfox on Windows machines have problems to deal with very small paths.
            point.x = (point.x - bb.width  * 0.5) / (bb.height * 0.5) * PERSPECTIVE_MODE_SCALE;
            point.y =-(point.y - bb.height * 0.5) / (bb.height * 0.5) * PERSPECTIVE_MODE_SCALE;
        } else {

            point = clientToWorld(point.x, point.y, 0, NOP_VIEWER);

            // In LMV model is offset by a global offset, we correct this offset when transforming to markups space, so
            // exported markups don't have the offset.
            var globalOffset = NOP_VIEWER.model && NOP_VIEWER.model.getData().globalOffset;
            if (globalOffset) {
                point.add(globalOffset);
            }

            point.add(camera.position);
            point.applyMatrix4(camera.matrixWorldInverse);
            point.z = 0;
        }

        return point;
    }

    function clientToWorld(clientX, clientY, depth, viewer) {

        var point = clientToViewport(clientX, clientY, viewer);
        point.z = depth;

        point.unproject(viewer.impl.camera);
        return point;
    }

    function clientToViewport(clientX, clientY, viewer) {

        return NOP_VIEWER.impl.clientToViewport(clientX, clientY);
    }

    function positionFromClientToMarkups (x, y) {

        return clientToMarkups(x, y);
    }

});