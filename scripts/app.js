// budget controller //
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            // create new id //
            ID = data.allItems[type].length > 0 ? data.allItems[type][data.allItems[type].length - 1].id + 1 : 0;
            // create new id //




            // create new item  inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // push it into our data struct
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;

        },

        calculateBudget: function () {
            // calculate total income and expenses // 
            calculateTotal('exp');
            calculateTotal('inc');


            // calculate the budget: income - expenses //
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent //
            data.percentage = data.totals.inc > 0 ? Math.round((data.totals.exp / data.totals.inc) * 100) : -1;

        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log('data ---', data);
        }
    }
})();

// ui controller //
let UIController = (function () {
    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'


    }
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        addListItem: function (obj, type) {
            let html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function () {
            let fieldsArray;
            // get all fields //
            const fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArray = Array.from(fields);
            // turn to array to clean
            fieldsArray.forEach((element, i) => {
                element.value = '';
            });

            // after clean focus in the input value 
            fieldsArray[0].focus();

        },

        displayBudget: function (obj) {
            console.log('obj no displayBudget --', obj);
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            document.querySelector(DOMstrings.percentageLabel).textContent =
                obj.percentage > 0 ? document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%' :
                document.querySelector(DOMstrings.percentageLabel).textContent = '--'


        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    }
})();

//global app controller // 
var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListeners = function () {
        let DOM = UIController.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function () {
        // 1. calculate the budget 
        budgetCtrl.calculateBudget();
        // 2. return the badget
        let budget = budgetCtrl.getBudget();
        // 2. Display the budget
        UICtrl.displayBudget(budget);

    }
    var ctrlAddItem = function () {
        let input, newItem;
        // 1. get the field input data 
        input = UICtrl.getInput();
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // clear the fields //
            UICtrl.clearFields();

            // 4. calculate and update budget
            updateBudget();

        }

    };

    var ctrlDeleteItem = function (event) {
        // get access to parent node icon until the div-- id
        let itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            let splitID = itemID.split('-');
            let type = splitID[0];
            let ID = splitID[1];

            // 1. delete the item from the data structure 

            // 2 .delete item from the UI

            // 3. update and show the new budget
        }
    }

    return {
        init: function () {
            console.log(' app started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

// call the init // 
controller.init();