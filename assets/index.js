async function f(url = '',method = 'POST',headers = {}, data ) {

    return await new Promise(async (resolve, reject) => {

        if(method === ('POST' || 'PUT' || 'PATCH')) {
            let response = await fetch(url, {
                method: method,
                mode: 'cors',
                headers: headers,
                body: JSON.stringify(data)
            });
            let result = await response;
            result.ok ? resolve(await response.json()) : reject( await response.json())
        } else {
            let response = await fetch(url, {
                method: method,
                mode: 'cors',
                headers: headers,
            });
            let result = await response;
            result.ok
                ? resolve( (method === 'DELETE')
                    ? await response
                    : await response.json())
                : reject( await response.json())
        }




    })

}

async function ff(url = '',method = 'POST',headers = {}, data ) {

    return await new Promise(async (resolve, reject) => {

        let response = await fetch(url, {
            method: method,
            mode: 'cors',
            headers: headers,
            body: data
        });

        let result = await response;
        result.ok ? resolve(await response.json()) : reject( await response.json())

    })

}

let app = new Vue({
    el: '#app',
    data:{
        api: 'http://wsr-1/api',
        navigation: {
            currentPage: 'registration'
        },
        auth: {
            isAuth: false,
            token: ''
        },
        home: {
            photos: [],
        },
        registration: {
            first_name: '',
            phone: '',
            surname: '',
            password: '',
        },
        login: {
            phone: '',
            password: '',
        },
        ChangedPhoto: null,
        resize: {
            w: 100,
            h: 100
        },
        selectedPhotos: [],
        search: '',
        findedUsers:[],
        selectedUserId: null
    },
    computed:{

    },
    watch: {
        'resize.h': function(hz, zh) {
            this.draw()
        },
        'resize.w': function(hz, zh) {
            this.draw()
        },

    },
    methods: {
        isPage(page) {
            return page === this.navigation.currentPage;
        },
        toPage(page) {
            this.navigation.currentPage = page;
        },
        /**
         * Удаление фотографии
         *
         * @param id
         */
        deletePhotoRequest(id){
            f(`${this.api}/photo/${id}`, 'DELETE', {
                'Authorization': this.auth.token
            }).then(r => {
                console.log(r);
                alert('Фотогрфия удалена')
            }).catch(err => {
                console.log(r);
                alert('Ошибка при удалении фотогрфаии')
            }).finally(() => {
                this.getPhotos()
            })
        },
        /**
         * Регистрация
         *
         * @returns {Promise<void>}
         * @constructor
         */
        async LoginAction() {
            f(`${this.api}/signup`, 'POST',{
                'Content-Type': 'application/json'
            },{
                first_name: this.registration.first_name,
                phone: this.registration.phone,
                surname: this.registration.surname,
                password: this.registration.password,
            }).then(res => {
                alert('Регистрация прошла успешно');
                this.toPage('authorization')
            }).catch(e => {
                console.log(e);
                alert('Произошла ошибка: ' + Object.values(e).pop())
            })
        },
        /**
         * Авторизация
         *
         * @returns {Promise<void>}
         */
        async actionLogin() {
            f(`${this.api}/login`, 'POST', {
                'Content-Type': 'application/json'
            },{
                phone: this.login.phone,
                password: this.login.password,
            }).then(res => {
                alert('Авторизация прошла успешно');
                this.auth.isAuth = true;
                this.auth.token = res.token;

                localStorage.setItem('token', res.token);
                this.toPage('home')
            }).catch(e => {
                alert('Произошла ошибка: ' + Object.values(e).pop())
            })
        },
        /**
         * Загрузка картинки
         *
         */
        async loadImage() {

            let fd = new FormData();
            fd.append('photo', document.querySelector('#imageLoader').files[0]);
            fd.append('photo1', 'asd');
            console.log(document.querySelector('#imageLoader').files[0]);
            ff(`${this.api}/photo`, 'POST', {
                'Authorization': this.auth.token
            },fd).then(res => {
                alert('Фотография загружена')
            }).catch(e => {
                alert('Произошла ошибка' + Object.values(e).pop())
            })

        },
        /**
         * Получение фотографий
         *
         */
        async getPhotos() {
            f(`${this.api}/photo`, 'GET', {
                'Authorization': this.auth.token
            }).then(r => {
                this.home.photos = r;
            }).catch(e => {
                console.log(e)
            });
        },
        /**
         * Поиск пользователей
         *
         * @returns {Promise<void>}
         */
        async findUsersRequest() {

            f(`${this.api}/user?search=${this.search}`, 'GET', {
                'Authorization': this.auth.token
            }).then(r => {
                this.findedUsers = r.users;
            }).catch(e => {
                console.log(e)
            }).finally(() => {

            });

        },
        /**
         * Рашарить
         */
        async shareRequest(){
            f(`${this.api}/user/${this.selectedUserId}/share`, 'POST', {
                'Authorization': this.auth.token,
                'Content-Type': 'application/json'
            }, {
                photos: this.selectedPhotos
            }).then(r => {
                alert('Фотографии расшарены')
            }).catch(e => {
                alert('Ошибка')
            }).finally(() => {

            })
        },
        logout(){
            this.auth.isAuth = false;
            this.auth.token = null;
            localStorage.removeItem('token');
            this.toPage('authorization')
        },
        loginUp() {
            if(localStorage.getItem('token')){
                this.auth.isAuth = true;
                this.auth.token = localStorage.getItem('token');
                this.toPage('home')
            }
        }
    },

});

app.loginUp();
