/*jshint esnext: true, moz: true*/
/*jslint browser:true */

//==================================================================================
//Globals
var keyIcon = document.getElementById("APIKey");
var googleKey = "AIzaSyARJ9GmJJDiBUq8QyKcBh2op17EWEVf8rU";
var plusIcon = document.getElementById("plus");
var closeAllBooks = document.getElementById("closeAllBooks");
var lookingGlass = document.getElementById("lookingGlass");
var title = document.getElementsByClassName("addTitle");
var author = document.getElementsByClassName("addAuthor");
var arrowL = document.getElementsByClassName("arrowL")[0];
var arrowR = document.getElementsByClassName("arrowR")[0];
var bookList = document.getElementById("bookList");
var allBooks = document.getElementById("allBooks");
var APIKey = localStorage.getItem("APIKey");
var row = document.getElementById("row");
var searchContainer = document.getElementById("searchContainer");
var searchBar = document.getElementById("searchBar");
var allBooksData;
var googleBooksData;

//===========================================================
//Media Queries

//---------------------------------------------
//Max Width 925px
if (matchMedia) {
  var mqm = window.matchMedia( "(max-width: 925px)");
  mqm.addListener(WidthChangeMedium);
  WidthChangeMedium(mqm);
}

function WidthChangeMedium(mqm) {
  if (mqm.matches) {
     bookList.className ="shelfIcons fa fa-book fa-3x";
        lookingGlass.className ="shelfIcons fa fa-search fa-3x";
        keyIcon.children[0].className = "keyIcon fa fa-key fa-4x";
  } else {
     bookList.className ="shelfIcons fa fa-book fa-4x";
        lookingGlass.className ="shelfIcons fa fa-search fa-4x";
        keyIcon.children[0].className = "keyIcon fa fa-key fa-5x";
  }

}
//------------------------------------------
//Max Width 630px
if (matchMedia) {
  var mqs = window.matchMedia( "(max-width: 630x)");
  mqs.addListener(WidthChangeSmall);
  WidthChangeSmall(mqs);
}

function WidthChangeSmall(mqs){
    if(mqs.matches){
        
    }else{
        
    }
}

//==================================================================================
//main
validateKey(APIKey);
hideAndUnHideBooks("onresize",window);
hideAndUnHideBooks("onload",window);
getAllBooks();
findBooks(searchBar);

//==================================================================================
//Callback

keyIcon.addEventListener("click", getAPIKey);
plusIcon.addEventListener("click", newBook);
arrowL.addEventListener("click", bookSlider);
arrowR.addEventListener("click", bookSlider);
bookList.addEventListener("click", ()=>{
    
    getAllBooks();
    allBooks.style.display = "flex";
});
closeAllBooks.addEventListener("click", ()=>{
    allBooks.style.display = "none";
});
searchContainer.addEventListener("mouseover", showSearchBar);
searchContainer.addEventListener("mouseout", showSearchBar);
lookingGlass.addEventListener("click", findBooksOnline);

//==================================================================================
//functions

//---------------------------------------
//Get books from google

function searchExternalBooks(searchWord,key,callback){
    ajaxCall("GET","https://www.googleapis.com/books/v1/volumes?q="+searchWord+"&key="+key,callback);
}
function searchResults(results){
    googleBooksData = results;
    let bookResults = {title:null};
    
    bookResults.title = googleBooksData;
    if(bookResults.title !== null){
        let titleResults = bookResults.title.items;
        let title, author;
        for(let i = 0; i < titleResults.length; i++){
            title = titleResults[i].volumeInfo.title;
            author = titleResults[i].volumeInfo.authors;
            if(author !== undefined){
                addBook(APIKey,title,author[0],printResult);
                addGoogleBooks(results,title,author);
            }
        } 
    }
    console.log(bookResults);
}
function printResult(results){
    console.log(results);
}

//END
//----------------------------------------
//Search books

//search online
function findBooksOnline(){
    let key = searchBar.value.toLowerCase();
    searchExternalBooks(key,googleKey,searchResults);  
}

function addGoogleBooks(result,title,author){
    let row = document.getElementById("row");
    let lastChild;
    let firstChild = row.children[2];
    if(result.status != "error" ){
       
        //create books
        createBookCovers(title,author,result.id);
        lastChild = row.lastChild;
        row.insertBefore(lastChild, firstChild);
        isWrapped("bookCover",0,true);
        isWrapped("bookCover",1,false);
        
        
    }
    else if(result.status == "error"){
        console.log("failed: trying again");
        addBook(APIKey,title[0].value,author[1].value,addGoogleBooks);
        
    }
}

