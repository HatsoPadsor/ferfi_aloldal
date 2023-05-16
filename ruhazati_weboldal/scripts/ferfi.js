let json;
let searchList = [];

const pageContent = document.getElementById("page_content");
const navBar = document.getElementById("navbar");
const highlightedVideo = document.getElementById("highlighted_video");
const highlightedVideoCover = document.getElementById("highlighted_video_cover");

const searchedProductsDiv = document.getElementById("searched_products_div");
const foundedProducts = document.getElementById("founded_products");
const searchedTextQ = document.getElementById("searched_text_q");
const sortBy = document.getElementById("sort_by");
const searchByInput = document.getElementById("search_by_input");
const searchProductBar = document.getElementById("search_product_bar");

const productBar = document.getElementById("product_bar");

const maxPriceInput = document.getElementById("max_price_input");
const maxPriceFont = document.getElementById("max_price_font");

const colorWhite = document.getElementById("color_white");
const colorBlack = document.getElementById("color_black");
const colorColorful = document.getElementById("color_colorful");
const sizeListDiv = document.getElementById("size_list_div");

const leftSidebar = document.getElementById("left_sidebar");
const clothsCat = document.getElementById("cloths_cat");

const notificationDiv = document.getElementById("notification_div")
const notificationTitle = document.getElementById("notification_title")
const notificationSubtitle = document.getElementById("notification_subtitle")

const prodModal = document.getElementById("prod_modal");
const modalName = document.getElementById("modal_name");
const modalImage = document.getElementById("modal_image");
const modalDescription = document.getElementById("modal_description");
const modalPrice = document.getElementById("modal_price");
const modalColors = document.getElementById("modal_colors");
const modalSizes = document.getElementById("modal_sizes");
const modalSizesWarning = document.getElementById("modal_sizes_warning");
const modalAvailible = document.getElementById("modal_availible");
const modalCloseButton = document.getElementById("modal_close_button");
const modalActionFont = document.getElementById("modal_action_font");

const failedToLoadDiv = document.getElementById("failed_to_load_div");

let mode = false;
let isModeChanging = false;

//A gigakemény navigációssávhoz tartozó script
const onScroll = () =>{
    const scrollPosition = window.scrollY;
    navBar.classList.toggle("scrolled-down", scrollPosition>56);
}

//Ha a kiemelt videó felé tartjuk az egeret, megjelenik egy rövid leírás
function showHightlightedVideoCover(){
    highlightedVideoCover.style.top = "0px";
    highlightedVideoCover.style.opacity = "1";
    highlightedVideo.style.zo = "1";
}

//Ha a kiemelt videó felől elvisszük az egeret, a feliratok eltűnnek
function hideHightlightedVideoCover(){
    highlightedVideoCover.style.top = "20px";
    highlightedVideoCover.style.opacity = "0";
}

//A modal ablak, ami összegzi a termék információit
function openModal(index){
    prodModal.style.display = "block";
    modalName.innerHTML = searchList[index]["name"];
    modalImage.src = searchList[index]["image"];
    modalImage.alt = searchList[index]["name"];
    modalDescription.innerHTML = searchList[index]["description"];
    modalPrice.innerHTML =  Number(searchList[index]["price"]).toLocaleString('hu-HU', {style: 'currency', currency: 'HUF'});
    modalAvailible.innerHTML =  (searchList[index]["availability"] == "0" ? "Nem rendelhető" : "Rendelhető")
    modalActionFont.innerHTML =  (searchList[index]["availability"] == "0" ? '<span class="material-symbols-outlined" id="modal_action_icon" style="margin-right: 5px;">favorite</span>Kedvencekhez ad' : '<span class="material-symbols-outlined" id="modal_action_icon" style="margin-right: 5px;">shopping_cart</span>Vásárlás most')

    //Melyik hibaértesítés jelenjen meg (nem vásárolható vagy nem lehet kívánságlistára tenni)
    modalActionFont.onclick = () =>{
        addDeclaredNotifications((searchList[index]["availability"] == "0")?0:1)
    }

    //Melyik hibaüzenet jelenjen meg (nem elérhető a termék vagy a pénztárnál lehet variánst választani)
    modalSizesWarning.innerHTML = (searchList[index]["availability"] == "0" ? 'Ez a termék jelenleg nincs raktáron!' : 'A rendelés leadásánál tudod kiválasztani a termék színét és méretét!')

    //Méretek betöltése
    let sizes = "";
    for(let i = 0; i<searchList[index]["sizes"].length;i++){
        sizes+="<font style='border-radius: 32px; border: 1px solid goldenrod; color:goldenrod;margin-right: 5px; padding: 5px 10px;'>"+searchList[index]["sizes"][i]+"</font>"
    }

    //Színek betöltése
    let colors = "";
    for(let i = 0; i<searchList[index]["colors"].length;i++){
        if((i+1) != searchList[index]["colors"].length)colors+="<font style=''>"+searchList[index]["colors"][i]+", </font>"
        else colors+="<font style=''>"+searchList[index]["colors"][i]+"</font>"
    }

    modalSizes.innerHTML = sizes;
    modalColors.innerHTML = colors;

    setTimeout(function(){
        prodModal.style.opacity = "1";
    },100);
}

