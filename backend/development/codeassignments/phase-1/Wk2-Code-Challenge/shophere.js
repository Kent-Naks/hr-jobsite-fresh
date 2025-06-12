//Let function allows a change of the shopping list below
let shoppingList = [
    'Ngwashe',
    'Ndoma',
    'Sausage',
    'Bread'
];

//addItemToList('Nyama Choma');

function addItemToList(item) {
    shoppingList.push(item);
}

//addItemToList only adds one item per
addItemToList('Nyama Choma')

//.push helps in adding many items at once within the list
shoppingList.push('Arrows Root','Rice','Mutura','Choma Sausage')

//Remove one element of selected index (1,1) = Ndoma Removed
shoppingList.splice(1,2) 
console.log(shoppingList)






