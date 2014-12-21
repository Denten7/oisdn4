
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var ime1;

function zacetnaF() {
    ime = $("#imePacienta").text();
    if(ime.length == 0 || !ime){
        $("#basicModal").modal('show');
    }
    else {
        $("#basicModal").modal('hide');
    }
}

function modelS() {
    $("#basicModal").modal('show');
}

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function dodajUporabnika() {
    sessionId = getSessionId();

    var ime = $("#ime").val();
    var priimek = $("#priimek").val();
    var datum = $("#datum").val();

    $.ajaxSetup({
        headers: {
            "Ehr-Session": sessionId
        }
    });
    $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data) {
            var ehrId = data.ehrId;
            var partyData = {
                firstNames: ime,
                lastNames: priimek,
                dateOfBirth: datum,
                partyAdditionalInfo: [
                    {
                        key: "ehrId", value: ehrId
                    }
                ]
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    if (party.action == 'CREATE') {
                        $("#dodaj").hide();
                        $("#uspesno").text("Uspesno dodan. EHR ID: "+ ehrId);

                        $("#cas").show();
                        setTimeout(function() {
                            $("#cas").fadeOut(1500)
                        }, 7000);
                    }
                },
                error: function(err) {
                }
            });
        }
    });
}

function EHRprofile() {
    sessionId = getSessionId();

    var ehrId = $("#SearchEHR").val();

    if (!ehrId || ehrId.trim().length == 0) {

    } else {
        var leto;
        var mesec;
        var dan;

        $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (data) {
                var party = data.party;
                $("#imePacienta").text(party.firstNames +" "+party.lastNames);
                $("#EHRid").text(ehrId);
                var datumR = party.dateOfBirth;
                leto=datumR.substring(0, 4);
                mesec=datumR.substring(5, 7);
                dan=datumR.substring(8, 10);
                var tempDan = parseInt(dan);
                var tempMesec = parseInt(mesec);
                var templeto = parseInt(leto);
                var danes = new Date();

                var dan1 = parseInt(danes.getDate());
                var mesec1 = parseInt(danes.getMonth())+1;
                var leto1 = parseInt(danes.getFullYear());

                var temp = leto1 - templeto;

                if(mesec1 > tempMesec){
                    $("#starost").text(temp);
                }
                else if(mesec1 == tempMesec && (tempDan < dan1 || tempDan == dan1)){
                    $("#starost").text(temp);
                }
                else{
                    temp = temp-1
                    $("#starost").text(temp);
                }


                $("#datumRojstva").text(dan+"."+mesec+"."+leto);
            },
            error: function(err) {
                $("#preberiSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
                console.log(JSON.parse(err.responseText).userMessage);
            }
        });
        $("#teza1").text("");
        $("#visina1").text("");
        $.ajaxSetup({
            headers: {
                "Ehr-Session": sessionId
            }
        });
        $.ajax({
            url: baseUrl + "/view/" + ehrId + "/weight",
            type: 'GET',
            success: function (res) {
                $("#teza1").text(res[0].weight)
            }

        });
        $.ajax({
            url: baseUrl + "/view/" + ehrId + "/height",
            type: 'GET',
            success: function (res) {
                $("#visina1").text(res[0].height);
            }
        });

        $("#tabela").hide();
        $("#tabela1").hide();
        $("#tabela2").hide();
        $("#tabela3").hide();
        $("#tabela4").hide();

    }
}