//A modal ablak bezárása :((
function closeModal(){
    prodModal.style.opacity = "0";

    setTimeout(function(){
        prodModal.style.display = "none";
    },300);
}

loadFile()

document.addEventListener("scroll", onScroll, {passive: true});


window.onclick = function(event) {
    if (event.target == prodModal) {
        closeModal(); //A modal ablak bezárása
    }
}

//Fetcheljük a termékek json fájlját
async function loadFile(){

    let response = await fetch("../prod_json/prod.json").then(async (response) => {
        json = await response.json()
        if (response.ok) {
            loadProd();
        } else failedToLoad();
    }).catch(error => {
        console.log(error)
        failedToLoad();
    });
}

//Hiba történt a fetchelés során
async function failedToLoad(){
    failedToLoadDiv.style.display = "flex";
    pageContent.style.display = "none";
}

//Az alap terméklista betöltése
function loadProd(){
    searchList = [];
    leftSidebar.innerHTML="";
    clothsCat.innerHTML = "";
    let minPrice = json["categories"][0]["products"][0]["price"], maxPrice = json["categories"][0]["products"][0]["price"];

    for(let kategoria in json["categories"]){
        let prodHTML = ""; //A termékeket gyűjti egybe a kategórián belül
        let availableProducts = 0; //Ez ellenőrzi, hogy az adott kategóriából elérhető-e egyáltalán valami
        let catHTML = ""; //:3 //A kategóriák HTML kódjáért felel

        let clotHTML = ""; //A jobb oldalon lévő termékek menüben a kategóriák elválasztásához szükséges HTML kódok

        clothsCat.innerHTML+="<div id='"+json["categories"][kategoria]["link"]+"'></div>"

        //A termék kártya összerakása
        catHTML += '<div class="left_sidebar_category" onclick="selectCategory(this);" data-value="'+json["categories"][kategoria]["name"]+'">'
        catHTML += '<img src="' + json["categories"][kategoria]["image"] + '" alt="' + json["categories"][kategoria]["name"] + '" style="width: 50px; height: 60px; object-fit: cover; object-position:">'

        prodHTML += '<div class="product-grid">';
        for(let i = 0; i < json["categories"][kategoria]["products"].length; i++){
            let termek = json["categories"][kategoria]["products"][i];

            //Minimum ár kiválasztása
            if(Number(termek["price"])<minPrice) minPrice = Number(termek["price"]);
            //Maximum ár kiválasztása
            if(Number(termek["price"])>maxPrice) maxPrice = Number(termek["price"]);

            prodHTML += '<div class="product-card">';
            prodHTML += '<div onclick="openModal('+searchList.length+');">';
            prodHTML += '<img src="' + termek["image"] + '" alt="' + termek["name"] + '">';
            prodHTML += '<h3>' + termek["name"] + '</h3>';
            prodHTML += '<h4>' + termek["description"] + '</h4>';
            prodHTML += '<p><font class="product_price">' + Number(termek["price"]).toLocaleString('hu-HU', {style: 'currency', currency: 'HUF'}) + '</font> <font class="product-availablity">' + (termek["availability"] == "0" ? "Nincs raktáron" : "Elérhető") + '</font></p>';
            prodHTML += '</div>';
            if(termek["availability"] != "0"){
                prodHTML += '<div style="display: flex; align-items: center;">';
                prodHTML += '<span class="buy_button" style="width: 80%;" onclick="addDeclaredNotifications(1);"><span class="material-symbols-outlined" style="margin-right: 5px;">shopping_cart</span><span style="height: 100%;font-weight: bold;">Vásárlás most</span></span>';
                prodHTML += '<span class="favorite_button" style="display: flex; justify-content: center;" onclick="addDeclaredNotifications(0);"><span class="material-symbols-outlined" style="">favorite</span></span>';
                prodHTML += '</div>';
            }else prodHTML += '<span class="favorite_button" style="display: flex;justify-content: center;" onclick="addDeclaredNotifications(0);"><span class="material-symbols-outlined" style="margin-right: 5px;margin-top: -1px;">favorite</span><span>Kedvencekhez adás</span></span>';
            prodHTML += '</div>';

            if(termek["availability"] != "0") availableProducts++;

            //A termékek egy listába való gyűjtése
            searchList.push(termek)
        }

        prodHTML += '</div>';
        clotHTML+='<div style="display: flex; align-items: center;justify-content: center;">'
        if(json["categories"][kategoria]["show_logo"]){ //Ahol egy kép is megjelenik a termék-kategória mellett, az itt rakódik össze
            clotHTML+='<img src="'+json["categories"][kategoria]["image"]+'" alt="'+json["categories"][kategoria]["name"]+' Logó" style="height: 60px;width: 50px;">'
            clotHTML+='<h1>'+json["categories"][kategoria]["name"]+'</h1>'
            catHTML += '<a>' + json["categories"][kategoria]["name"] + ' Cuccok</a>'
        }else{
            catHTML += '<a>' + json["categories"][kategoria]["name"] + '</a>'
            clotHTML+='<h1>'+json["categories"][kategoria]["name"]+'</h1>'
        }
        clotHTML+='</div>'
        document.getElementById(json["categories"][kategoria]["link"]).innerHTML+=clotHTML;
        document.getElementById(json["categories"][kategoria]["link"]).innerHTML+=prodHTML;
        if(availableProducts == 0) catHTML+= '<h6 class="out_of_h6">Készlethiány</h6>';
        catHTML+= '</div>';
        leftSidebar.innerHTML+=catHTML;

        //Az ár szerinti szűrés beállítása
        maxPriceInput.min = minPrice;
        maxPriceInput.max = maxPrice;
        if(maxPriceInput.value = -1)maxPriceInput.value = maxPriceInput.max;
        maxPriceFont.innerHTML =  Number(maxPrice).toLocaleString('hu-HU', {style: 'currency', currency: 'HUF'});
    }

}