//find localy stored books
function findBooks(elm){
    let key;
    elm.addEventListener("keyup", ()=>{
        key = elm.value.toUpperCase();
        showMatchingBooks(key);
    });
}
//find matching string
function showMatchingBooks(key){
    key = key.toUpperCase();
    let bookCover = document.getElementsByClassName("bookCover");
    let title,author,keyString ="",titleString ="",authorString ="";
    let bookInfo = document.getElementsByClassName("bookInfo");
    if(bookInfo.length !== 0){
        for(let i = 0; i < bookInfo.length; i++){
            keyString="";
            titleString="";
            authorString="";
            title = bookInfo[i].children[1].textContent.toUpperCase();
            author = bookInfo[i].children[4].textContent.toUpperCase();
            if(key.length !== 0 || key !== ""){
                for(let j = 0; j < key.length; j++){
                    keyString += key[j];
                    titleString += title[j];
                    authorString += author[j];
                    if(titleString != keyString && authorString != keyString){
                        bookCover[i].style.display = "none";
                        keyString="";
                        titleString="";
                        authorString="";
                        break;
                    }
                    else{
                        bookCover[i].style.display = "flex";

                    }
                    isWrapped("bookCover",0,true);
                    isWrapped("bookCover",1,false);
                }        
            }else{
                bookCover[i].style.display = "flex";
                isWrapped("bookCover",0,true);
                isWrapped("bookCover",1,false);
            }
        }
    }
        
}
function showSearchBar(){
    let elm = searchBar;
    if(elm.hidden === true){
        elm.hidden = false;
    }
    else if(elm.hidden === false){
        elm.hidden = true;
    }
}

//END
//----------------------------------------
//Delete Books
function deleteBooksOnClick(){
    let books = document.getElementsByClassName("bookListItem");
    let listID = document.getElementsByClassName("listID");
    for(let i = 0; i < books.length; i++){
        deleteBook(books[i].children[0],listID[i].textContent);
    }
}
//delete book from slider
function deleteBook(elm,ID){
    let bookID = document.getElementsByClassName("coverID");
    elm.addEventListener("click",()=>{
        deleteID(ID);
        
        for(let i = 0; i < bookID.length; i++){
            if(ID === bookID[i].textContent){
                row.removeChild(row.children[2+i]);  
            }
        }
        elm.parentElement.textContent = "";
    });
}
//Remove book from database
function deleteID(ID){
    ajaxCall("POST","https://www.forverkliga.se/JavaScript/api/crud.php?op=delete&key="+APIKey+"&id="+ID,(result)=>{
        if(result.status == "error"){
            deleteID(ID);
            console.log(JSON.stringify(result));
        }
    });
}
//END
//----------------------------------------
//Update Books
function updateBookInfo(ID,title,author){
     ajaxCall("POST","https://www.forverkliga.se/JavaScript/api/crud.php?op=update&key="+APIKey+"&id="+ID+"&title="+title+"&author="+author,(result)=>{
            if(result.status == "error"){
                updateBookInfo(ID,title,author);
            }
        });
}
function inputFields(elm,inputAuthor,infoAuthor,inputTitle,infoTitle,updateBook){
    let timeout = null;
    elm.addEventListener("mouseover",()=>{
        timeout = setTimeout(()=>{
            inputAuthor.style.display = "block";
            infoAuthor.style.display = "none";
            inputTitle.style.display = "block";
            infoTitle.style.display = "none";
            inputTitle.value = infoTitle.textContent;
            inputAuthor.value = infoAuthor.textContent;
            if(updateBook.style.display != "inline-block"){
                updateBook.style.display = "inline-block";
            }
        },1000);
    });
    elm.addEventListener("mouseout",()=>{
        clearTimeout(timeout);
    });
}
//END
//----------------------------------------
//Print All Books
function getAllBooks(){
    ajaxCall("GET", "https://www.forverkliga.se/JavaScript/api/crud.php?op=select&key="+APIKey,printBooks);
}
function printBooks(result){
    let allBooks = document.getElementById("allBooks");
    let div = allBooks.children[1];
    allBooksData = result;
    div.textContent = "";
    if(result.status == "success"){
        
        //Print books
        for(let i = 0; i < result.data.length; i++){
            //Add new book in list
            div.appendChild(printLayout(result,i));
        }
        //delete books when X is clicked
        deleteBooksOnClick();
        
        //empty slider
        emptySlider();
        //add books to slider
        createBooksSlider(result);
        
    }else{
        getAllBooks();
    }
}


