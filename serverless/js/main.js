let mealsState = []
let ordersState = []
let ruta = 'login' //login, register, orders

const getToken = () => { return localStorage.getItem('token') }

const stringToHTML = (s) => {  
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html')
    return doc.body.firstChild
}

const renderItem = (item) => {  
    const element = stringToHTML(`<li data-id="${item._id}">${item.name}</li>`) //template string con ``
    element.addEventListener('click', () => {   //escuchador de eventos al hacer click
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')   //agrega una clase al html
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
    })
    return element
}

const renderOrder = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)  //find() sirve para buscar un metodo en un arreglo, recibe un elemento de meal (meal), recorre hasta q encuentre un elemento o se termine
    const element = stringToHTML(`<li data-id="${order._id}">${meal.name} - ${order.user_id}</li>`) 
    element.addEventListener('click', () => {   //escuchador de eventos al hacer click
        const ordersList = document.getElementById('orders-list')
        Array.from(ordersList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')   //agrega una clase al html
        const ordersIdInput = document.getElementById('orders-id')
        ordersIdInput.value = order._id
    })
    return element
}

const removeSelectedFromChildrens = (item) => {
    const element = document.getElementById(item)
    Array.from(element.children).forEach(x => x.classList.remove('selected'))
}

const selectedOrder = (orderId) => {
    const elemento = document.querySelectorAll(`[data-id="${orderId}"]`)
    return elemento
}

const inicializaFormulario = () => {
    const orderForm = document.getElementById('order')
    const ordersForm = document.getElementById('orders')
    const logOut = document.getElementById('logout')

    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value
        if (!mealIdValue) {
            alert('Debe seleccionar un plato')
            submit.removeAttribute('disabled')
            return
        }
        const order = {
            meal_id: mealIdValue,
            user_id: 'canchito'
        }

        fetch('https://serverless-mlarotonda.vercel.app/api/orders', {
            method: 'POST', //se indica el metodo porque el por defecto es get
            headers: {
                'Content-Type': 'application/json',
                authorization: getToken(),
            },
            body: JSON.stringify(order)  //body no recibe objetos de js sino q recibe string
        }).then(x => x.json())
        .then(respuesta => {
            ordersState.push(respuesta)
            const renderedOrder = renderOrder(respuesta, mealsState)
            const ordersList = document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
            removeSelectedFromChildrens('meals-list')
            mealId.removeAttribute('value') 
        })
    }

    ordersForm.onsubmit = (d) => {
        d.preventDefault()
        const remove = document.getElementById('delete')
        remove.setAttribute('disabled', true)
        const orderId = document.getElementById('orders-id')
        const orderIdValue = orderId.value
        if (!orderIdValue) {
            alert('Debe seleccionar una orden')
            remove.removeAttribute('disabled')
            return
        }
        fetch('https://serverless-mlarotonda.vercel.app/api/orders/' + orderIdValue, {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json',
                authorization: getToken(),
            }
        }).then(() => {
            const renderedOrder = selectedOrder(orderIdValue)
            renderedOrder[0].parentNode.removeChild(renderedOrder[0])
            remove.removeAttribute('disabled') 
            orderId.removeAttribute('value') 
        })
    }

    logOut.onclick = () => {
        localStorage.removeItem('token')
        renderApp()
    }
}

const inicializaDatos = () => {
    fetch('https://serverless-mlarotonda.vercel.app/api/meals') //fetch permite llamar rutas o url e interpretar lo q devuelve
        .then(response => response.json())  //siempre tiene que ir el response
        .then(data => {
            mealsState = data
            document.getElementById('submit').removeAttribute('disabled')
            document.getElementById('delete').removeAttribute('disabled')
            const mealsList = document.getElementById('meals-list')  
            const listItems = data.map(renderItem)
            mealsList.removeChild(mealsList.firstElementChild)
            listItems.forEach (element => mealsList.appendChild(element)) //iterar en la lista de items y va agregando
            fetch('https://serverless-mlarotonda.vercel.app/api/orders')
                .then(response => response.json())
                .then(ordersData => {
                    ordersState = ordersData
                    const ordersList = document.getElementById('orders-list')
                    const listOrders = ordersData.map(orderData => renderOrder(orderData, data))
                    ordersList.removeChild(ordersList.firstElementChild)
                    listOrders.forEach(element => ordersList.appendChild(element))
                })
        })
}

const renderApp = () => {
    const token = getToken()
    if(token) { return renderOrders(); }
    renderLogin()
}

const renderOrders = () => {
    const ordersView = document.getElementById('orders-view')   //si me devuelve un token, llamo a la plantilla de orders
    document.getElementById('app').innerHTML = ordersView.innerHTML
    inicializaFormulario()
    inicializaDatos()
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML
    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (e) => {
        e.preventDefault()  //previene evento para q la pag no sea refrescada
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        fetch('https://serverless-mlarotonda.vercel.app/api/auth/login', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password})  
        })  .then(x => x.json())
            .then(respuesta => {
                if(respuesta.token){
                    localStorage.setItem('token', respuesta.token)  //guardando en localStorage podemos saber si cuando refrescamos la app si el usuario inicio sesion o no
                    ruta = 'orders'
                    return respuesta.token
                } else {
                    console.log(respuesta.errorMessage)
                    document.getElementById('errorMessage').innerHTML = respuesta.errorMessage
                }
            })
            .then(token => {    
                return fetch('https://serverless-mlarotonda.vercel.app/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: token,
                    },
                })
            })
            .then(x => x.json())
            .then(user => {
                console.log(user)
                renderApp()
            })
    }
    
}

window.onload = () => {
    renderApp()
}