//Kategóriaváltáskor be-, illetve kipipálja az adott kategóriát, függően a jelenlegi állapottól
function selectCategory(cat){
    if(cat.classList.contains("checked")){
        cat.classList.remove("checked")
    }else cat.classList.add("checked")
    searching();
    searching();
}

//Ez a legacy keresés, a weboldal most már itt nézi meg, hogy a felhasználló keresést hajt-e végre az oldalon, vagy csak az alap oldalt szeretné-e látni
function searching(){
    maxPriceFont.innerHTML =  Number(maxPriceInput.value).toLocaleString('hu-HU', {style: 'currency', currency: 'HUF'});
    mode = false;
    if(searchByInput.value.length > 0) mode=true;
    if(Number(maxPriceInput.value) < Number(maxPriceInput.max)) mode=true;
    if(colorWhite.checked) mode=true;
    if(colorBlack.checked) mode=true;
    if(colorColorful.checked) mode=true;
    if(hasSelectedCategory())mode=true;
    getSelectedCategoryNumber();

    if(!isModeChanging)changeMode();
    else{
        setTimeout(()=>{
            changeMode();
        },300)
    }
}

//Visszaadja, hogy van-e kategória kiválasztva
function hasSelectedCategory(){
    let selectedCategory = document.getElementsByClassName("left_sidebar_category")
    for(let i = 0;i<selectedCategory.length;i++){
        if(selectedCategory[i].classList.contains("checked")) return true;
    }
    return false;
}