function dodajVZ() {
    sessionId = getSessionId();

    var ehrId = $("#EHRid").text();
    var datumInU = $("#datumInUra").val();
    var telesnaVis = $("#visina").val();
    var telesnaTez = $("#teza").val();
    var telesnaTemp = $("#temp").val();
    var krvniS = $("#Skrvni").val();
    var krvniD = $("#Dkrvni").val();
    var nasKisik = $("#Nas02").val();
    var merilec = $("#merilec").val();

    $.ajaxSetup({
        headers: {"Ehr-Session": sessionId}
    });
    var podatki = {
        // Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
        "ctx/language": "en",
        "ctx/territory": "SI",
        "ctx/time": datumInU,
        "vital_signs/height_length/any_event/body_height_length": telesnaVis,
        "vital_signs/body_weight/any_event/body_weight": telesnaTez,
        "vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemp,
        "vital_signs/body_temperature/any_event/temperature|unit": "°C",
        "vital_signs/blood_pressure/any_event/systolic": krvniS,
        "vital_signs/blood_pressure/any_event/diastolic": krvniD,
        "vital_signs/indirect_oximetry:0/spo2|numerator": nasKisik
    };

    var parametriZahteve = {
        "ehrId": ehrId,
        templateId: 'Vital Signs',
        format: 'FLAT',
        committer: merilec
    };

    $.ajax({
        url: baseUrl + "/composition?" + $.param(parametriZahteve),
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(podatki),
        success: function (res) {
            $("#meritve").hide();
            $("#dodajMeritev").show();
            $("#uspesno").show();
            setTimeout(function() {
                $("#uspesno").fadeOut(1500)
            }, 5000);

            EHRprofile();
        },
        error: function(err) {
            $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });

}

function poenostavi() {
    EHRprofile();
}


function zgodovinaMerjenjTemp() {
    sessionId = getSessionId();
    var ehrId = $("#EHRid").text();
    var tip = $("#preberiEHR1").val();
    if(tip.length == 0){
        $.ajax({
            url: baseUrl + "/view/" + ehrId + "/" + "body_temperature",
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (res) {
                if (res.length > 0) {
                    var konrezultat = "<table class='table table-bordered' id='tabela'><tr style='background-color: aquamarine'><th class='text-center'>Datum in ura</th><th class='text-center'>Telesna temperatura</th></tr>";
                    for (var i in res) {
                        konrezultat += "<tr><td class='text-center'>" + res[i].time + "</td><td class='text-center'>" + res[i].temperature + " " 	+ res[i].unit + "</td>";
                    }
                    konrezultat += "</table>";
                    $("#rezultat").html(konrezultat);
                } else {
                    $("#nd1").show();
                    setTimeout(function() {
                        $("#nd1").fadeOut(1500)
                    }, 5000);
                }
            },
            error: function() {
                console.log(JSON.parse(err.responseText).userMessage);
            }
        });
    }
    else if(tip == "Podhladitev"){
        var AQL =
            "select " +
            "t/data[at0002]/events[at0003]/time/value as time, " +
            "t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperatura_telesa, " +
            "t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as enota " +
            "from EHR e[e/ehr_id/value='" + ehrId + "'] " +
            "contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
            "where t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude<36 " +
            "order by t/data[at0002]/events[at0003]/time/value desc " +
            "limit 10";

        $.ajax({
            url: baseUrl + "/query?" + $.param({"aql": AQL}),
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (res) {
                var konrezultat = "<table class='table table-bordered' id='tabela'><tr style='background-color: aquamarine'><th class='text-center'>Datum in ura</th><th class='text-center'>Telesna temperatura</th></tr>";
                if (res) {
                    var rez = res.resultSet;
                    for (var i in rez) {
                        konrezultat += "<tr><td class='text-center'>" + rez[i].time + "</td><td class='text-center'>" + rez[i].temperatura_telesa + " " 	+ rez[i].enota + "</td>";
                    }
                    konrezultat += "</table>";
                    $("#rezultat").html(konrezultat);
                } else {
                    $("#nd1").show();
                    setTimeout(function() {
                        $("#nd1").fadeOut(1500)
                    }, 5000);
                }
            },
            error: function() {
                console.log(JSON.parse(err.responseText).userMessage);
            }
        });
    }

    else if(tip == "Vročina"){
        var AQL =
            "select " +
            "t/data[at0002]/events[at0003]/time/value as time, " +
            "t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperatura_telesa, " +
            "t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as enota " +
            "from EHR e[e/ehr_id/value='" + ehrId + "'] " +
            "contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
            "where t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude>37.2 " +
            "order by t/data[at0002]/events[at0003]/time/value desc " +
            "limit 5";

        $.ajax({
            url: baseUrl + "/query?" + $.param({"aql": AQL}),
            type: 'GET',
            headers: {"Ehr-Session": sessionId},
            success: function (res) {
                var konrezultat = "<table class='table table-bordered' id='tabela'><tr style='background-color: aquamarine'><th class='text-center'>Datum in ura</th><th class='text-center'>Telesna temperatura</th></tr>";
                if (res) {
                    var rez = res.resultSet;
                    for (var i in rez) {
                        konrezultat += "<tr><td class='text-center'>" + rez[i].time + "</td><td class='text-center'>" + rez[i].temperatura_telesa + " " 	+ rez[i].enota + "</td>";
                    }
                    konrezultat += "</table>";
                    $("#rezultat").html(konrezultat);
                } else {
                    $("#nd1").show();
                    setTimeout(function() {
                        $("#nd1").fadeOut(1500)
                    }, 5000);
                }
            },
            error: function() {
                console.log(JSON.parse(err.responseText).userMessage);
            }
        });
    }



}

function zgodovinaMerjenjTeza() {
    sessionId = getSessionId();
    var ehrId = $("#EHRid").text();

    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "weight",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            if (res.length > 0) {
                var konrezultat = "<table class='table table-bordered' id='tabela1'><tr style='background-color: aquamarine'><th class='text-center'>Datum in ura</th><th class='text-center'>Telesna teža</th></tr>";
                for (var i in res) {
                    konrezultat += "<tr><td class='text-center'>" + res[i].time + "</td><td class='text-center'>" + res[i].weight + " " 	+ res[i].unit + "</td>";
                }
                konrezultat += "</table>";
                $("#rezultat1").html(konrezultat);
            } else {
                $("#nd1").show();
                setTimeout(function() {
                    $("#nd1").fadeOut(1500)
                }, 5000);
            }
        },
        error: function() {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });

}

