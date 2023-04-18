let notificationLIST = []
let notificationOnItsWay = false;

function addDeclaredNotifications(value){

    if(value == 0){
        addCustomNotification("text", "Nem vagy bejelentkezve", "Először jelentkezz be a kedvencekhez adáshoz!", 5000)
    }else if(value == 1){
        addCustomNotification("text", "Nem vagy bejelentkezve", "Először jelentkezz be a vásárlás lebonyolításához!", 5000)
    }
    showNotification()
}

function addCustomNotification(type, title, subtitle, time){
    notificationLIST.push(new Notification(type, title, subtitle, time));
    showNotification()
}

function clearCurrentNotification(){
    setTimeout(function (){notificationDiv.style.marginLeft = "-450px";notificationDiv.style.opacity = "0";}, 100);
    setTimeout(function (){notificationLIST.splice(0,1);notificationOnItsWay=false;showNotification()}, 500);
    showNotification();
}

function showNotification(){
    if(notificationLIST.length > 0 && !notificationOnItsWay){
        notificationOnItsWay = true;
        notificationDiv.style.marginLeft = "0px";
        notificationDiv.style.opacity = "1";
        notificationTitle.innerText = notificationLIST[0].title;
        notificationSubtitle.innerHTML = notificationLIST[0].subtitle;

        if (notificationLIST[0].time != 0){
            setTimeout(function (){notificationDiv.style.marginLeft = "-450px";notificationDiv.style.opacity = "0";}, notificationLIST[0].time);
            setTimeout(function (){notificationLIST.splice(0,1);notificationOnItsWay=false;showNotification()}, (notificationLIST[0].time + 500));
        }
    }

    if(notificationLIST.length > 0 && !notificationOnItsWay && notificationLIST[0].time == 0){
        notificationLIST.push(notificationLIST[0])
        setTimeout(function (){notificationDiv.style.marginLeft = "-450px";notificationDiv.style.opacity = "0";}, 100);
        setTimeout(function (){notificationLIST.splice(0,1);notificationOnItsWay=false;showNotification()}, 500);
    }
}

class Notification{
    constructor(type, title, subtitle, time){
        this.type = type;
        this.title = title;
        this.subtitle = subtitle;
        this.time = time;
    }
}