//Visszaadja, hogy hány kategória van kiválasztva
function getSelectedCategoryNumber(){
    let selectedCategory = document.getElementsByClassName("left_sidebar_category checked")
    if(selectedCategory.length == 1) manageSizes();
    else{
        sizeListDiv.innerHTML = '<div style="display: flex; align-items: center;"> <span class="material-symbols-outlined" style="margin-right: 5px;">warning</span><font>Választanod kell 1 kategóriát</font></div>'
    }
    return selectedCategory.length;
}

//A méretek szűrési menüt kezeli, csak akkor lehet méretet választani, ha 1 kategória ki van jelölve, se többet, se kevesebbet
function manageSizes(){
    let sizeList = new Set();


    for(let kategoria in json["categories"]){
        for(let i = 0; i < json["categories"][kategoria]["products"].length; i++){
            let termek = json["categories"][kategoria]["products"][i];

            //Méretek gyűjtése
            if(isCorrectCategory(json["categories"][kategoria]["name"])){
                for(let i = 0;i < termek["sizes"].length;i++){
                    sizeList.add(termek["sizes"][i])
                }
            }
        }
    }

    //Méretek kiírása
    let sizeHTML = "";
    for(let meret of sizeList){
        sizeHTML += '<label for="size_checkbox'+meret+'" class="checkbox-label">';
        sizeHTML += '<input type="checkbox" id="size_checkbox'+meret+'" class="size_checkbox" oninput="searchProduct()" data-value="'+meret+'">';
        sizeHTML += '<span class="checkbox-symbol">'+meret+'</span>';
        sizeHTML += '</label>';
    }
    sizeListDiv.innerHTML = sizeHTML;
}

//Mód váltás - false: ha a felhasználó nincs keresés módban|true: ha a felhasználó keresést hajt végre (szöveg alapján keres vagy szűr valami szerint)
function changeMode(){
    isModeChanging = true;
    if(!mode){ //A kezdőképernyő a kiemelt videóval és külön kategóriákra bontással jelenjen meg, a keresési képernyő tűnjön el
        productBar.style.display = "flex";
        searchedProductsDiv.style.opacity = "0";
        setTimeout(function(){
            searchedProductsDiv.style.display = "none";
            productBar.style.opacity = "1";
            isModeChanging = false;
        }, 300);
        loadProd()
    }else{ //A kezdőképernyő a kiemelt videóval és külön kategóriákra bontással tűnjün el, a keresési képernyő jelenjen meg
        productBar.style.opacity = "0";
        searchedProductsDiv.style.display = "block";
        setTimeout(function(){
            productBar.style.display = "none";
            searchedProductsDiv.style.opacity = "1";
            isModeChanging = false;
        }, 300);
        searchProduct();
    }
}

