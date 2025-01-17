let productName =document.getElementById("productName")
let productPrice =document.getElementById("productPrice")
let productImage =document.getElementById("productImage")
let productCategory =document.getElementById("productCategory")
let productStock =document.getElementById("productStock")
let productDiscription =document.getElementById("productDiscription")
let searchInput =document.getElementById("searchInput")
let updateptn = document.getElementById("updateptn")
let addptn = document.getElementById("addptn")

let productList = [] ;
if (localStorage.getItem("list")) {
    productList = JSON.parse(localStorage.getItem("list"));
    displayProduct(productList);
  }

function AddProduct (){

    var product ={
        name : productName.value ,
        price : Number(productPrice.value) ,
        image : productImage.files[0]?.name, 
        category : productCategory.value ,
        stock : productStock.checked ,
        discription : productDiscription.value ,
    };
    
    productList.push(product);
    localStorage.setItem("list" ,JSON.stringify(productList))
    displayProduct(productList)
    clearForm()
}


function displayProduct (List ,term){
temb = "" ;
    for (let i = 0; i < List.length; i++) {
        temb += ` <div class =" col-md-3 ">
          <div class=" productdiv text-white ">
        <img class="w-100 mb-3" src="img/${List[i].image}" alt="">
        <h3 class="ms-2">name :${term? List[i].name.replaceAll( `${term}` , `<span class="bg-dark text-white-50">${term}</span>`): List[i].name} </h3>
        <h4 class="ms-2">price :${List[i].price}</h4>
        <p class="ms-2">category :${List[i].category} </p>
        <p class="ms-2">Stock: ${List[i].stock ? "In Stock" : "Out of Stock"}</p>
        <p class="ms-2">discription : ${List[i].discription}</p>
          <div class="text-center mt-3 mb-2">
    <button  onclick="setFormForUpdate(${i})" type="button" class="btn btn4 me-2">Update</button>
    <button onclick="deletproduct(${(i)})" type="button" class="btn btn5 ">delete</button>

  </div>

    </div></div>`
    }
    document.getElementById('myRow').innerHTML = temb ;
}

function clearForm(){


    productName.value = "";
    productPrice.value = "";
    productImage.value = "";
    productCategory.value = "";
    productStock.checked = false;
    productDiscription.value = "";
}


function deletproduct(x) {
  productList.splice(x , 1)

displayProduct (productList)
localStorage.setItem("list" , JSON.stringify(productList))
}


function searchproduct (){

    var searchList = [] ;
    const searchTerm = searchInput.value.toLowerCase();
    for (let i = 0; i < productList.length; i++) {

        if(productList[i].name.toLowerCase().includes(searchTerm)){

            searchList.push(productList[i])
        }
    }
    displayProduct (searchList ,searchInput.value)

}

var updatedindex ;

function setFormForUpdate(i){
    updatedindex = i ;
    updateptn.classList.remove("d-none")
    addptn.classList.add("d-none")

    productName.value =productList[i].name ;
    productPrice.value =productList[i].price ;
    productDiscription.value =productList[i].discription ;
    productCategory.value =productList[i].category ;
}

function updateproduct (){

    updateptn.classList.add("d-none");
    addptn.classList.remove("d-none");


    productList[updatedindex].name = productName.value ;
    productList[updatedindex].price = productPrice.value ;
    productList[updatedindex].discription = productDiscription.value ;
    productList[updatedindex].category = productCategory.value ;

    clearForm();
    localStorage.setItem("list" ,JSON.stringify(productList))
    displayProduct(productList)

}