//Print book
function printLayout(result,index){
    let data;
    let book;
    if(result.data.length === 0){
        return "Sorry, No Books In Library.";
    }
    data = result.data[index];
    book = newElement("p");
    book.innerHTML = `<i class="deleteIcon fa fa-times" aria-hidden="true"></i> <b>#:</b><span class="listID">${data.id}</span> <b>Title:</b>${data.title} <b>Author:</b>${data.author} <b>Updated Last:</b>${data.updated}`;
    book.className = "bookListItem";
    return book;
} 
//END
//----------------------------------------------
//Slider
function bookSlider(e){
    let target = e.target.className;
    let lastChild = row.lastChild;
    let firstChild = row.children[2];
    
    if(target == "arrow arrowR"){
        row.appendChild(firstChild);
    }else{
        row.insertBefore(lastChild, firstChild);
    
    }
    
    isWrapped("bookCover",0,true);
    isWrapped("bookCover",1,false);
}


//delete all books in slider
function emptySlider(){
    let books = row.children;
    for(let i = 1; i < books.length; i++){
        row.removeChild(books[i]);  
    }
}

//input new book values
function newBook(){
    if(plusIcon.style.color != "gold"){
        plusIcon.style.color = "gold";
        title[0].hidden = false;
        title[1].hidden = true;
        author[1].hidden = false;
        author[0].hidden = true;        
    }
    else if(plusIcon.style.color == "gold" && title[0].value !== "" &&
      author[1].value !== ""){
        plusIcon.style.color = "#740101";
        title[0].hidden = true;
        title[1].hidden = false;
        author[1].hidden = true;
        author[0].hidden = false;
        
        //add new book to slider
        addBook(APIKey,title[0].value,author[1].value,addSucessful);       
    }else{
        plusIcon.style.color = "#740101";
        title[0].hidden = true;
        title[1].hidden = false;
        author[1].hidden = true;
        author[0].hidden = false; 
    }
    
}
//Add New Book
function addBook(key, title, author,callback){
    ajaxCall("POST","https://www.forverkliga.se/JavaScript/api/crud.php?op=insert&key="+key+"&title="+title+"&author="+author,callback);
    hideAndUnHideBooks("onClick",plusIcon);
}
function addSucessful(result){
    let row = document.getElementById("row");
    let lastChild;
    let firstChild = row.children[2];
    if(result.status != "error" ){
        console.log("sucess!!!");
        
        //create books
        createBookCovers(title[0].value,author[1].value,result.id);
        lastChild = row.lastChild;
        row.insertBefore(lastChild, firstChild);
        isWrapped("bookCover",0,true);
        isWrapped("bookCover",1,false);
        title[0].value = "";
        author[1].value = "";
    }
    else if(result.status == "error"){
        console.log("failed: trying again");
        addBook(APIKey,title[0].value,author[1].value,addSucessful);
        
    }
}
//detect wrapped or unwrapped items
function isWrapped(className, opacity, wrapped) {
  let topItem = {};
  let currItem = {};
  let addBooks = document.getElementById("addBook");    
  let items = document.getElementsByClassName(className);
  let bookPic;
  for (let i = 0; i < items.length; i++) {
    currItem = items[i].getBoundingClientRect();
    topItem = addBooks.getBoundingClientRect();
    bookPic = items[i].children[1];
    if ((currItem.top === topItem.top) !== wrapped) {
        items[i].style.opacity = opacity;
        if(wrapped){
            bookPic.style.height = "0";
        }
        else if(!wrapped){
            if(mqm.matches){
                bookPic.style.height = "200px";
            }else{
                bookPic.style.height = "300px";
            }
        }
    }
  }
}
//Hide and unHide bookItems
function hideAndUnHideBooks(method,target){
    target[method] = () => {
        isWrapped("bookCover",0,true);
        isWrapped("bookCover",1,false);
    };
}
//create amount of books for slider
function createBooksSlider(result){
    let data = result.data;
    let amount = data.length;
    let title,author,ID,titleSeen;
    for(let j = 0; j < amount; j++){
        titleSeen = false;
        title = data[j].title;
        author = data[j].author;
        ID = data[j].id;
        for(let i = 0; i < amount.length; i++){
            if(title == data[i].title && i !== j){
                titleSeen = true;
            }
        }
        if(!titleSeen){
        createBookCovers(title,author,ID);
            isWrapped("bookCover",0,true);
            isWrapped("bookCover",1,false);
            
        }
    }
}
//END
//---------------------------------------
//Create bookItems
function createBookCovers(title, author, id){
    let row = document.getElementById("row");
    var bookCover, bookInfo, infoTitle, infoAuthor, infoID, coverPic, inputTitle,
        inputAuthor, updateBook;
    
    //create
    row.appendChild(newElement("div"));

    bookCover = row.lastChild;
    bookCover.className = "bookCover";
    bookCover.appendChild(newElement("div"));
    bookCover.appendChild(newElement("img"));

    coverPic  = bookCover.children[1];
    coverPic.className = "coverPic";

    bookInfo = bookCover.children[0];
    bookInfo.className = "bookInfo";
    bookInfo.appendChild(newElement("textarea"));
    bookInfo.appendChild(newElement("h3"));
    bookInfo.appendChild(newElement("i"));
    bookInfo.appendChild(newElement("input"));
    bookInfo.appendChild(newElement("h5"));
    bookInfo.appendChild(newElement("h6"));

    inputTitle = bookInfo.children[0];
    infoTitle = bookInfo.children[1];
    updateBook = bookInfo.children[2];
    inputAuthor = bookInfo.children[3];
    infoAuthor = bookInfo.children[4];
    infoID = bookInfo.children[5];
    
    inputTitle.className = "coverInputTitle";
    infoTitle.className = "coverTitle";
    inputAuthor.className = "coverInputAuthor";
    infoAuthor.className = "coverAuthor";
    
    infoID.className = "coverID";
    
    //CSS
    
    inputTitle.style.display = "none";
    inputTitle.style.height = "60px";
    inputTitle.style.width = "140px";
    inputTitle.style.margin = "auto";
    inputTitle.style.transform = "rotate(-2deg)";
    inputTitle.style.marginTop = "34px";
    inputTitle.style.marginBottom = "0px";
   
    
    updateBook.className = "updateBook fa fa-check fa-5x";
    updateBook.style.ariaHidden = "true";
    updateBook.style.display = "none";
    updateBook.style.color ="gold";
    updateBook.style.cursor ="pointer";
    
    inputAuthor.style.display = "none";
    inputAuthor.style.width = "140px";
    inputAuthor.style.margin = "auto";
    inputAuthor.style.transform = "rotate(5deg)";
    inputAuthor.style.marginTop = "40px";
    inputAuthor.style.marginBottom = "10px";
    

    infoTitle.style.height = "60px";
    infoTitle.style.width = "130px";
    infoTitle.style.margin = "auto";
    infoTitle.style.transform = "rotate(-2deg)";
    infoTitle.style.marginTop = "40px";
    infoTitle.style.marginBottom = "120px";

    infoAuthor.style.transform = "rotate(5deg)";
    infoAuthor.style.margin = "auto";
    infoAuthor.style.marginTop = "40px";
    infoAuthor.style.marginBottom = "10px";
    infoAuthor.style.width = "150px";

    infoID.style.transform = "rotate(4deg)";
    infoID.style.marginTop = "10px";
    infoID.style.margin = "auto";
    
    //content
    coverPic.alt = "coverImg";
    coverPic.src= "img/bookCover.png";
    infoTitle.textContent = title;
    infoAuthor.textContent = author;
    infoID.textContent = id;
    
    //Edit Book input fields
    inputFields(infoTitle,inputAuthor,infoAuthor,inputTitle,infoTitle,updateBook);  inputFields(infoAuthor,inputAuthor,infoAuthor,inputTitle,infoTitle,updateBook);
    
    //update books on click
    updateBook.addEventListener("click", ()=>{
        updateBookInfo(infoID.textContent,inputTitle.value,inputAuthor.value);
        inputTitle.style.display = "none";
        inputAuthor.style.display = "none";
        updateBook.style.display = "none";
        infoTitle.style.display = "block";
        infoAuthor.style.display = "block";
        infoTitle.textContent = inputTitle.value;
        infoAuthor.textContent = inputAuthor.value;
    });
    
}
//END
//-------------------------------------------


//Create new Element
function newElement(elm){
    return document.createElement(elm);
}

//AJAX Call
function ajaxCall(method, url, callback){
    let xml = new XMLHttpRequest();
    xml.onreadystatechange =()=>{
        if(xml.status == 200 && xml.readyState == 4){
            let response = JSON.parse(xml.responseText);
            console.log(response);
            callback(response);
        }
        else if(xml.status > 400){
            console.log(`Error: ${xml.responseText}`);
        }
    };
    xml.open(method, url);
    xml.send();
}

//Save API Key
function getAPIKey(){
    ajaxCall("GET", "https://www.forverkliga.se/JavaScript/api/crud.php?requestKey",saveAPIKey);
}
function saveAPIKey(result){
    console.log(`set new key: ${result.key}, old key: ${localStorage.getItem("APIKey")}`);
    localStorage.setItem("APIKey",result.key);
    APIKey = localStorage.getItem("APIKey");
}
function validateKey(key){
 if(key === null){
     localStorage.setItem("APIKey","000000");
 }   
}