//Termékek keresése, szűrések végrehajtása
function searchProduct(){
    searchList = [];
    let maxPriceValue = Number(maxPriceInput.value);
    let filterList = [];
    searchProductBar.innerHTML = "";

    maxPriceFont.innerHTML = Number(maxPriceInput.value).toLocaleString('hu-HU', {style: 'currency', currency: 'HUF'});

    //A szűrési szempontok összeállítása szöveges formában
    if(searchByInput.value.length > 0) filterList.push("név vagy leírás")
    if(Number(maxPriceInput.value) < Number(maxPriceInput.max)) filterList.push("ár")
    if(colorWhite.checked||colorBlack.checked||colorColorful.checked) filterList.push("szín")
    if(hasSelectedCategory()) filterList.push("kategória")

    for(let kategoria in json["categories"]){ //Végigmegyünk a kategóriákon
        for(let i = 0; i < json["categories"][kategoria]["products"].length; i++){ //Végigmegyünk a termékeken
            let termek = json["categories"][kategoria]["products"][i]; //Ez az aktuálisan vizsgált termék

            if(isCorrectCategory(json["categories"][kategoria]["name"])){ //Megfelel a termék a kategóriának?
                if(isContainsDesc(termek, filterList)){ //Megfelel a termék az adott szöveges értéknek?
                    if(isLessPriceLimit(termek)){ //Megfel a termék a felhasznál által megadott maximális költségnek?
                        if(isCorrectColor(termek)){ //Megfelel a termék a szűrt színeknek?
                            if(isCorrectSize(termek)){ //Megfelel a termék a megadott méreteknek?
                                searchList.push(termek)
                            }
                        }
                    }
                }
            }
        }
    }

    //Rendezés: Relevancia szerint rendezi alapból, és ha váltunk, akkor is eszerint rendezi először, így erre felesleges külön ágat írni
    if(sortBy.value == "Ár szerint növekvő"){
        searchList.sort((a, b) => a.price - b.price);
    }else if(sortBy.value == "Ár szerint csökkenő"){
        searchList.sort((a, b) => b.price - a.price);
    }


    if(searchList.length > 0){ //Van olyan termék, ami megfelet a szűrésnek?
        let prodHTML = ""; //A termékek HTML kódja
        prodHTML += '<div class="product-grid">';
        for(let i = 0; i < searchList.length; i++){
            let termek = searchList[i]
            prodHTML += '<div class="product-card">';
            prodHTML += '<div onclick="openModal('+i+');">';
            prodHTML += '<img src="' + termek["image"] + '" alt="' + termek["name"] + '">';
            prodHTML += '<h3>' + termek["name"] + '</h3>';
            prodHTML += '<h4>' + termek["description"] + '</h4>';
            prodHTML += '<p><font class="product_price">' + Number(termek["price"]).toLocaleString('hu-HU', {
                style: 'currency',
                currency: 'HUF'
            }) + '</font> <font class="product-availablity">' + (termek["availability"] == "0" ? "Nincs raktáron" : "Elérhető") + '</font></p>';
            prodHTML += '</div>';
            if(termek["availability"] != "0"){
                prodHTML += '<div style="display: flex; align-items: center;">';
                prodHTML += '<span class="buy_button" style="display: flex; justify-content: center; width: 80%;" onclick="addDeclaredNotifications(1);"><span class="material-symbols-outlined" style="margin-right: 5px;">shopping_cart</span>Vásárlás most</span>';
                prodHTML += '<span class="favorite_button" style="display: flex; justify-content: center;" onclick="addDeclaredNotifications(0);"><span class="material-symbols-outlined" style="">favorite</span></span>';
                prodHTML += '</div>';
            }else prodHTML += '<span class="favorite_button" style="display: flex; justify-content: center;" onclick="addDeclaredNotifications(0);"><span class="material-symbols-outlined" style="margin-right: 5px;">favorite</span>Kedvencekhez adás</span>';
            prodHTML += '</div>';
        }
        prodHTML += '</div>';
        searchProductBar.innerHTML = prodHTML;
    }else{
        searchProductBar.innerHTML = "<h1 style='text-align: center;'>Nincs a kívánt szűrőknek megfelelő termék</h1>";
    }

    foundedProducts.innerHTML = searchList.length;

}

//Megvizsgálja, hogy az adott termék belefér-e a felhasználó által megadott keretbe
function isLessPriceLimit(termek){
    return Number(termek["price"]) <= maxPriceInput.value; //true: az adott termék kevesebbe vagy pont ugyanannyiba kerül, mint a határérték|false: a termék többe kerül mint amennyit a felhasználó megadott
}

