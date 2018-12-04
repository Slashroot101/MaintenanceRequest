let changeRequestGraph;
$(document).ready(function () {
    if (!document.querySelector(`#dashboard`)) {
        return;
    }

    let socket = io.connect(document.location.protocol + '//' + document.location.host.substr(0, document.location.host.indexOf(`:`)) + ':8080');

    socket.on('connect', function(data){
      socket.emit('join', getUrlParam(`floor`, window.location.href));

      socket.on('newChangeRequest', function(data){
        if(data.floor === getUrlParam(`floor`, window.location.href)){
            refreshData(getUrlParam(`floor`, window.location.href));
            changeRequestGraph.destroy();
            getChangeRequestPerDay(getUrlParam(`floor`, window.location.href), function(data){
                let labels = [];
                let openedChangeRequests = []
                for(let i = 0; i < data.count.length; i++){
                    labels.push(`${data.count[i]._id.month}/${data.count[i]._id.day}/${data.count[i]._id.year}`);
                    openedChangeRequests.push(data.count[i].count);
                }
                let chartData = {
                    labels,
                    datasets: [{
                        label: `Opened Change Requests`,
                        backgroundColor: `rgba(170, 25, 33, .3)`,
                        data: openedChangeRequests
                    }]
                };
                createChangeRequestGraph(chartData);
            });
        }
      });

      socket.on(`completedChangeRequest`, function(data){
        if(data.floor === getUrlParam(`floor`, window.location.href)){
            refreshData(getUrlParam(`floor`, window.location.href));
        }
      });

    })

    refreshData(getUrlParam(`floor`, window.location.href))


    function getActiveChangeRequests(floor, cb){
        $.get(`/change-request/markups/floor/${floor}/all`, cb);
    }

    function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
          seconds = parseInt((duration / 1000) % 60),
          minutes = parseInt((duration / (1000 * 60)) % 60),
          hours = parseInt((duration / (1000 * 60 * 60)) % 24);
      
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    }

    function getAverageTimeToComplete(floor, cb){
        $.get(`/change-request/floor/${floor}/completed/avg`, cb);
    }

    function getAverageChangePerDay(floor, cb){
        $.get(`/change-request/floor/${floor}/average/day`, cb);
    }

    function getCompletedChangeRequestsForDay(floor, cb){
        $.get(`/change-request/floor/${floor}/completed`, cb);
    }

    function getChangeRequestPerDay(floor, cb){
        $.get(`/change-request/floor/${floor}/day`, cb);
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

    getChangeRequestPerDay(getUrlParam(`floor`, window.location.href), function(data){
        let labels = [];
        let openedChangeRequests = []
        for(let i = 0; i < data.count.length; i++){
            labels.push(`${data.count[i]._id.month}/${data.count[i]._id.day}/${data.count[i]._id.year}`);
            openedChangeRequests.push(data.count[i].count);
        }
        let chartData = {
            labels,
            datasets: [{
                label: `Opened Change Requests`,
                backgroundColor: `rgba(170, 25, 33, .3)`,
                data: openedChangeRequests
            }]
        };
        createChangeRequestGraph(chartData);
    });

    function createChangeRequestGraph(data){
        var chLine = document.getElementById("changeRequestGraph").getContext('2d');
        if (chLine) {
        changeRequestGraph = new Chart(chLine, {
        type: 'line',
        data,
        options: {
            scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: false
                }
            }]
            },
            legend: {
                display: false,
            },
            title: {
                text: `Change Requests`,
                display: true,
                fontFamily: `Helvetica Neue`,
                fontSize: 20,
                fontColor: `#000`
            },
            responsive:true,
            maintainAspectRatio: false
        }
        });
        }
    }

    function refreshData(floor){
        getActiveChangeRequests(floor, function(data){
            if(data){
                $(`#numReq`).html(data.markups.length);
            }
        });
    
        getCompletedChangeRequestsForDay(floor, function(data){
            if(data){
                $(`#numCompleted`).html(data.completed);
            }
        });
    
        getAverageTimeToComplete(floor, function(data){
            if(data.average[0]){
                $(`#completeTime`).html(msToTime(data.average[0].avgTime))
            } else {
                $(`#completeTime`).html(`00:00:00.0`); 
            }
        });
    
        getAverageChangePerDay(floor, function(data){
            if(data.average[0]){
                $(`#avg`).html(data.average[0].average);
            } else {
                $(`#avg`).html(`Not enough data`);
            }
        });
    }
});