function zgodovinaMerjenjTlak() {
    sessionId = getSessionId();
    var ehrId = $("#EHRid").text();

    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            if (res.length > 0) {
                var konrezultat = "<table class='table table-bordered' id='tabela2'><tr style='background-color: aquamarine'><th class='text-center'>Datum in ura</th><th class='text-center'>Krvni tlak</th></tr>";
                for (var i in res) {
                    konrezultat += "<tr><td class='text-center'>" + res[i].time + "</td><td class='text-center'>" + res[i].systolic + "/" + res[i].diastolic + " " + res[i].unit + "</td>";
                }
                konrezultat += "</table>";
                $("#rezultat2").html(konrezultat);
            } else {
                $("#nd1").show();
                setTimeout(function() {
                    $("#nd1").fadeOut(1500)
                }, 5000);
            }
        },
        error: function() {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });
}

function zgodovinaMerjenjVisina() {
    sessionId = getSessionId();
    var ehrId = $("#EHRid").text();

    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "height",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            if (res.length > 0) {
                var konrezultat = "<table class='table table-bordered' id='tabela3'><tr style='background-color: aquamarine'><th class='text-center'>Datum in ura</th><th class='text-center'>Telesna visina</th></tr>";
                for (var i in res) {
                    konrezultat += "<tr><td class='text-center'>" + res[i].time + "</td><td class='text-center'>" + res[i].height + " " 	+ res[i].unit + "</td>";
                }
                konrezultat += "</table>";
                $("#rezultat3").html(konrezultat);
            } else {
                $("#nd1").show();
                setTimeout(function() {
                    $("#nd1").fadeOut(1500)
                }, 5000);
            }
        },
        error: function() {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });

}

function zgodovinaMerjenjNasicenost() {
    sessionId = getSessionId();
    var ehrId = $("#EHRid").text();

    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "height",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            if (res.length > 0) {
                var konrezultat = "<table class='table table-bordered' id='tabela4'><tr style='background-color: aquamarine'><th class='text-center'>Datum in ura</th><th class='text-center'>Telesna visina</th></tr>";
                for (var i in res) {
                    konrezultat += "<tr><td class='text-center'>" + res[i].time + "</td><td class='text-center'>" + res[i].spO2 + " " 	+ res[i].unit + "</td>";
                }
                konrezultat += "</table>";
                $("#rezultat4").html(konrezultat);
            } else {
                $("#nd1").show();
                setTimeout(function() {
                    $("#nd1").fadeOut(1500)
                }, 5000);
            }
        },
        error: function() {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });

}


function prevezi() {
    window.location.href="uprProfil.html"
}



$(document).ready(function(){
    $("#zacni").click(function() {
        $("#ime").text("");
        $("#priimek").text("");
        $("#datum").text("");
        $("#bolezen").text("");
        $("#dodaj").toggle();
    });

    $("#dodajMeritev").click(function() {
        $("#meritve").toggle();
    });

    $("#dodajMer").click(function() {

    });

    $('#preberiEHR').change(function() {
        $("#SearchEHR").val($(this).val());
    });

    $('#preberiEHR1').change(function() {
        var podatki = $(this).val().split(",");
        $("#ime").val(podatki[0]);
        $("#priimek").val(podatki[1]);
        $("#datum").val(podatki[2]);
    });

});