//Megnézi, hogy tartalmazza-e az adott kifejezéseket, amelyeket a felhasználó megadott
function isContainsDesc(termek, filterList){
    if(searchByInput.value.length == 0){ //Ha nincs megadott kulcsszó, akkor a szűrési szempontok jelenjenek meg a keresésnél, ne a megadott szöveg
        searchedTextQ.innerHTML = "";
        for(let i = 0;i<filterList.length;i++){
            //Minvel ez egy felsorolás, ezért a vesszővel és a kötőjellel játszani kell
            if(i != 1&&(i+1)!=filterList.length) searchedTextQ.innerHTML+= filterList[i] + "-,";
            else searchedTextQ.innerHTML+= filterList[i] + " szerint"
        }
        return true;
    }

    let searchValue = searchByInput.value.toLowerCase();
    searchedTextQ.innerHTML = searchValue;
    return termek["name"].toLowerCase().includes(searchValue) || termek["description"].toLowerCase().includes(searchValue); //true: ha a termék neve vagy leírása tartalmazza a megadott szövegrészletet|false: a termék neve és leírása sem tartalmazza a megadott szövegrészletet
}

//Megvizsgálja, hogy a termék tartalmaz-e színt a bejelölt(ek) közül
function isCorrectColor(termek){
    //Ha semmi sincs bejelölve, akkor nem szűrtünk, tehát nem kell szűrés
    if(!colorWhite.checked && !colorBlack.checked && !colorColorful.checked) return true;

    //Ha mindegyik bejelölve, akkor felesleges a szűrés
    if(colorWhite.checked && colorBlack.checked && colorColorful.checked) return true;

    for(let i = 0; i < termek["colors"].length;i++){
        if(colorWhite.checked && termek["colors"][i] == "Fehér") return true;
        if(colorBlack.checked && termek["colors"][i] == "Fekete") return true;
        if(colorColorful.checked){ //A színes ruhákat egy kalap alá vesszük
            if(termek["colors"][i] != "Fekete"&& termek["colors"][i] != "Fehér") return true;
        }
    }
    return false;
}

//Megvizsgálja, hogy a termék kategóriája megfelel-e a kiválasztott kategóriáknak
function isCorrectCategory(kategoria){
    if(!hasSelectedCategory()) return true; //Ha nincs kijelölve 1 termékkategória se, akkor feleslegesek a további vizsgálatok

    let selectedCategory = document.getElementsByClassName("left_sidebar_category")

    for(let i = 0;i<selectedCategory.length;i++){
        if(kategoria == selectedCategory[i].dataset.value){
            if(selectedCategory[i].classList.contains("checked")) return true;  //A termék beleesik a kijelölt kategóriákba
        }
    }
    return false; //A termék kategóriája nem lett kijelölve
}

//Megnézi, hogy a termék mérete megfelel-e a felhasználó által megadott méretnek
function isCorrectSize(termek){
    let sizesCheckboxes = document.getElementsByClassName("size_checkbox");

    let selectedSizes = 0;

    for(let i = 0;i<sizesCheckboxes.length;i++){
        if(sizesCheckboxes[i].checked)selectedSizes++; //Ki van jelölve legalább 1 méret?
    }

    if(selectedSizes == 0)return true; //Ha nincs kijelölve 1 méret se, akkor nincs értelme a további vizsgálatoknak, mert valójában nem szűrtünk

    for(let i = 0;i<sizesCheckboxes.length;i++){ //Végigmegyünk a méreteken
        if(sizesCheckboxes[i].checked){ //Megnézzük, hogy a méret ki van-e jelölve
            if(termek["sizes"].includes(sizesCheckboxes[i].dataset.value)) return true; //Ha a méret ki van jelölve és az adott termék tartalmazza az éppen vizsgált méretet
        }
    }

    return false; //Nincs olyan méretben a termék, ami(k) ki vannak jelölve
}

function clearFilters(){
    maxPriceFont.innerHTML = Number(maxPriceInput.value).toLocaleString('hu-HU', {style: 'currency', currency: 'HUF'});
    searchByInput.value = "";
    colorWhite.checked = false;
    colorBlack.checked = false;
    colorColorful.checked = false;


    searching()
}

//https://tenor.com/view/chrissy-costanza-gif-18024956