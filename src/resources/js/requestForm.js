
$(document).ready(function () {
    if (!document.querySelector(`#changeRequestForm`)) {
        return;
    }

    let campuses = [{
        id: 1,
        name: "Victory Parkway Campus",
        buildings: [{
                name: "VPC Administration Bldg",
                floors: [{
                        name: "01",
                        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTExLTA1LTE4LTAzLTM3LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1ZQQ0FETUlOMDEuZHdn"
                    },
                    {
                        name: "02",
                        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTExLTA5LTE4LTM4LTM5LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1ZQQ0FETUlOLTAyLmR3Zw"
                    },
                    {
                        name: "03",
                        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTExLTA5LTE4LTQwLTI0LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1ZQQ0FETUlOLTAzLmR3Zw"
                    },
                    {
                        name: "04",
                        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTExLTA5LTE4LTQxLTE0LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1ZQQ0FETUlOLTA0LmR3Zw"
                    },
                    {
                        name: "05",
                        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTExLTA5LTE4LTQxLTUyLWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1ZQQ0FETUlOLTA1LmR3Zw"
                    },
                    {
                        name: "06",
                        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTExLTA5LTE4LTQyLTI5LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1ZQQ0FETUlOLTA2LmR3Zw"
                    },
                    {
                        name: "07",
                        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTExLTA5LTE4LTQzLTA2LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1ZQQ0FETUlOLTA3LmR3Zw"
                    },
                    {
                        name: "08",
                        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTExLTA5LTE4LTQzLTM2LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1ZQQ0FETUlOLTA4LmR3Zw"
                    },
                    {
                        name: "09",
                        urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE4LTExLTA5LTE4LTQ0LTE5LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL1ZQQ0FETUlOLTA5LmR3Zw"
                    },
                ]
            },
            {
                name: "VPC Classroom Building",
                floors: [{
                        name: "P"
                    },
                    {
                        name: "00"
                    },
                    {
                        name: "01"
                    },
                ]
            },
            {
                name: "VPC Library",
                floors: [{
                        name: "01"
                    },
                    {
                        name: "02"
                    },
                    {
                        name: "03"
                    },
                ]
            },
            {
                name: "VPC North Laboratory",
                floors: [{
                        name: "01"
                    },
                    {
                        name: "02"
                    },
                    {
                        name: "03"
                    },
                ]
            },
            {
                name: "VPC Science Building",
                floors: [{
                        name: "01"
                    },
                    {
                        name: "02"
                    },
                    {
                        name: "03"
                    },
                    {
                        name: "04"
                    },
                    {
                        name: "05"
                    },
                ]
            }
        ]
    }, ]


    let campusSelect = $("#campusSelect");
    campusSelect.empty();
    campusSelect.append('<option selected="true" disabled>Choose...');
    campusSelect.prop('selectedIndex', 0);

    let buildingSelect = $("#buildingSelect");
    buildingSelect.empty();
    buildingSelect.append('<option selected="true" disabled>Choose...');
    buildingSelect.prop('selectedIndex', 0);

    let floorSelect = $("#floorSelect");
    floorSelect.empty();
    floorSelect.append('<option selected="true" disabled>Choose...');
    floorSelect.prop('selectedIndex', 0);

    let roomSelect = $("#roomSelect");
    roomSelect.empty();
    roomSelect.append('<option selected="true" disabled>Choose...');
    roomSelect.prop('selectedIndex', 0);

    $.each(campuses, function (key, entry) {
        campusSelect.append($('<option></option>').attr('value', entry.name).text(entry.name));
    })

    $(`#campusSelect`).change(function (event) {
        let selectedCampus = this.value;
        let selectedIndex = $('option:selected', this).index();

        buildingSelect.empty();
        buildingSelect.append('<option selected="true" disabled>Choose a building...');
        buildingSelect.prop('selectedIndex', 0);

        floorSelect.empty();
        floorSelect.append('<option selected="true" disabled>Choose a floor...');
        floorSelect.prop('selectedIndex', 0);

        roomSelect.empty();
        roomSelect.append('<option selected="true" disabled>Choose a room...');
        roomSelect.prop('selectedIndex', 0);

        $.each(campuses[selectedIndex - 1].buildings, function (key, entry) {
            buildingSelect.append($('<option></option>').attr('value', entry.name).text(entry.name));
        })
    });

    $(`#buildingSelect`).change(function (event) {
        let selectedBuilding = this.value;
        let selectedCampusIndex = $(`#campusSelect`).index();
        let selectedBuildingIndex = $(`#buildingSelect`).index();

        floorSelect.empty();
        floorSelect.append('<option selected="true" disabled>Choose a floor...');
        floorSelect.prop('selectedIndex', 0);

        $.each(campuses[selectedCampusIndex - 1].buildings[selectedBuildingIndex - 1].floors, function (key, entry) {
            floorSelect.append($('<option></option>').val(entry.name).text(entry.name));
        })
    });

    $(`#changeRequestForm`).submit(function (event) {
        let urn;

        for(let i = 0; i < campuses[0].buildings[0].floors.length; i++){
            if(campuses[0].buildings[0].floors[i].name === $(`#floorSelect`).val()){
                urn = campuses[0].buildings[0].floors[i].urn
                break;
            }
        }

        event.preventDefault();
        let postData = {
            campus : $(`#campusSelect`).val(),
            building : $(`#campusSelect`).val(),
            floor : $(`#floorSelect`).val(),
            room : $(`#roomSelect`).val(),
            emergency : $(`#emergencySelect`).val(),
            description : $(`#descriptionTextArea`).val(),
            createdBy: $(`#currentUser`).html().trim(),
            urn: urn
        }

        $.ajax({
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            url: "/change-request",
            data: JSON.stringify(postData),
            cache: false,
            timeout: 600000,
            success: function (data) {
                let changeRequestId = data;
                window.location.href = `/viewer/urn/${urn}/change-request/${changeRequestId}`;
            },
            error: function (e) {
                console.log("ERROR : ", e);
            }
        });

    });

})