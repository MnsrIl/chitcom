const tokenFromCookie = document.cookie // eslint-disable-next-line
    .replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")

const initialState = {
    isSigningUp : Boolean(false),
    isSigningIn : Boolean(false),
    isSignedIn : Boolean(!!tokenFromCookie),
    error: null,
    token: tokenFromCookie || null,
    success: null,
    myData: null
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        //Уборщик
        case "auth/data/clear" :
            return {...state, isSigningUp: false, isSigningIn: false,
                isSignedIn: false, success: null, token: null, error: null}
        //Уборщик, если вход был выполнен
        case "auth/data/loginClear" :
            return {...state, error: null, isSigningIn: false, success: null, isSignedIn: true}

        //Выход из аккаунта
        case "auth/signOut" : {
            document.cookie = `token=; path=/;`;
            return {...state, token: null, isSignedIn: false, myData: null}
        }

        case "auth/loadUser/pending" :
            return {...state, userLoading: true};
        case "auth/loadUser/rejected" :
            return {...state, error: action.error, userLoading: false}
        case "auth/loadUser/fulfilled" :
            return {...state, myData: action.payload, userLoading: false}

        //Авторизация
        case "auth/logIn/pending" :
            return {...state, error: null, success: null, isSigningIn: true}
        case "auth/logIn/rejected" :
            return {...state, error: action.error}
        case "auth/logIn/fulfilled" : {
            return {...state, success: action.success, token: action.token}
        }

        //Регистрация
        case "auth/signUp/pending" :
            return {...state, error: null, success: null, isSigningUp: true}
        case "auth/signUp/rejected" :
            return {...state, error: action.error}
        case "auth/signUp/fulfilled" :
            return {...state, success: action.success}

        default:
            return state
    }
}

const fetchOptions = (method = "GET", data) => ({
    method,
    body: JSON.stringify(data),
    headers: { "Content-Type" : "application/json" }
})

export const signUp = (data) => async (dispatch) => {

    const formData = new FormData();
    const { avatar_URI } = data;

    for(let key in data) { //Для каждого ключа из объекта finalUserData запускается цикл, который будет вставлять ключ в форм-дату\
        if (key === 'avatar_URI' && avatar_URI) {
            formData.set("image", avatar_URI[0]);
        } else {
            formData.set(key, data[key])
        }
    }
    dispatch({type: "auth/signUp/pending"});

    const res = await fetch("/signup", {
        method: "POST",
        body: formData,
    });
    const json = await res.json();

    if (json.error) {
        dispatch({type: "auth/signUp/rejected", error: json.error});
    } else {
        const successMessage = " Вы будете автоматически переправлены на страницу авторизации";
        dispatch({type: "auth/signUp/fulfilled", success: json.success + successMessage});
    }
}


export const logIn = (login, password) => async (dispatch) => {
    dispatch({type: "auth/logIn/pending"});

    const res = await fetch("/signin", fetchOptions("POST", {login, password}));
    const json = await res.json();

    if (json.error) {
        return dispatch({type: "auth/logIn/rejected", error: json.error});
    } else {
        const {success, token, expires} = json;
        const successMessage = success + " Вы будете автоматически перенаправлены на главную страницу";

        dispatch({type: "auth/logIn/fulfilled", success: successMessage, token: `Bearer ${token}` });
        document.cookie = encodeURIComponent("token") + `=Bearer ${token};expires=${expires}; path=/;`;
        loadUserData();
    }
}

export const SignOut = () => async(dispatch, getStore) => {
    const store = getStore();

    const res = await fetch("/signout", {
        method: "POST",
        headers: {
            Authorization: store.auth.token
        }});
    const json = await res.json();
    console.log(json, res);
}


export const loadUserData = () => async (dispatch, getStore) => {
    const store = getStore();
    console.log(store.auth.isSignedIn)
    if (!store.auth.isSignedIn) {
        return;
    }

    dispatch({ type: "auth/loadUser/pending" });

    const response = await fetch("/user-profile", {
        method: "GET",
        headers: {
            Authorization: store.auth.token,
        },
    });
    const json = await response.json();

    if (json.error) {
        dispatch({ type: "auth/loadUser/rejected", error: json.error });
    } else {
        dispatch({ type: "auth/loadUser/fulfilled", payload: json.user });
    }
};

export default reducer;