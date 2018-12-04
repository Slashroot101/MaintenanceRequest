$(document).ready(function () {
    if (!document.querySelector(`#changeRequestTable`)) {
        return;
    }

    let ChangeRequestTable;
    let socket = io.connect(document.location.protocol + '//' + document.location.host.substr(0, document.location.host.indexOf(`:`)) + ':8080');

    socket.on('connect', function(data){
      socket.emit('join');

      socket.on('newChangeRequest', function(data){
        ChangeRequestTable.row.add([
            data._id,
            data.notes,
            data.floor,
            data.emergency,
            data.createdOn,
            `<td><button type="button" val = "/admin/viewer/floor/${data.floor}/urn/${data.urn}"class="btn btn-success">View</button></td>`
        ]).draw(true);
      });

      socket.on(`completedChangeRequest`, function(socketData){
            ChangeRequestTable.rows(function(idx, data, node){
                return data[0] === socketData.id
            })
            .remove()
            .draw();
      });

    })

    fillChangeRequestTable(function(data){
        for(let i = 0; i < data.length; i++){
            $(`#changeReqs`).find(`tbody`).append(`
            <tr>
                <td>${data[i]._id}</td>
                <td>${data[i].notes}</td>
                <td>${data[i].floor}</td>
                <td>${data[i].emergency}</td>
                <td>${data[i].createdOn}</td>
                <td><button type="button" val = "/admin/viewer/floor/${data[i].floor}/urn/${data[i].urn}"class="btn btn-success">View</button></td>
             </tr>`)
        }
        ChangeRequestTable = $(`#changeReqs`).DataTable();
        $(`#changeReqs`).find(`button`).click(function(e){
            console.log($(e.target))
            window.location.href = $(e.target).attr(`val`);
        });
    });

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


function fillChangeRequestTable(cb){
    $.get(`/change-request/all`, cb)
}